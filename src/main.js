import './style.css'
import * as items from './data/items.js'
import * as zones from './data/zones.js'
import * as deathMessages from './data/deathMessages.js'
import * as talentTrees from './data/talentTrees.js'
import * as tooltips from './data/tooltips.js'
import * as adminPanel from './data/adminPanel.js';
import * as combat from './data/combat.js';

// Global variable to track Shift key state
let isShiftPressed = false;

// Global variables to track current tooltip state
let currentTooltipItem = null;
let currentTooltipEvent = null;

// -------------------------Admin Panel-------------------------

// Admin panel state
let adminPanelVisible = false;
let guaranteedDropsEnabled = false;

// Listen for 'poop' sequence
let adminKeyBuffer = '';
document.addEventListener('keydown', (e) => {
  if (adminPanelVisible) return;
  adminKeyBuffer += e.key.toLowerCase();
  if (adminKeyBuffer.length > 4) adminKeyBuffer = adminKeyBuffer.slice(-4);
  if (adminKeyBuffer === 'poop') {
    adminPanelVisible = adminPanel.showAdminPanel();
    setTimeout(() => { adminKeyBuffer = ''; }, 100);
  }
});

// Admin panel button logic
document.addEventListener('click', (e) => {
  if (!adminPanelVisible) return;
  const panel = document.getElementById('admin-panel');
  if (!panel.contains(e.target)) return;
  if (e.target.id === 'admin-close') {
    adminPanelVisible = adminPanel.hideAdminPanel();
  } else if (e.target.id === 'admin-give-levels') {
    const val = parseInt(document.getElementById('admin-levels').value);
    if (!isNaN(val) && val > 0) {
      for (let i = 0; i < val; i++) game.levelUp();
      game.player.xp = 0;
      game.addToInventory(items.generateRandomItemForZone(['legendary'], 1));
      game.addLogMessage(`Admin: Gave ${val} level(s)`, 'system');
      updateUI();
    }
  } else if (e.target.id === 'admin-give-gold') {
    const val = parseInt(document.getElementById('admin-gold').value);
    if (!isNaN(val) && val > 0) {
      game.player.gold += val;
      game.addLogMessage(`Admin: Gave ${val} gold`, 'system');
      updateUI();
    }
  }
});

// Guaranteed drops toggle
document.addEventListener('change', (e) => {
  if (!adminPanelVisible) return;
  if (e.target.id === 'admin-guaranteed-drops') {
    guaranteedDropsEnabled = e.target.checked;
    game.addLogMessage(`Admin: Guaranteed drops ${guaranteedDropsEnabled ? 'enabled' : 'disabled'}`, 'system');
  }
});

// Helper function to get asset URL with proper base path handling
function getAssetUrl(path) {
  const baseUrl = import.meta.env.BASE_URL;
  // Remove leading slash from path if base URL already ends with slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return baseUrl + cleanPath;
}

// Helper function to calculate attack interval from attack speed
function calculateAttackInterval(attackSpeed, baseInterval = 2000) {
  // Attack speed reduces the base interval
  // Formula: newInterval = baseInterval / (1 + attackSpeed/100)
  // Example: 50% attack speed -> 2000ms / (1 + 0.5) = 1333ms
  const speedMultiplier = 1 + (attackSpeed / 100);
  return Math.max(500, baseInterval / speedMultiplier); // Minimum 0.5 seconds
}

// -------------------------Game State Management-------------------------
class GameState {
  constructor() {
    this.player = {
      level: 1,
      hp: 100, // Base HP
      baseHp: 100, // Base HP without talents
      maxHp: 100,
      attack: 10, // Base attack
      baseAttack: 10,
      equipmentAttack: 0,
      equipmentMaxHp: 0,
      // New stats
      attackSpeed: 0,
      critChance: 0,
      critDamage: 0,
      dodge: 0,
      blockChance: 0,
      gold: 0,
      xp: 0,
      nextLevelXp: 100, // Normal XP requirement for next level
      equipment: {
        weapon: { 
          name: 'Rusty Sword', 
          type: 'weapon', 
          rarity: 'common',
          attack: 5, 
          maxHp: 0, 
          attackSpeed: 0,
          critChance: 0,
          critDamage: 0,
          dodge: 0,
          blockChance: 0,
          price: 0, // Rusty Sword sells for 0 gold
          baseAttackInterval: 2500 // 2.5 seconds
        },
        offhand: null,
        helmet: null,
        body: null,
        legs: null,
        belt: null,
        boots: null,
        necklace: null,
        ring: null
      },
      inventory: []
    };
    
  this.currentZone = 'basement';
  this.killCount = 0;
  this.currentEnemy = null;
  this.unlockedZones = ['basement', 'restArea', 'forest']; // Ensure basement is always the first zone
  this.needsInventoryUpdate = true;
  this.needsCharacterUpdate = true;
  this.respawnTimer = {
      isActive: false,
      currentTime: 0,
      maxTime: 3000 // 3 seconds
  };
  this.combat = {
    isActive: false,
    playerTurn: true,
    lastAttackTime: 0
  };

  this.attackBars = {
    player: {
      currentTime: 0,
      maxTime: 2000 // Default 2 seconds
    },
    enemy: {
      currentTime: 0,
      maxTime: 3000 // Default 3 seconds
    }
  };

  // Activity log system
  this.activityLog = [];
  this.logFilter = 'all'; // 'all', 'combat', 'shop', 'system'
  
  // Passive systems for Knowledge talents
  this.passiveSystems = {
    studyHabits: {
      lastTick: 0,
      interval: 60000 // 60 seconds
    },
    passiveLearning: {
      lastTick: 0,
      interval: 1000 // 1 second
    },
  };
    
  // Inventory management settings
  this.inventorySettings = {
    sortBy: 'name', // 'name', 'rarity', 'type', 'attack', 'new'
    filterBy: 'all', // 'all', 'weapon', 'offhand', 'helmet', 'body', 'legs', 'boots', 'necklace', 'ring'
    autoSell: {
      enabled: false,
      rarities: {
        common: false,
        uncommon: false,
        rare: false
      },
      types: {
        weapon: false,
        offhand: false,
        helmet: false,
        body: false,
        legs: false,
        belt: false,
        boots: false,
        necklace: false,
        ring: false
      }
    }
  };
    
  this.needsInventoryUpdate = true;
  
  this.zones = zones.ZONES;
  
  // Talent Tree System
  this.talents = {
    //exploration: {},
    power: {},
    wealth: {},
    knowledge: {}
  };
  this.ascensionCount = 0;
  this.isShowingTalentTree = false;
  
  // Death message for End Run button
  this.currentDeathMessage = deathMessages.getRandomDeathMessage();
}
  
  calculateStats() {
    let totalAttack = this.getBaseAttackWithTalents(); // Base attack with talents
    //let baseMaxHp = this.getBaseMaxHpWithTalents(); // Base max HP with talents
    let baseMaxHp = this.player.baseHp;
    let equipmentAttack = 0;
    let equipmentMaxHp = 0;
    let equipmentAttackSpeed = 0;
    let equipmentCritChance = 0;
    let equipmentCritDamage = 0;
    let equipmentDodge = 0;
    let equipmentBlockChance = 0;
    
    // Apply talent bonuses to base stats
    const powerLevel1 = this.getTalentLevel('power', 'power_1');
    const powerLevel2a = this.getTalentLevel('power', 'power_2a'); // Weapon Mastery
    const powerLevel2b = this.getTalentLevel('power', 'power_2b'); // Combat Mastery
    const powerLevel3a = this.getTalentLevel('power', 'power_3a'); // Berserker Rage
    const powerLevel3b = this.getTalentLevel('power', 'power_3b'); // Precise Strikes
    const powerLevel3c = this.getTalentLevel('power', 'power_3c'); // Battle Focus
    const powerLevel4 = this.getTalentLevel('power', 'power_4');
    //totalAttack += powerLevel1 * 5; // +5 attack per level
    let talentCritChance = powerLevel2b * 2; // +2% crit per level
    let talentCritDamage = powerLevel3b * 15; // +15% crit damage per level
    let talentAttackSpeed = powerLevel3a * 10; // +10% attack speed per level
    let talentDodge = powerLevel3c * 5; // +5% dodge per level
    let talentBlockChance = powerLevel3c * 3; // +3% block per level
    
    // Weapon Mastery: +10% weapon damage per level
    if (powerLevel2a > 0) {
      totalAttack *= (1 + (powerLevel2a * 0.10));
    }
    
    if (powerLevel4 > 0) {
      totalAttack *= 1.5; // +50% damage
      talentCritChance += 25; // +25% crit chance
      talentAttackSpeed += 20; // +20% attack speed (additional)
    }

    for (const slot in this.player.equipment) {
      const item = this.player.equipment[slot];
      if (item) {
        equipmentAttack += item.attack || 0;
        equipmentMaxHp += item.maxHp || 0;
        equipmentAttackSpeed += item.attackSpeed || 0;
        equipmentCritChance += item.critChance || 0;
        equipmentCritDamage += item.critDamage || 0;
        equipmentDodge += item.dodge || 0;
        equipmentBlockChance += item.blockChance || 0;
      }
    }
    
    // Calculate level-based HP bonus (10 HP per level beyond level 1)
    const levelHpBonus = (this.player.level - 1) * 10;

    this.player.attack = totalAttack + equipmentAttack;
    this.player.maxHp = baseMaxHp + levelHpBonus + equipmentMaxHp;
    this.player.equipmentAttack = equipmentAttack;
    this.player.equipmentMaxHp = equipmentMaxHp;
    this.player.attackSpeed = equipmentAttackSpeed + talentAttackSpeed;
    this.player.critChance = equipmentCritChance + talentCritChance;
    this.player.critDamage = equipmentCritDamage + talentCritDamage;
    this.player.dodge = equipmentDodge + talentDodge;
    this.player.blockChance = equipmentBlockChance + talentBlockChance;

    // Ensure current HP doesn't exceed max HP
    if (this.player.hp > this.player.maxHp) {
      this.player.hp = this.player.maxHp;
    }
  }
  
  addToInventory(item) {
    // Add timestamp for "new" sorting
    item.addedTimestamp = Date.now();
    
    // Check auto-sell first
    if (this.shouldAutoSell(item)) {
      this.sellItem(item);
      return;
    }
    
    this.player.inventory.push(item);
    this.needsInventoryUpdate = true;
  }
  
  shouldAutoSell(item) {
    if (!this.inventorySettings.autoSell.enabled) return false;
    
    const itemRarity = item.rarity || 'common';
    const rarityMatch = this.inventorySettings.autoSell.rarities[itemRarity];
    const typeMatch = this.inventorySettings.autoSell.types[item.type];
    
    // Item should be auto-sold if EITHER rarity OR type is enabled
    // This makes it more user-friendly - you can sell all commons OR all weapons
    return rarityMatch || typeMatch;
  }
  
  sellItem(item, showMessage = true) {
    const sellPrice = Math.floor((item.price !== undefined ? item.price : 10) * 0.5); // Sell for 50% of buy price
    this.player.gold += sellPrice;
    
    if (showMessage) {
      this.addLogMessage(`💰 Sold ${item.fullName || item.name} for ${sellPrice} gold`, 'shop');
    }
    
    return sellPrice;
  }
  
  sellAllJunk() {
    let totalGold = 0;
    let itemsSold = 0;
    const itemsToSell = [];
    
    // Find items to sell based on current auto-sell settings
    this.player.inventory.forEach((item, index) => {
      if (this.shouldAutoSell(item)) {
        itemsToSell.push({ item, index });
      }
    });
    
    // Sell items (reverse order to maintain indices)
    itemsToSell.reverse().forEach(({ item, index }) => {
      totalGold += this.sellItem(item, false);
      this.player.inventory.splice(index, 1);
      this.needsInventoryUpdate = true;
      itemsSold++;
    });
    
    if (itemsSold > 0) {
      this.addLogMessage(`💰 Sold ${itemsSold} items for ${totalGold} total gold`, 'shop');
    } else {
      this.addLogMessage('No items to sell based on current auto-sell settings', 'system');
    }
    
    return { itemsSold, totalGold };
  }
  
  getSortedAndFilteredInventory() {
    let filteredItems = [...this.player.inventory];
    
    // Apply filter
    if (this.inventorySettings.filterBy !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === this.inventorySettings.filterBy);
    }
    
    // Apply sort
    filteredItems.sort((a, b) => {
      switch (this.inventorySettings.sortBy) {
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
          const aRarity = rarityOrder.indexOf(a.rarity || 'common');
          const bRarity = rarityOrder.indexOf(b.rarity || 'common');
          return bRarity - aRarity; // Highest rarity first
        case 'type':
          return a.type.localeCompare(b.type);
        case 'attack':
          return (b.attack || 0) - (a.attack || 0);
        case 'new':
          return (b.addedTimestamp || 0) - (a.addedTimestamp || 0); // Newest first
        case 'name':
        default:
          return (a.fullName || a.name).localeCompare(b.fullName || b.name);
      }
    });
    
    return filteredItems;
  }
  
  equipItem(item, fromInventory = false, inventoryIndex = -1) {
    console.log('equipItem called with:', { item, fromInventory, inventoryIndex });
    const slot = item.type;
    
    // Check for 2-handed weapon restrictions
    if (slot === 'weapon' && item.handType === '2h') {
      // If equipping a 2-handed weapon, unequip offhand first
      if (this.player.equipment.offhand) {
        const offhandItem = { ...this.player.equipment.offhand, type: 'offhand' };
        offhandItem.addedTimestamp = Date.now();
        this.player.inventory.push(offhandItem);
        this.player.equipment.offhand = null;
        this.addLogMessage(`Unequipped ${offhandItem.fullName || offhandItem.name} to wield 2-handed weapon`, 'system');
      }
    } else if (slot === 'offhand') {
      // If equipping offhand, check if main weapon is 2-handed
      const mainWeapon = this.player.equipment.weapon;
      if (mainWeapon && mainWeapon.handType === '2h') {
        this.addLogMessage(`Cannot equip offhand item while wielding a 2-handed weapon!`, 'system');
        return; // Prevent equipping offhand with 2-handed weapon
      }
    }
    
    // Store reference to the current equipped item before modification
    let currentlyEquipped = null;
    if (this.player.equipment[slot]) {
      currentlyEquipped = { 
        ...this.player.equipment[slot], 
        type: slot // Restore the type for inventory
      };
    }
    
    // Create a clean copy of the new item for equipment
    const newEquipmentItem = {
      name: item.name,
      fullName: item.fullName || item.name,
      rarity: item.rarity,
      attack: item.attack || 0,
      maxHp: item.maxHp || 0,
      attackSpeed: item.attackSpeed || 0,
      critChance: item.critChance || 0,
      critDamage: item.critDamage || 0,
      dodge: item.dodge || 0,
      blockChance: item.blockChance || 0,
      handType: item.handType || '1h', // Store hand type for weapons
      prefixes: item.prefixes || [], // Copy prefixes
      suffixes: item.suffixes || []   // Copy suffixes
    };
    
    console.log('Equipping to slot:', slot, 'new item:', newEquipmentItem);
    
    // Equip the new item
    this.player.equipment[slot] = newEquipmentItem;
    this.needsCharacterUpdate = true;
    
    // Handle inventory management
    if (fromInventory && inventoryIndex >= 0) {
      console.log('Removing from inventory at index:', inventoryIndex, 'inventory before:', [...this.player.inventory]);
      
      // Remove the item from inventory using the provided index
      this.player.inventory.splice(inventoryIndex, 1);
      this.needsInventoryUpdate = true;
      
      console.log('Inventory after removal:', [...this.player.inventory]);
      
      // Add the previously equipped item to inventory if there was one
      if (currentlyEquipped) {
        console.log('Adding previously equipped item to inventory:', currentlyEquipped);
        // Add timestamp when moving from equipment to inventory
        currentlyEquipped.addedTimestamp = Date.now();
        this.player.inventory.push(currentlyEquipped);
      }
    }
    
    this.calculateStats();
    console.log('Stats after equipping:', { attack: this.player.attack, maxHp: this.player.maxHp });
  }
  
  spawnEnemy() {
    const zone = this.zones[this.currentZone];
    
    if (!zone.enemies || zone.enemies.length === 0) {
      return null;
    }
    
    // Check for boss encounter in Goblin Cave
    if (zone.boss && game.killCount >= zone.boss.requiredKills && game.killCount % zone.boss.requiredKills === 0) {
      // Show boss warning
      zones.showBossWarning(zone.boss.name);
      
      // Spawn the boss
      const boss = {
        ...zone.boss,
        hp: zone.boss.hp, // Current HP
        maxHp: zone.boss.hp, // Max HP
        attackInterval: zone.boss.attackInterval || 2000,
        isBoss: true,
        isEpicDropper: zone.boss.isEpicDropper || false,
        isLegendaryDropper: zone.boss.isLegendaryDropper || false
      };
    
      
      this.addCombatMessage(`🏴‍☠️ The Goblin King emerges from the depths!`, 'system');
      return boss;
    }
    
    // Regular enemy spawning
    const enemyTemplate = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
    
    const enemy = {
      ...enemyTemplate,
      hp: enemyTemplate.hp, // Current HP
      maxHp: enemyTemplate.hp, // Max HP
      attackInterval: enemyTemplate.attackInterval || 2000
    };
    
    return enemy;
  }
  
  gainXp(amount) {
    // Apply knowledge talent bonuses
    const knowledgeLevel1 = this.getTalentLevel('knowledge', 'knowledge_1');
    const knowledgeLevel2a = this.getTalentLevel('knowledge', 'knowledge_2a'); // Battle Wisdom
    const knowledgeLevel4 = this.getTalentLevel('knowledge', 'knowledge_4');
    
    let xpBonus = 1 + (knowledgeLevel1 * 0.2); // +20% per level
    xpBonus += knowledgeLevel2a * 0.5; // +50% bonus per level
    
    if (knowledgeLevel4 > 0) {
      xpBonus *= 3; // Triple XP gain
    }
    
    const finalAmount = Math.floor(amount * xpBonus);
    this.player.xp += finalAmount;
    
    while (this.player.xp >= this.player.nextLevelXp) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.player.xp -= this.player.nextLevelXp;
    this.player.level++;
    
    // Calculate next level XP with knowledge talent reduction
    const knowledgeLevel3a = this.getTalentLevel('knowledge', 'knowledge_3a'); // Master Scholar
    const xpReduction = Math.min(0.3, knowledgeLevel3a * 0.1); // Max 30% reduction
    
    this.player.nextLevelXp = Math.floor(this.player.nextLevelXp * 1.2 * (1 - xpReduction));
    
    // Increase base stats
    this.player.maxHp += 10;
    this.player.attack += 2;
    this.player.hp = this.player.hp + this.player.maxHp * 0.4; // Heal 40% of max HP on level up
    if(this.player.hp > this.player.maxHp) {
      this.player.hp = this.player.maxHp; // Cap at max HP
    }

    // Show level up animation
    document.getElementById('character-level').classList.add('level-up');
    setTimeout(() => {
      document.getElementById('character-level').classList.remove('level-up');
    }, 500);
    
    this.addLogMessage(`🎉 Level up! You are now level ${this.player.level}!`, 'loot', 'level-up');
    
    // Check for zone unlocks
    zones.checkZoneUnlocks(game, document, combat.startCombat);
  }
  
  addLogMessage(message, category = 'system', type = '') {
    const logEntry = {
      message,
      category, // 'combat', 'shop', 'system'
      type, // additional type info like 'player-attack', 'enemy-attack', etc.
      timestamp: new Date().toLocaleTimeString()
    };
    
    this.activityLog.push(logEntry);
    
    // Keep only last 100 messages
    if (this.activityLog.length > 100) {
      this.activityLog.shift();
    }
    
    this.updateActivityLog();
  }

  // Legacy method name for compatibility
  addCombatMessage(message, type = '') {
    this.addLogMessage(message, 'combat', type);
  }

  updateActivityLog() {
    const logDiv = document.getElementById('activity-messages');
    if (!logDiv) return;
    
    logDiv.innerHTML = '';
    
    const filteredMessages = this.logFilter === 'all' 
      ? this.activityLog 
      : this.activityLog.filter(entry => entry.category === this.logFilter);
    
    filteredMessages.forEach(entry => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `activity-message ${entry.category} ${entry.type}`;
      messageDiv.innerHTML = `<span class="timestamp">[${entry.timestamp}]</span> ${entry.message}`;
      logDiv.appendChild(messageDiv);
    });
    
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  setLogFilter(filter) {
    this.logFilter = filter;
    this.updateActivityLog();
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  }

  clearActivityLog() {
    this.activityLog = [];
    this.updateActivityLog();
  }
  
  save() {
    const saveData = {
      player: this.player,
      currentZone: this.currentZone,
      unlockedZones: this.unlockedZones
    };
    localStorage.setItem('idleRPG_save', JSON.stringify(saveData));
    alert('Game saved successfully!');
  }
  
  load() {
    const saveData = localStorage.getItem('idleRPG_save');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.player = { ...this.player, ...data.player };
  this.currentZone = data.currentZone || 'basement';
      this.unlockedZones = data.unlockedZones || ['basement', 'forest']; // Default to basement and forest if no save data

      // Fix character items that might be missing the 'type' property (from older saves)
      Object.keys(this.player.equipment).forEach(slot => {
        const item = this.player.equipment[slot];
        if (item && !item.type) {
          item.type = slot; // Set the type to match the equipment slot
        }
      });
      
      this.calculateStats();
      this.needsCharacterUpdate = true;
      alert('Game loaded successfully!');
      return true;
    }
    return false;
  }
  
  reset() {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      localStorage.removeItem('idleRPG_save');
      location.reload();
    }
  }
  
  getPlayerAttackInterval() {
    // Get base interval from equipped weapon, default to 2000ms if no weapon
    const equippedWeapon = this.player.equipment.weapon;
    const baseInterval = equippedWeapon?.baseAttackInterval || 2000;
    return calculateAttackInterval(this.player.attackSpeed || 0, baseInterval);
  }
  
  getEnemyAttackInterval(enemy) {
    return enemy?.attackInterval || 2000; // Default to 2 seconds if not specified
  }
  
  updateAttackBars(deltaTime) {
    if (!this.combat.isActive || !this.currentEnemy) return;
    
    // Update player attack bar
    this.attackBars.player.maxTime = this.getPlayerAttackInterval();
    this.attackBars.player.currentTime += deltaTime;
    
    // Update enemy attack bar
    this.attackBars.enemy.maxTime = this.getEnemyAttackInterval(this.currentEnemy);
    this.attackBars.enemy.currentTime += deltaTime;
    
    // Check for attacks
    if (this.attackBars.player.currentTime >= this.attackBars.player.maxTime) {
      this.performPlayerAttack();
      this.attackBars.player.currentTime = 0;
      // Instantly reset player attack bar UI to 0
      const playerFill = document.getElementById('player-attack-fill');
      if (playerFill) playerFill.style.width = '0%';
    }
    
    if (this.attackBars.enemy.currentTime >= this.attackBars.enemy.maxTime) {
      this.performEnemyAttack();
      this.attackBars.enemy.currentTime = 0;
      // Instantly reset enemy attack bar UI to 0
      const enemyFill = document.getElementById('enemy-attack-fill');
      if (enemyFill) enemyFill.style.width = '0%';
    }
    
    // Update UI
    this.updateAttackBarUI();
  }
  
  updateRespawnTimer(deltaTime) {
    if (!this.respawnTimer.isActive) return;
    
    this.respawnTimer.currentTime += deltaTime;
    
    if (this.respawnTimer.currentTime >= this.respawnTimer.maxTime) {
      // Respawn timer finished, start new combat
      this.respawnTimer.isActive = false;
      this.respawnTimer.currentTime = 0;
      combat.startCombat(game);
    }
  }
  
  updatePassiveSystems(currentTime) {
    // Study Habits: Gain bonus XP equal to 5% of current level every 60 seconds
    const studyHabitsLevel = this.getTalentLevel('knowledge', 'knowledge_2b');
    if (studyHabitsLevel > 0) {
      if (currentTime - this.passiveSystems.studyHabits.lastTick >= this.passiveSystems.studyHabits.interval) {
        const bonusXp = Math.floor(this.player.level * 0.05 * studyHabitsLevel);
        if (bonusXp > 0) {
          this.gainXp(bonusXp);
          this.addLogMessage(`Study Habits: Gained ${bonusXp} bonus XP from passive learning!`, 'system', 'passive-xp');
        }
        this.passiveSystems.studyHabits.lastTick = currentTime;
      }
    }
    
    // Passive Learning: Gain XP over time even when not fighting
    const passiveLearningLevel = this.getTalentLevel('knowledge', 'knowledge_3c');
    if (passiveLearningLevel > 0) {
      if (currentTime - this.passiveSystems.passiveLearning.lastTick >= this.passiveSystems.passiveLearning.interval) {
        const baseXpPerSecond = 1; // Base 1 XP per second
        const bonusXp = Math.floor(baseXpPerSecond * passiveLearningLevel);
        if (bonusXp > 0) {
          this.gainXp(bonusXp);
          // Don't spam log for passive learning, only log every 30 seconds
          if ((currentTime - this.passiveSystems.passiveLearning.lastTick) % 30000 < 1000) {
            this.addLogMessage(`Passive Learning: Gained ${bonusXp * 30} XP over the last 30 seconds!`, 'system', 'passive-xp');
          }
        }
        this.passiveSystems.passiveLearning.lastTick = currentTime;
      }
    }
  }
  
  updateAttackBarUI() {
    const playerPercent = (this.attackBars.player.currentTime / this.attackBars.player.maxTime) * 100;
    const enemyPercent = (this.attackBars.enemy.currentTime / this.attackBars.enemy.maxTime) * 100;
    
    const playerFill = document.getElementById('player-attack-fill');
    const enemyFill = document.getElementById('enemy-attack-fill');
    
    if (playerFill) playerFill.style.width = `${Math.min(100, playerPercent)}%`;
    if (enemyFill) enemyFill.style.width = `${Math.min(100, enemyPercent)}%`;
    
    // Update attack bar labels with current/max time in milliseconds
    const playerLabel = document.getElementById('player-attack-label');
    const enemyLabel = document.getElementById('enemy-attack-label');
    
    if (playerLabel) {
      const currentMs = Math.floor(this.attackBars.player.currentTime);
      const maxMs = Math.floor(this.attackBars.player.maxTime);
      playerLabel.textContent = `${currentMs}/${maxMs}`;
    }
    
    if (enemyLabel) {
      const currentMs = Math.floor(this.attackBars.enemy.currentTime);
      const maxMs = Math.floor(this.attackBars.enemy.maxTime);
      enemyLabel.textContent = `${currentMs}/${maxMs}`;
    }
  }
  
  performPlayerAttack() {
    if (!this.currentEnemy) return;
    
    // Calculate normal damage
    let damage = this.player.attack;
    let isCritical = false;
    
    // Check for critical hit
    if (this.player.critChance > 0) {
      const critRoll = Math.random() * 100;
      if (critRoll <= this.player.critChance) {
        isCritical = true;
        damage = Math.floor(damage * (1 + (this.player.critDamage / 100)));
      }
    }
    
    // Apply damage
    this.currentEnemy.hp -= damage;
    
    // Immediately switch to respawn mode if enemy dies
    if (this.currentEnemy.hp <= 0) {
      // Start respawn immediately with visual feedback
      const enemyHpBar = document.getElementById('enemy-hp-bar');
      if (enemyHpBar) {
        enemyHpBar.classList.add('instant'); // Disable transition for instant change
        enemyHpBar.style.width = '0%';
        enemyHpBar.classList.add('respawning');
        
        // Remove instant class after a brief moment to restore transitions for respawn progress
        setTimeout(() => {
          enemyHpBar.classList.remove('instant');
        }, 50);
      }
    }
    
    // Create floating damage for enemy (on enemy HP bar)
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemyHpBar && this.currentEnemy.hp > 0) {
      combat.createFloatingDamage(document, damage, enemyHpBar, 'enemy', isCritical);
    }
    
    // Combat message with details
    let attackMessage = `You attack ${this.currentEnemy.name} for ${damage} damage`;
    if (isCritical) {
      attackMessage += ` (💥 CRITICAL HIT!)`;
    }
    attackMessage += '!';
    
    this.addCombatMessage(attackMessage, isCritical ? 'player-crit' : 'player-attack');
    
    // Add damage animation to enemy side
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) {
      enemySide.classList.add('damage-animation');
      setTimeout(() => {
        enemySide.classList.remove('damage-animation');
      }, 300);
    }
    
    // Add attack animation to player image
    const playerImage = document.getElementById('player-image');
    if (playerImage) {
      playerImage.classList.add('player-attacking');
      setTimeout(() => {
        playerImage.classList.remove('player-attacking');
      }, 600);
    }
    
    if (this.currentEnemy.hp <= 0) {
      this.handleEnemyDefeat();
    }
  }
  
  performEnemyAttack() {
    if (!this.currentEnemy) return;
    
    // Add attack animation to enemy image (happens regardless of hit/miss)
    const enemyImage = document.getElementById('enemy-image');
    if (enemyImage) {
      console.log('Enemy attacking! Classes before:', enemyImage.className);
      enemyImage.classList.add('enemy-attacking');
      
      setTimeout(() => {
        console.log('Enemy attack finished! Classes after:', enemyImage.className);
        enemyImage.classList.remove('enemy-attacking');
      }, 600);
    }
    
    // Check for dodge
    if (this.player.dodge > 0) {
      const dodgeRoll = Math.random() * 100;
      if (dodgeRoll <= this.player.dodge) {
        // Create floating miss for player (on player HP bar)
        const playerHpBar = document.getElementById('player-hp-bar');
        if (playerHpBar) {
          combat.createFloatingDamage(document, 0, playerHpBar, 'player', false, true);
        }
        
        this.addCombatMessage(`You dodge ${this.currentEnemy.name}'s attack! 💨`, 'player-dodge');
        return; // Attack missed
      }
    }
    
    // Calculate damage
    let damage = this.currentEnemy.attack;
    let isBlocked = false;
    
    // Check for block
    if (this.player.blockChance > 0) {
      const blockRoll = Math.random() * 100;
      if (blockRoll <= this.player.blockChance) {
        isBlocked = true;
        damage = Math.floor(damage * 0.5); // Blocks reduce damage by 50%
      }
    }
    
    // Apply damage
    this.player.hp -= damage;
    
    // Create floating damage for player (on player HP bar)
    const playerHpBar = document.getElementById('player-hp-bar');
    if (playerHpBar) {
      combat.createFloatingDamage(document, damage, playerHpBar, 'player', false, false, false);
    }
    
    // Combat message
    let attackMessage = `${this.currentEnemy.name} attacks you for ${damage} damage`;
    if (isBlocked) {
      attackMessage += ` (🛡️ BLOCKED!)`;
    }
    attackMessage += '!';
    
    this.addCombatMessage(attackMessage, isBlocked ? 'enemy-blocked' : 'enemy-attack');
    
    // Add damage animation to player side
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
      playerSide.classList.add('damage-animation');
      setTimeout(() => {
        playerSide.classList.remove('damage-animation');
      }, 300);
    }
    
    if (this.player.hp <= 0) {
      this.handlePlayerDeath();
    }
  }
  
  handleEnemyDefeat() {
    // Increment enemy counter
    game.killCount++;
    
    // Variable gold drop between 10% and 100% of base gold
    const baseGold = this.currentEnemy.gold;
    const goldMultiplier = 0.1 + (Math.random() * 0.9); // 0.1 to 1.0
    let goldGained = Math.floor(baseGold * goldMultiplier);
    let xpGained = this.currentEnemy.xp;
    
    // Apply wealth talent bonuses to gold
    goldGained = Math.floor(goldGained * this.getGoldMultiplier());
    
    // Experience Burst: Every 10th enemy gives 5x experience
    const experienceBurstLevel = this.getTalentLevel('knowledge', 'knowledge_3b');
    let experienceBurstMultiplier = 1;
    if (experienceBurstLevel > 0 && game.killCount % 10 === 0) {
      experienceBurstMultiplier = 5 * experienceBurstLevel; // 5x per level
      this.addLogMessage(`🌟 Experience Burst! ${experienceBurstMultiplier}x XP bonus on this kill!`, 'loot', 'experience-burst');
    }
    
    // Apply experience multiplier to XP (including Zone Master bonus)
    xpGained = Math.floor(xpGained * this.getExperienceMultiplier() * experienceBurstMultiplier);
    
    this.player.gold += goldGained;
    this.gainXp(xpGained);
    
    this.addLogMessage(`${this.currentEnemy.name} defeated! Gained ${goldGained} gold and ${xpGained} XP!`, 'loot', 'enemy-defeated');
    
    

    // Check if this is a goblin in Goblin Cave for kill tracking
    if (this.currentZone === 'goblinCave' && this.currentEnemy.name.includes('Goblin') && !this.currentEnemy.isBoss) {
      this.addCombatMessage(`Goblins defeated: ${game.killCount}/${this.zones[this.currentZone].boss.requiredKills}`, 'system');
    }
    
    // Handle item drops
    let droppedItem;
    const currentZone = this.zones[this.currentZone];

    if (this.currentEnemy.isBoss) {
      zones.showVictoryMessage(this.currentEnemy.name);
    }

    if (this.currentEnemy.isLegendaryDropper) {
      // Boss drops legendary items
      droppedItem = items.generateRandomItemForZone(['legendary'], 1);
      this.addLogMessage(`💎 The ${this.currentEnemy.name} dropped a legendary item! ${droppedItem.fullName}!`, 'loot', 'enemy-defeated');
      this.addToInventory(droppedItem);

    } else if (this.currentEnemy.isEpicDropper) {
      // Boss drops epic items
      droppedItem = items.generateRandomItemForZone(['epic'], 1);
      this.addLogMessage(`💎 The ${this.currentEnemy.name} dropped an epic item! ${droppedItem.fullName}!`, 'loot', 'enemy-defeated');
      // Show victory message for boss
      zones.showVictoryMessage(this.currentEnemy.name);
      this.addToInventory(droppedItem);
    } else if (this.currentZone !== 'basement') {
      // Use zone's drop chance and rarity restrictions, but skip for basement
      const baseDropChance = currentZone.dropChance || 25; // Base 25% drop chance
      const allowedRarities = currentZone.allowedRarities || ['common', 'uncommon', 'rare', 'epic'];
      // Apply item drop multiplier
      const dropMultiplier = this.getItemDropMultiplier();
      let finalDropChance = baseDropChance * dropMultiplier;
      if (guaranteedDropsEnabled) finalDropChance = 100;
      const dropRoll = Math.random() * 100;
      if (dropRoll <= finalDropChance) {
        droppedItem = items.generateRandomItemForZone(allowedRarities);
        this.addLogMessage(`${this.currentEnemy.name} dropped ${droppedItem.fullName}!`, 'loot', 'enemy-defeated');
        this.addToInventory(droppedItem);
      }
    }
    
    this.currentEnemy = null;
    this.combat.isActive = false;
    this.attackBars.player.currentTime = 0;
    this.attackBars.enemy.currentTime = 0;
    
    // Start respawn timer
    this.respawnTimer.isActive = true;
    this.respawnTimer.currentTime = 0;
    
    // Respawn styling already applied in performPlayerAttack when enemy HP reached 0
  }
  
  handlePlayerDeath() {
    this.combat.isActive = false;
    this.currentEnemy = null;
    this.attackBars.player.currentTime = 0;
    this.attackBars.enemy.currentTime = 0;
    game.killCount = 0;
    
    // Destroy all tooltips on death
    tooltips.destroyAllTooltips(game, document, currentTooltipItem, currentTooltipEvent);
    
    this.addCombatMessage('You were defeated! Choose to ascend and gain permanent power...', 'player-death');
    
    // Generate new death message for next time
    this.currentDeathMessage = deathMessages.getRandomDeathMessage();
    deathMessages.updateEndRunButton(game, document);

    // Show death screen followed by talent tree
    combat.showDeathScreen(game, document);
  }

  // Talent Tree Methods
  getTalentLevel(pathwayName, talentId) {
    return this.talents[pathwayName][talentId] || 0;
  }

  getBaseAttackWithTalents() {
    const baseAttack = this.player.baseAttack; // Original base attack
    const powerLevel1 = this.getTalentLevel('power', 'power_1');
    return baseAttack + (powerLevel1 * 5); // +5 attack per level of Warrior Training
  }

  getBaseMaxHpWithTalents() {
    const baseMaxHp = 100; // Original base maxHp
    // Add any HP-related talents here in the future
    return baseMaxHp;
  }

  getBaseAttackSpeedWithTalents() {
    const powerLevel3a = this.getTalentLevel('power', 'power_3a'); // Berserker Rage
    return powerLevel3a * 10; // +10% attack speed per level of Berserker Rage
  }

  getBaseCritChanceWithTalents() {
    const powerLevel2b = this.getTalentLevel('power', 'power_2b'); // Combat Mastery
    const powerLevel4 = this.getTalentLevel('power', 'power_4');
    let baseCrit = powerLevel2b * 2; // +2% crit per level of Combat Mastery
    if (powerLevel4 > 0) {
      baseCrit += 25; // +25% crit chance from Legendary Warrior
    }
    return baseCrit;
  }

  getBaseCritDamageWithTalents() {
    return 0; // No crit damage talents yet
  }

  getBaseLifeStealWithTalents() {
    return 0; // No life steal talents yet
  }

  getBaseDodgeWithTalents() {
    return 0; // No dodge talents yet
  }

  getBaseBlockChanceWithTalents() {
    return 0; // No block chance talents yet
  }

  getExperienceMultiplier() {
    let multiplier = 1.0; // Base multiplier
    
    // Knowledge talents
    const knowledgeLevel1 = this.getTalentLevel('knowledge', 'knowledge_1');
    const knowledgeLevel2a = this.getTalentLevel('knowledge', 'knowledge_2a'); // Battle Wisdom
    const knowledgeLevel4 = this.getTalentLevel('knowledge', 'knowledge_4');
    
    // Quick Learner: +20% experience gain per level
    multiplier += (knowledgeLevel1 * 0.20);
    
    // Battle Wisdom: +50% bonus XP from combat victories per level
    multiplier += (knowledgeLevel2a * 0.50);
    
    // Enlightened One: Triple XP gain
    if (knowledgeLevel4 > 0) {
      multiplier *= 3.0;
    }
    
    return multiplier;
  }

  getGoldMultiplier() {
    let multiplier = 1.0; // Base multiplier
    
    // Wealth talents
    const wealthLevel1 = this.getTalentLevel('wealth', 'wealth_1');
    const wealthLevel4 = this.getTalentLevel('wealth', 'wealth_4');
    
    // Coin Collector: +25% gold gain per level
    multiplier += (wealthLevel1 * 0.25);
    
    // Golden Touch: Double gold gain
    if (wealthLevel4 > 0) {
      multiplier *= 2.0;
    }
    
    return multiplier;
  }

  getItemDropMultiplier() {
    let multiplier = 1.0; // Base multiplier
    
    // Wealth talents
    const wealthLevel2a = this.getTalentLevel('wealth', 'wealth_2a'); // Lucky Find
    const wealthLevel4 = this.getTalentLevel('wealth', 'wealth_4');
    
    // Lucky Find: +10% item drop chance per level
    multiplier += (wealthLevel2a * 0.10);
    
    // Golden Touch: +50% item drops
    if (wealthLevel4 > 0) {
      multiplier += 0.50;
    }
    
    return multiplier;
  }

  canAllocateTalent(pathwayName, talentId) {
    const pathway = talentTrees.TALENT_TREES[pathwayName];
    const talent = pathway.nodes.find(node => node.id === talentId);
    
    if (!talent) return false;
    
    const currentLevel = this.getTalentLevel(pathwayName, talentId);
    if (currentLevel >= talent.maxLevel) return false;
    
    let totalCost = talent.cost * (currentLevel + 1);
    
    // Enlightened One: Gain talent points 50% faster (50% cost reduction)
    const enlightenedOneLevel = this.getTalentLevel('knowledge', 'knowledge_4');
    if (enlightenedOneLevel > 0) {
      totalCost = Math.floor(totalCost * 0.5); // 50% cost reduction
    }
    
    if (this.player.gold < totalCost) return false;
    
    // Check prerequisites
    for (const prereqId of talent.prerequisites) {
      if (this.getTalentLevel(pathwayName, prereqId) === 0) {
        return false;
      }
    }
    
    return true;
  }

  allocateTalent(pathwayName, talentId) {
    if (!this.canAllocateTalent(pathwayName, talentId)) return false;
    
    const pathway = talentTrees.TALENT_TREES[pathwayName];
    const talent = pathway.nodes.find(node => node.id === talentId);
    const currentLevel = this.getTalentLevel(pathwayName, talentId);
    let cost = talent.cost * (currentLevel + 1);
    
    // Enlightened One: Gain talent points 50% faster (50% cost reduction)
    const enlightenedOneLevel = this.getTalentLevel('knowledge', 'knowledge_4');
    if (enlightenedOneLevel > 0) {
      cost = Math.floor(cost * 0.5); // 50% cost reduction
    }
    
    this.player.gold -= cost;
    this.talents[pathwayName][talentId] = currentLevel + 1;
    
    this.addLogMessage(`Allocated ${talent.name} (Level ${currentLevel + 1})`, 'system');
    return true;
  }

  getTotalTalentPoints() {
    let total = 0;
    for (const pathway in this.talents) {
      for (const talentId in this.talents[pathway]) {
        total += this.talents[pathway][talentId];
      }
    }
    return total;
  }

  ascend(game, document) {
    // Store current gold for talent allocation
    const currentGold = this.player.gold;
    
    // Check for Enlightened One talent for starting level bonus
    const enlightenedOneLevel = this.getTalentLevel('knowledge', 'knowledge_4');
    const startingLevel = enlightenedOneLevel > 0 ? 5 : 1;
    
    // Reset player stats
    this.player.level = startingLevel;
    this.player.hp = this.getBaseMaxHpWithTalents();
    this.player.maxHp = this.getBaseMaxHpWithTalents();
    this.player.attack = 10;
    this.player.equipmentAttack = 0;
    this.player.equipmentMaxHp = 0;
    this.player.attackSpeed = 0;
    this.player.critChance = 0;
    this.player.critDamage = 0;
    this.player.dodge = 0;
    this.player.blockChance = 0;
    // Gold is now preserved between ascensions
    this.player.xp = 0;
    this.player.nextLevelXp = 100;
    
    // If starting at level 5, adjust stats and XP requirements accordingly
    if (startingLevel > 1) {
      for (let i = 1; i < startingLevel; i++) {
        this.player.maxHp += 10;
        this.player.nextLevelXp = Math.floor(this.player.nextLevelXp * 1.2);
      }
      this.player.hp = this.player.maxHp;
      this.addLogMessage(`🌟 Enlightened One: Starting at level ${startingLevel}!`, 'system', 'enlightened-start');
    }
    
    // Clear inventory and equipment (except starting weapon)
    this.player.inventory = [];
    this.player.equipment = {
      weapon: { 
        name: 'Rusty Sword', 
        type: 'weapon', 
        rarity: 'common',
        attack: 5, 
        maxHp: 0, 
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        dodge: 0,
        blockChance: 0,
        price: 0, // Rusty Sword sells for 0 gold
        baseAttackInterval: 2500
      },
      offhand: null,
      helmet: null,
      body: null,
      legs: null,
      belt: null,
      boots: null,
      necklace: null,
      ring: null
    };
    
    // Reset zones (except starting zones)
    this.unlockedZones = ['basement', 'restArea', 'forest'];
    this.currentZone = 'basement';
    zones.checkZoneUnlocks(game, document, combat.startCombat);

    this.currentEnemy = null;
    
    
    // Reset combat state
    this.combat.isActive = false;
    this.attackBars.player.currentTime = 0;
    this.attackBars.enemy.currentTime = 0;
    
    // Apply talent bonuses
    this.applyTalentBonuses();
    
    // Increment ascension count
    this.ascensionCount++;
    
    this.addLogMessage(`Ascension ${this.ascensionCount} complete! Your journey begins anew with ${this.getTotalTalentPoints()} talent points.`, 'system');
    
    // Update all UI
    this.needsCharacterUpdate = true;
    this.needsInventoryUpdate = true;
  }

  applyTalentBonuses() {
    // Apply knowledge talents first (affects starting stats)
    const knowledgeLevel4 = this.getTalentLevel('knowledge', 'knowledge_4');
    if (knowledgeLevel4 > 0) {
      this.player.level = 5;
      this.player.xp = 0;
      this.player.nextLevelXp = this.calculateXpForLevel(6);
    }
    
    // Apply power talents
    const powerLevel1 = this.getTalentLevel('power', 'power_1');
    this.player.attack += powerLevel1 * 5;
    
    // Recalculate stats with equipment
    this.calculateStats();
  }

  calculateXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }
}

// Create the game instance
const game = new GameState();



// UI Updates
function updateUI() {
  // Update gold in inventory header
  const inventoryGoldElement = document.getElementById('inventory-gold');
  if (inventoryGoldElement) {
    inventoryGoldElement.textContent = game.player.gold;
    inventoryGoldElement.style.fontSize = '0.7rem';
  }
  
  // Update gold in shop if visible
  const shopGoldElement = document.getElementById('shop-gold');
  if (shopGoldElement) {
    shopGoldElement.textContent = game.player.gold;
  }
  
  
  // Update player attack in combat display
  const playerAttackElement = document.getElementById('player-attack');
  if (playerAttackElement) {
    playerAttackElement.textContent = game.player.attack;
  }
  
  // Update detailed stats panel
  updateStatsPanel();
  
  // Update character XP bar and level
  document.getElementById('character-level').textContent = game.player.level;
  document.getElementById('character-xp-text').textContent = `${game.player.xp} / ${game.player.nextLevelXp}`;
  
  const xpPercent = (game.player.xp / game.player.nextLevelXp) * 100;
  document.getElementById('character-xp-fill').style.width = `${xpPercent}%`;
  
  // Update player HP bar
  const playerHpPercent = (game.player.hp / game.player.maxHp) * 100;
  document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
  
  // Update player HP text
  document.getElementById('player-hp-text').textContent = `${game.player.hp}/${game.player.maxHp}`;
  
  // Update kill counter display
  combat.updateKillCounter(game);
  
  // Update enemy info
  if (game.currentEnemy) {
    document.getElementById('enemy-title').textContent = game.currentEnemy.name;
    document.getElementById('enemy-attack').textContent = game.currentEnemy.attack;
    
    // Update enemy image
    const enemyImage = document.getElementById('enemy-image');
    if (enemyImage) {
      // Remove all enemy type classes first, then add the current one
      //enemyImage.classList.remove(...enemyImage.classList);
      enemyImage.src = `assets/enemies/${game.currentEnemy.imageClass + '.png'}`;
      enemyImage.alt = game.currentEnemy.name;
      enemyImage.style.visibility = 'visible';
    }
        
    const enemyHpPercent = (game.currentEnemy.hp / game.currentEnemy.maxHp) * 100;
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemyHpBar) {
      enemyHpBar.style.width = `${enemyHpPercent}%`;
      enemyHpBar.classList.remove('respawning'); // Remove respawn styling
    }
    
    // Update enemy HP text
    document.getElementById('enemy-hp-text').textContent = `${game.currentEnemy.hp}/${game.currentEnemy.maxHp}`;
  } else if (game.respawnTimer.isActive) {
    // Show respawn timer
    const timeLeft = Math.ceil((game.respawnTimer.maxTime - game.respawnTimer.currentTime) / 1000);
    const respawnProgress = (game.respawnTimer.currentTime / game.respawnTimer.maxTime) * 100;
    
    document.getElementById('enemy-title').textContent = `Respawning in ${timeLeft}s...`;
    document.getElementById('enemy-attack').textContent = '-';
    
    // Fill HP bar with muted green based on respawn progress (starts empty, fills up)
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemyHpBar) {
      enemyHpBar.style.width = `${respawnProgress}%`;
      enemyHpBar.classList.add('respawning');
    }
    
    document.getElementById('enemy-hp-text').textContent = '';
    
    // Hide enemy image during respawn
    const enemyImage = document.getElementById('enemy-image');
    if (enemyImage) {
      enemyImage.style.visibility = 'hidden';
    }
  } else {
    // Clear enemy info when no enemy and no respawn timer
    document.getElementById('enemy-title').textContent = 'No Enemy';
    document.getElementById('enemy-attack').textContent = '-';
    
    const enemyHpBar = document.getElementById('enemy-hp-bar');
    if (enemyHpBar) {
      enemyHpBar.style.width = '0%';
      enemyHpBar.classList.remove('respawning'); // Remove respawn styling
    }
    
    const enemyHpText = document.getElementById('enemy-hp-text');
    if (enemyHpText) enemyHpText.textContent = '';
    
    // Hide enemy image when no enemy
    const enemyImage = document.getElementById('enemy-image');
    if (enemyImage) {
      enemyImage.style.visibility = 'hidden';
    }
  }
  
  // Update character equipment
  // Only update character equipment if it has changed
  if (game.needsCharacterUpdate) {
    for (const slot in game.player.equipment) {
      const item = game.player.equipment[slot];
      const element = document.getElementById(`${slot}-item`);
      const tooltipElement = document.getElementById(`${slot}-tooltip`);
      
      if (element) {
        // Add slot name and item icon/name if equipped
        const slotDisplayName = slot.charAt(0).toUpperCase() + slot.slice(1);
        
        if (item) {
          const gearIcon = getGearIcon(item);
          element.innerHTML = `
            <div class="character-slot-name">${slotDisplayName}</div>
            <div class="character-slot-icon">${gearIcon}</div>
            <div class="equipped-item-name">${item.name}</div>
          `;
        } else {
          const emptyIcon = getGearIcon(slot);
          element.innerHTML = `
            <div class="character-slot-name">${slotDisplayName}</div>
            <div class="character-slot-icon empty">${emptyIcon}</div>
            <div class="empty-slot">Empty</div>
          `;
        }
        
        const slotElement = element.closest('.character-slot');
        
        if (item) {
          slotElement.classList.add('has-item');
          
          // Update tooltip
          if (tooltipElement) {
            tooltips.updateCharacterTooltip(game, tooltipElement, item);
            tooltipElement.style.display = 'block';
          }
        } else {
          slotElement.classList.remove('has-item');
          element.style.color = '';
          
          // Hide tooltip completely
          if (tooltipElement) {
            tooltipElement.innerHTML = '';
            tooltipElement.style.display = 'none';
          }
        }
      }
    }
    game.needsCharacterUpdate = false;
  }
  
  // Only update inventory if it has changed
  if (game.needsInventoryUpdate) {
    //console.log('Updating inventory display');
    updateInventory();
  }
  
}

function updateStatsPanel() {
  // Only update the displayed stats (total attack, max HP, actual attack speed, and advanced stats)
  document.getElementById('stats-total-attack').textContent = game.player.attack;
  document.getElementById('stats-max-hp').textContent = game.player.maxHp;
  
  // Calculate and display actual attack speed
  const actualAttackSpeed = game.getPlayerAttackInterval();
  document.getElementById('stats-actual-attack-speed').textContent = `${(actualAttackSpeed / 1000).toFixed(1)}s`;
  
  // Update advanced stats
  document.getElementById('stats-crit-chance').textContent = `${game.player.critChance || 0}%`;
  document.getElementById('stats-crit-damage').textContent = `${game.player.critDamage || 0}%`;
  document.getElementById('stats-dodge').textContent = `${game.player.dodge || 0}%`;
  document.getElementById('stats-block-chance').textContent = `${game.player.blockChance || 0}%`;
  
  // Update multipliers
  document.getElementById('stats-xp-multiplier').textContent = `${game.getExperienceMultiplier().toFixed(2)}x`;
  document.getElementById('stats-gold-multiplier').textContent = `${game.getGoldMultiplier().toFixed(2)}x`;
  document.getElementById('stats-item-drop-chance').textContent = `${(25 * game.getItemDropMultiplier()).toFixed(0)}%`;
  
  // Add color coding for main stats
  const totalAttackElement = document.getElementById('stats-total-attack');
  const maxHpElement = document.getElementById('stats-max-hp');
  
  if (totalAttackElement) {
    totalAttackElement.className = 'stat-value';
    if (game.player.equipmentAttack > 0) {
      totalAttackElement.classList.add('positive');
    }
  }
  
  if (maxHpElement) {
    maxHpElement.className = 'stat-value';
    if (game.player.equipmentMaxHp > 0) {
      maxHpElement.classList.add('positive');
    }
  }
  
  // Add color coding for advanced stats
  const advancedStats = ['crit-chance', 'crit-damage', 'dodge', 'block-chance'];
  advancedStats.forEach(stat => {
    const element = document.getElementById(`stats-${stat}`);
    if (element) {
      const value = parseInt(element.textContent);
      element.className = 'stat-value';
      if (value > 0) {
        element.classList.add('positive');
      }
    }
  });
  
  // Add color coding for multipliers
  const xpMultiplierElement = document.getElementById('stats-xp-multiplier');
  const goldMultiplierElement = document.getElementById('stats-gold-multiplier');
  const itemDropElement = document.getElementById('stats-item-drop-chance');
  
  if (xpMultiplierElement) {
    xpMultiplierElement.className = 'stat-value';
    if (game.getExperienceMultiplier() > 1.0) {
      xpMultiplierElement.classList.add('positive');
    }
  }
  
  if (goldMultiplierElement) {
    goldMultiplierElement.className = 'stat-value';
    if (game.getGoldMultiplier() > 1.0) {
      goldMultiplierElement.classList.add('positive');
    }
  }
  
  if (itemDropElement) {
    itemDropElement.className = 'stat-value';
    if (game.getItemDropMultiplier() > 1.0) {
      itemDropElement.classList.add('positive');
    }
  }
  
  // Add color coding for actual attack speed
  const actualAttackSpeedElement = document.getElementById('stats-actual-attack-speed');
  
  if (actualAttackSpeedElement) {
    actualAttackSpeedElement.className = 'stat-value';
    // Show in green if player has attack speed bonuses
    if (game.player.attackSpeed > 0) {
      actualAttackSpeedElement.classList.add('positive');
    }
  }
}

// Check if an item provides significant stat improvements (more than half of available stats)
function isStatImprovement(item) {
  const currentItem = game.player.equipment[item.type];
  if (!currentItem) return true; // Always an improvement if nothing equipped
  
  const newStats = {
    attack: item.attack || 0,
    maxHp: item.maxHp || 0,
    attackSpeed: item.attackSpeed || 0,
    critChance: item.critChance || 0,
    critDamage: item.critDamage || 0,
    lifeSteal: item.lifeSteal || 0,
    dodge: item.dodge || 0,
    blockChance: item.blockChance || 0
  };
  
  const currentStats = {
    attack: currentItem.attack || 0,
    maxHp: currentItem.maxHp || 0,
    attackSpeed: currentItem.attackSpeed || 0,
    critChance: currentItem.critChance || 0,
    critDamage: currentItem.critDamage || 0,
    lifeSteal: currentItem.lifeSteal || 0,
    dodge: currentItem.dodge || 0,
    blockChance: currentItem.blockChance || 0
  };
  
  // Count stats that are improved
  let improvedStats = 0;
  let totalNonZeroStats = 0;
  
  for (const stat in newStats) {
    if (newStats[stat] > 0 || currentStats[stat] > 0) {
      totalNonZeroStats++;
      if (newStats[stat] > currentStats[stat]) {
        improvedStats++;
      }
    }
  }
  
  // Item is a significant improvement if it improves more than half the relevant stats
  return totalNonZeroStats > 0 && (improvedStats / totalNonZeroStats) > 0.5;
}

// Get gear icon based on item type using SVG files
function getGearIcon(item) {
  // If it's just a type string (for backward compatibility)
  if (typeof item === 'string') {
    const gearIcons = {
      weapon: 'sword',
      offhand: 'buckler',
      helmet: 'helmet',
      body: 'armor',
      legs: 'pants',
      belt: 'leather-belt',
      boots: 'boots',
      necklace: 'amulet',
      ring: 'ring'
    };
    const iconName = gearIcons[item] || 'sword';
    return `<img src="${getAssetUrl(`assets/gear/${iconName}.svg`)}" alt="${item}" class="gear-icon" />`;
  }
  
  // For specific item objects, return detailed icons based on item name
  const itemName = item.name.toLowerCase().replace(/\s+/g, '-');
  let svgFileName = itemName;
  
  // Direct mapping for exact matches
  const directMappings = {
    'sword': 'sword',
    'axe': 'axe',
    'mace': 'mace',
    'dagger': 'dagger',
    'staff': 'staff',
    'greatsword': 'greatsword',
    'battleaxe': 'battleaxe',
    'warhammer': 'warhammer',
    'buckler': 'buckler',
    'round-shield': 'round-shield',
    'tower-shield': 'tower-shield',
    'tome': 'tome',
    'helmet': 'helmet',
    'cap': 'cap',
    'crown': 'crown',
    'hood': 'hood',
    'armor': 'armor',
    'robe': 'robe',
    'vest': 'vest',
    'tunic': 'tunic',
    'greaves': 'greaves',
    'pants': 'pants',
    'leggings': 'leggings',
    'shorts': 'shorts',
    'sandals': 'sandals',
    'boots': 'boots',
    'heavy-boots': 'heavy-boots',
    'speed-boots': 'speed-boots',
    'leather-belt': 'leather-belt',
    'utility-belt': 'utility-belt',
    'chain-belt': 'chain-belt',
    'war-belt': 'war-belt',
    'amulet': 'amulet',
    'pendant': 'pendant',
    'ring': 'ring',
    'bracelet': 'bracelet'
  };
  
  // Use direct mapping if available
  if (directMappings[svgFileName]) {
    svgFileName = directMappings[svgFileName];
  }
  
  // Get rarity for CSS class
  const rarity = item.rarity || 'common';
  
  return `<img src="${getAssetUrl(`assets/gear/${svgFileName}.svg`)}" alt="${item.name}" class="gear-icon rarity-${rarity}" loading="eager" onerror="this.style.display='none';" />`;
}

function updateInventory() {
  const inventoryDiv = document.getElementById('inventory-items');
  
  if (!inventoryDiv) {
    console.error('Inventory div not found!');
    return;
  }
  
  // Hide any existing tooltip since inventory is being rebuilt
  tooltips.hideInventoryTooltip();
  
  inventoryDiv.innerHTML = '';
  
  const sortedItems = game.getSortedAndFilteredInventory();
  
  if (sortedItems.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'inventory-empty';
    emptyDiv.textContent = game.inventorySettings.filterBy === 'all' ? 
      'No items in inventory' : 
      `No ${game.inventorySettings.filterBy} items in inventory`;
    emptyDiv.style.color = 'var(--light-color)';
    emptyDiv.style.fontStyle = 'italic';
    emptyDiv.style.textAlign = 'center';
    emptyDiv.style.padding = '20px';
    inventoryDiv.appendChild(emptyDiv);
    return;
  }
  
  sortedItems.forEach((item) => {
    // Find the original index in the unsorted inventory
    const originalIndex = game.player.inventory.findIndex(invItem => 
      invItem === item || (invItem.fullName === item.fullName && invItem.type === item.type)
    );
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.setAttribute('data-item-index', originalIndex);
    
    // Check if this item provides significant stat improvements
    if (isStatImprovement(item)) {
      itemDiv.classList.add('stat-improvement');
    }
    
    // Get rarity color
    const rarityColor = item.rarity && items.ITEM_RARITIES[item.rarity] ? items.ITEM_RARITIES[item.rarity].color : '#9CA3AF';
    
    // Add sell price for tooltip use
    const sellPrice = Math.floor((item.price !== undefined ? item.price : 10) * 0.5);
    
    itemDiv.innerHTML = `
      <div class="item-icon">${getGearIcon(item)}</div>
      <div class="item-name" style="color: ${rarityColor}; font-weight: bold;">
        ${items.formatItemNameWithRarity(item)}
      </div>
    `;
    
    // Remove the rarity border since we're using white/green for stat improvements now
    // itemDiv.style.border = `2px solid ${rarityColor}`;
    
    // Add tooltip handlers
    itemDiv.addEventListener('mouseenter', (e) => {
      currentTooltipItem = item;
      currentTooltipEvent = e;
      tooltips.showInventoryTooltip(game, document, e, item, isShiftPressed);
    });
    
    itemDiv.addEventListener('mouseleave', (e) => {
      currentTooltipItem = null;
      currentTooltipEvent = null;
      tooltips.hideInventoryTooltip();
    });
    
    itemDiv.addEventListener('mousemove', (e) => {
      currentTooltipEvent = e;
      tooltips.updateTooltipPosition(e, document);
    });
    
    // Add click handler to equip item
    itemDiv.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Always hide tooltip on any click (left or shift+left)
      tooltips.hideInventoryTooltip();
      // Only handle left click (button 0) for equip
      if (e.button === 0) {
        const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
        const itemToEquip = game.player.inventory[itemIndex];
        if (itemToEquip && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
          const equipItem = { ...itemToEquip };
          game.equipItem(equipItem, true, itemIndex);
          game.addLogMessage(`✨ Equipped ${equipItem.fullName || equipItem.name}!`, 'system');
          itemDiv.classList.add('equipping');
          setTimeout(() => { updateUI(); }, 300);
        }
      }
    });
    
    // Add right-click handler to sell item
    itemDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent default context menu
      e.stopPropagation();
      tooltips.hideInventoryTooltip();
      // Sell item on right-click
      const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
      const itemToSell = game.player.inventory[itemIndex];
      if (itemToSell && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
        game.sellItem(itemToSell);
        game.player.inventory.splice(itemIndex, 1);
        game.needsInventoryUpdate = true;
        itemDiv.classList.add('selling');
        setTimeout(() => { updateUI(); }, 300);
      }
    });
    
    inventoryDiv.appendChild(itemDiv);
    game.needsInventoryUpdate = false;
  });
}




// Event Listeners
document.getElementById('save-game').addEventListener('click', () => game.save());
document.getElementById('load-game').addEventListener('click', () => {
  if (game.load()) {
    zones.changeZone(game, document, game.currentZone, combat.startCombat);
    setTimeout(() => combat.startCombat(game), 500);
    updateUI();
  }
});
document.getElementById('reset-game').addEventListener('click', () => game.reset());
document.getElementById('end-run-btn').addEventListener('click', () => {
  if (confirm(`Are you sure you want to ${game.currentDeathMessage.toLowerCase()}? This will end your current run and trigger ascension.`)) {
    // Kill the player by setting HP to 0 and triggering death
    game.player.hp = 0;
    game.handlePlayerDeath();
  }
});
document.getElementById('ascend-btn').addEventListener('click', () => combat.hideDeathScreen(game, document));
document.getElementById('confirm-ascend').addEventListener('click', () => {
  
  // Send player to starting zone
  zones.changeZone(game, document, 'basement', combat.startCombat);
  updateUI();
  talentTrees.hideTalentTree(game, document);
});

// Character slot click handlers
document.querySelectorAll('.character-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const slotType = slot.getAttribute('data-slot');
    const equippedItem = game.player.equipment[slotType];
    
    if (equippedItem) {
      // Unequip item
      const itemWithTimestamp = { ...equippedItem, type: slotType, addedTimestamp: Date.now() };
      game.player.inventory.push(itemWithTimestamp);
      game.player.equipment[slotType] = null;
      game.needsCharacterUpdate = true;
      game.needsInventoryUpdate = true;
      game.calculateStats(game);
      game.addLogMessage(`Unequipped ${equippedItem.fullName || equippedItem.name}`, 'system');
      
      // Add unequip animation
      slot.classList.add('damage-animation');
      setTimeout(() => {
        slot.classList.remove('damage-animation');
        updateUI();
      }, 300);
    } else {
      game.addLogMessage(`No item equipped in ${slotType} slot`, 'system');
    }
  });
});

// Stats tooltip event handlers
document.querySelectorAll('.stat-tooltip-item').forEach(item => {
  const tooltipType = item.getAttribute('data-tooltip');
  
  item.addEventListener('mouseenter', (e) => {
    tooltips.showStatsTooltip(game, e, tooltipType);
  });
  
  item.addEventListener('mouseleave', () => {
    tooltips.hideStatsTooltip();
  });
  
  item.addEventListener('mousemove', (e) => {
    tooltips.updateStatsTooltipPosition(e, document);
  });
});

// Game Loop
let lastUpdateTime = 0;
let lastFrameTime = 0;
const UI_INTERVAL = 100; // UI update every 0.1 seconds for smooth attack bars

function gameLoop(currentTime = performance.now()) {
  // Initialize lastFrameTime on first call
  if (lastFrameTime === 0) {
    lastFrameTime = currentTime;
  }
  
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  
  // Update passive systems for Knowledge talents
  game.updatePassiveSystems(currentTime);
  
  // Update attack bars every frame when combat is active
  if (game.combat.isActive && game.currentEnemy && game.currentZone !== 'restArea') {
    game.updateAttackBars(deltaTime);
  }
  
  // Update respawn timer when active
  if (game.respawnTimer.isActive && game.currentZone !== 'restArea') {
    game.updateRespawnTimer(deltaTime);
  }
  
  // Update UI less frequently to prevent performance issues
  if (currentTime - lastUpdateTime >= UI_INTERVAL) {
    updateUI();
    lastUpdateTime = currentTime;
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize Game
function initGame() {
  game.calculateStats();
  zones.checkZoneUnlocks(game, document, combat.startCombat);
  zones.initializeZones(game, document, combat.startCombat);
  zones.changeZone(game, document, 'basement', combat.startCombat);
  updateUI();

  
  // Initialize the end run button text
  deathMessages.updateEndRunButton(game, document);
  
  // Set up activity log event listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      game.setLogFilter(filter);
    });
  });

  document.getElementById('clear-log').addEventListener('click', () => {
    if (confirm('Clear all activity log entries?')) {
      game.clearActivityLog();
    }
  });

  // Set up inventory control event listeners
  document.getElementById('inventory-sort').addEventListener('change', (e) => {
    game.inventorySettings.sortBy = e.target.value;
    game.needsInventoryUpdate = true;
    updateInventory();
  });

  document.getElementById('inventory-filter').addEventListener('change', (e) => {
    game.inventorySettings.filterBy = e.target.value;
    game.needsInventoryUpdate = true;
    updateInventory();
  });

  document.getElementById('auto-sell-btn').addEventListener('click', () => {
    // Load current settings into modal (no need to load enabled state since it's outside)
    document.getElementById('auto-sell-common').checked = game.inventorySettings.autoSell.rarities.common;
    document.getElementById('auto-sell-uncommon').checked = game.inventorySettings.autoSell.rarities.uncommon;
    document.getElementById('auto-sell-rare').checked = game.inventorySettings.autoSell.rarities.rare;
    
    document.getElementById('auto-sell-weapons').checked = game.inventorySettings.autoSell.types.weapon;
    document.getElementById('auto-sell-offhand').checked = game.inventorySettings.autoSell.types.offhand;
    document.getElementById('auto-sell-helmets').checked = game.inventorySettings.autoSell.types.helmet;
    document.getElementById('auto-sell-body').checked = game.inventorySettings.autoSell.types.body;
    document.getElementById('auto-sell-legs').checked = game.inventorySettings.autoSell.types.legs;
    document.getElementById('auto-sell-belt').checked = game.inventorySettings.autoSell.types.belt;
    document.getElementById('auto-sell-boots').checked = game.inventorySettings.autoSell.types.boots;
    document.getElementById('auto-sell-necklaces').checked = game.inventorySettings.autoSell.types.necklace;
    document.getElementById('auto-sell-rings').checked = game.inventorySettings.autoSell.types.ring;
    
    // Show modal
    document.getElementById('auto-sell-modal').style.display = 'flex';
  });

  // Auto-sell modal event listeners
  document.getElementById('close-auto-sell').addEventListener('click', () => {
    document.getElementById('auto-sell-modal').style.display = 'none';
  });

  document.getElementById('save-auto-sell').addEventListener('click', () => {
    // Save auto-sell settings (enabled state is handled by the main checkbox)
    game.inventorySettings.autoSell.rarities.common = document.getElementById('auto-sell-common').checked;
    game.inventorySettings.autoSell.rarities.uncommon = document.getElementById('auto-sell-uncommon').checked;
    game.inventorySettings.autoSell.rarities.rare = document.getElementById('auto-sell-rare').checked;
    
    game.inventorySettings.autoSell.types.weapon = document.getElementById('auto-sell-weapons').checked;
    game.inventorySettings.autoSell.types.offhand = document.getElementById('auto-sell-offhand').checked;
    game.inventorySettings.autoSell.types.helmet = document.getElementById('auto-sell-helmets').checked;
    game.inventorySettings.autoSell.types.body = document.getElementById('auto-sell-body').checked;
    game.inventorySettings.autoSell.types.legs = document.getElementById('auto-sell-legs').checked;
    game.inventorySettings.autoSell.types.belt = document.getElementById('auto-sell-belt').checked;
    game.inventorySettings.autoSell.types.boots = document.getElementById('auto-sell-boots').checked;
    game.inventorySettings.autoSell.types.necklace = document.getElementById('auto-sell-necklaces').checked;
    game.inventorySettings.autoSell.types.ring = document.getElementById('auto-sell-rings').checked;
    
    // Auto-sell existing inventory items that match criteria
    if (game.inventorySettings.autoSell.enabled) {
      const itemsToSell = [];
      
      // Find items that match auto-sell criteria
      game.player.inventory.forEach((item, index) => {
        if (game.shouldAutoSell(item)) {
          itemsToSell.push({ item, index });
        }
      });
      
      // Sell items (reverse order to maintain indices)
      if (itemsToSell.length > 0) {
        let totalGold = 0;
        itemsToSell.reverse().forEach(({ item, index }) => {
          totalGold += game.sellItem(item, false);
          game.player.inventory.splice(index, 1);
          game.needsInventoryUpdate = true;
        });
        
        game.addLogMessage(`💰 Auto-sold ${itemsToSell.length} existing items for ${totalGold} total gold`, 'shop');
      }
    }
    
    document.getElementById('auto-sell-modal').style.display = 'none';
    game.addLogMessage('💾 Auto-sell settings saved', 'system');
  });
  
  // Main auto-sell toggle event listener
  document.getElementById('auto-sell-enabled-main').addEventListener('change', (e) => {
    game.inventorySettings.autoSell.enabled = e.target.checked;
    
    if (e.target.checked) {
      game.addLogMessage('✅ Auto-sell enabled', 'system');
      
      // Auto-sell existing inventory items that match criteria
      const itemsToSell = [];
      
      // Find items that match auto-sell criteria
      game.player.inventory.forEach((item, index) => {
        if (game.shouldAutoSell(item)) {
          itemsToSell.push({ item, index });
        }
      });
      
      // Sell items (reverse order to maintain indices)
      if (itemsToSell.length > 0) {
        let totalGold = 0;
        itemsToSell.reverse().forEach(({ item, index }) => {
          totalGold += game.sellItem(item, false);
          game.player.inventory.splice(index, 1);
          game.needsInventoryUpdate = true;
        });
        
        game.addLogMessage(`💰 Auto-sold ${itemsToSell.length} existing items for ${totalGold} total gold`, 'shop');
      }
    } else {
      game.addLogMessage('❌ Auto-sell disabled', 'system');
    }
  });
  
  // Initialize main auto-sell checkbox with current setting
  document.getElementById('auto-sell-enabled-main').checked = game.inventorySettings.autoSell.enabled;
  
  // Add initial welcome message
  game.addLogMessage('🎮 Welcome to the Idle RPG! Your adventure begins...', 'system');
  
  // Try to load saved game
  // if (localStorage.getItem('idleRPG_save')) {
  //   if (confirm('Found a saved game. Would you like to load it?')) {
  //     game.load();
  //     zones.changeZone(game.currentZone, game);
  //     game.addLogMessage('📂 Game loaded successfully!', 'system');
  //   }
  // }
  
  // Fix character items that might be missing the 'type' property (from older saves or initialization)
  Object.keys(game.player.equipment).forEach(slot => {
    const item = game.player.equipment[slot];
    if (item) {
      if (!item.type) {
        item.type = slot; // Set the type to match the equipment slot
      }
    }
  });
  
  updateUI();
  gameLoop();
}

// Preload all SVG gear icons to prevent loading delays
function preloadGearIcons() {
  const iconNames = [
    'sword', 'axe', 'mace', 'dagger', 'staff', 'greatsword', 'battleaxe', 'warhammer',
    'buckler', 'round-shield', 'tower-shield', 'tome',
    'helmet', 'cap', 'crown', 'hood',
    'armor', 'robe', 'vest', 'tunic',
    'greaves', 'pants', 'leggings', 'shorts',
    'sandals', 'boots', 'heavy-boots', 'speed-boots',
    'leather-belt', 'utility-belt', 'chain-belt', 'war-belt',
    'amulet', 'pendant', 'ring', 'bracelet'
  ];
  
  iconNames.forEach(iconName => {
    const img = new Image();
    img.src = getAssetUrl(`assets/gear/${iconName}.svg`);
    // Optional: add to a cache or just let browser cache handle it
  });
}

// Add event listeners for shift key tracking
document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = true;
    // Refresh tooltip if currently showing
    if (currentTooltipItem && currentTooltipEvent) {
      tooltips.showInventoryTooltip(game, document, currentTooltipEvent, currentTooltipItem, isShiftPressed);
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = false;
    // Refresh tooltip if currently showing
    if (currentTooltipItem && currentTooltipEvent) {
      tooltips.showInventoryTooltip(game, document, currentTooltipEvent, currentTooltipItem, isShiftPressed);
    }
  }
});

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  preloadGearIcons();
  initGame();
});