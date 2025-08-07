import './style.css'

// Game State Management
class GameState {
  constructor() {
    this.player = {
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      equipmentAttack: 0,
      equipmentDefense: 0,
      gold: 0,
      xp: 0,
      nextLevelXp: 100,
      equipment: {
        weapon: { name: 'Rusty Sword', attack: 5, defense: 0 },
        helmet: null,
        body: null,
        legs: null,
        accessory: null
      },
      inventory: []
    };
    
    this.currentZone = 'forest';
    this.currentEnemy = null;
    this.combat = {
      isActive: false,
      playerTurn: true,
      lastAttackTime: 0,
      attackInterval: 2000 // 2 seconds
    };

    // Activity log system
    this.activityLog = [];
    this.logFilter = 'all'; // 'all', 'combat', 'shop', 'system'
    
    this.zones = {
      town: {
        name: '🏘️ Town',
        description: 'A peaceful place to rest and shop',
        enemies: [],
        isShop: true
      },
      forest: {
        name: '🌲 Dark Forest',
        description: 'A mysterious forest filled with creatures',
        enemies: [
          { name: 'Slime', emoji: '🟢', hp: 50, attack: 8, defense: 3, xp: 15, gold: 5 },
          { name: 'Goblin', emoji: '👹', hp: 80, attack: 12, defense: 5, xp: 25, gold: 10 },
          { name: 'Wolf', emoji: '🐺', hp: 70, attack: 15, defense: 4, xp: 20, gold: 8 }
        ]
      },
      cave: {
        name: '🕳️ Mysterious Cave',
        description: 'Deep caves with stronger monsters',
        enemies: [
          { name: 'Orc', emoji: '👺', hp: 120, attack: 18, defense: 8, xp: 35, gold: 15 },
          { name: 'Skeleton', emoji: '💀', hp: 100, attack: 20, defense: 6, xp: 30, gold: 12 },
          { name: 'Spider', emoji: '🕷️', hp: 90, attack: 16, defense: 4, xp: 28, gold: 10 }
        ]
      },
      mountain: {
        name: '⛰️ Snowy Mountains',
        description: 'Treacherous peaks with powerful foes',
        enemies: [
          { name: 'Yeti', emoji: '🧊', hp: 200, attack: 25, defense: 12, xp: 50, gold: 25 },
          { name: 'Dragon', emoji: '🐉', hp: 300, attack: 35, defense: 15, xp: 80, gold: 50 },
          { name: 'Giant', emoji: '👹', hp: 250, attack: 30, defense: 10, xp: 65, gold: 35 }
        ]
      }
    };
    
    this.shopItems = [
      { name: 'Iron Sword', type: 'weapon', attack: 15, defense: 0, price: 100 },
      { name: 'Steel Helmet', type: 'helmet', attack: 0, defense: 8, price: 80 },
      { name: 'Leather Armor', type: 'body', attack: 0, defense: 12, price: 120 },
      { name: 'Chain Legs', type: 'legs', attack: 0, defense: 10, price: 100 },
      { name: 'Magic Ring', type: 'accessory', attack: 5, defense: 5, price: 150 },
      { name: 'Steel Sword', type: 'weapon', attack: 25, defense: 0, price: 250 },
      { name: 'Iron Plate', type: 'body', attack: 0, defense: 20, price: 300 },
      { name: 'Dragon Sword', type: 'weapon', attack: 40, defense: 0, price: 500 }
    ];
  }
}

// Item Rarity System
const ITEM_RARITIES = {
  common: {
    name: 'Common',
    color: '#9CA3AF', // Gray
    chance: 50,
    statMultiplier: 1,
    affixCount: 0,
    prefix: '',
    suffix: ''
  },
  uncommon: {
    name: 'Uncommon',
    color: '#10B981', // Green
    chance: 30,
    statMultiplier: 1.2,
    affixCount: 1,
    prefix: ['Sturdy', 'Sharp', 'Keen', 'Fine'],
    suffix: ['of Power', 'of Might', 'of the Warrior']
  },
  rare: {
    name: 'Rare',
    color: '#3B82F6', // Blue
    chance: 15,
    statMultiplier: 1.5,
    affixCount: 2,
    prefix: ['Masterwork', 'Superior', 'Enhanced', 'Reinforced'],
    suffix: ['of the Elite', 'of Excellence', 'of the Champion', 'of Mastery']
  },
  epic: {
    name: 'Epic',
    color: '#8B5CF6', // Purple
    chance: 4,
    statMultiplier: 2,
    affixCount: 3,
    prefix: ['Legendary', 'Ancient', 'Mythical', 'Heroic'],
    suffix: ['of the Gods', 'of Legends', 'of Heroes', 'of Destiny']
  },
  legendary: {
    name: 'Legendary',
    color: '#F59E0B', // Orange/Gold
    chance: 1,
    statMultiplier: 3,
    affixCount: 4,
    prefix: ['Divine', 'Celestial', 'Eternal', 'Transcendent'],
    suffix: ['of the Immortals', 'of Eternity', 'of the Divine', 'of Transcendence']
  }
};

const BASE_ITEMS = {
  weapon: [
    { name: 'Sword', attack: 10, defense: 0 },
    { name: 'Axe', attack: 12, defense: 0 },
    { name: 'Mace', attack: 8, defense: 2 },
    { name: 'Dagger', attack: 6, defense: 0 },
    { name: 'Staff', attack: 7, defense: 1 }
  ],
  helmet: [
    { name: 'Helmet', attack: 0, defense: 5 },
    { name: 'Cap', attack: 0, defense: 3 },
    { name: 'Crown', attack: 2, defense: 4 },
    { name: 'Hood', attack: 1, defense: 2 }
  ],
  body: [
    { name: 'Armor', attack: 0, defense: 12 },
    { name: 'Robe', attack: 3, defense: 8 },
    { name: 'Vest', attack: 1, defense: 10 },
    { name: 'Tunic', attack: 0, defense: 6 }
  ],
  legs: [
    { name: 'Greaves', attack: 0, defense: 8 },
    { name: 'Pants', attack: 1, defense: 6 },
    { name: 'Leggings', attack: 0, defense: 7 },
    { name: 'Shorts', attack: 2, defense: 4 }
  ],
  accessory: [
    { name: 'Ring', attack: 3, defense: 3 },
    { name: 'Amulet', attack: 5, defense: 2 },
    { name: 'Pendant', attack: 2, defense: 4 },
    { name: 'Bracelet', attack: 4, defense: 1 }
  ]
};

function generateRandomItem() {
  // Determine rarity
  const rarityRoll = Math.random() * 100;
  let selectedRarity = 'common';
  let cumulativeChance = 0;
  
  for (const [rarity, data] of Object.entries(ITEM_RARITIES)) {
    cumulativeChance += data.chance;
    if (rarityRoll <= cumulativeChance) {
      selectedRarity = rarity;
      break;
    }
  }
  
  // Select random item type and base item
  const itemTypes = Object.keys(BASE_ITEMS);
  const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const baseItems = BASE_ITEMS[selectedType];
  const baseItem = baseItems[Math.floor(Math.random() * baseItems.length)];
  
  const rarityData = ITEM_RARITIES[selectedRarity];
  
  // Create the item
  const item = {
    name: baseItem.name,
    type: selectedType,
    rarity: selectedRarity,
    attack: Math.floor(baseItem.attack * rarityData.statMultiplier),
    defense: Math.floor(baseItem.defense * rarityData.statMultiplier),
    attackSpeed: 0,
    critChance: 0,
    critDamage: 0,
    lifeSteal: 0,
    dodge: 0,
    blockChance: 0,
    price: Math.floor((baseItem.attack + baseItem.defense) * rarityData.statMultiplier * 10)
  };
  
  // Add random affixes based on rarity
  const affixCount = rarityData.affixCount;
  const availableStats = ['attackSpeed', 'critChance', 'critDamage', 'lifeSteal', 'dodge', 'blockChance'];
  
  for (let i = 0; i < affixCount; i++) {
    if (availableStats.length === 0) break;
    
    const randomStatIndex = Math.floor(Math.random() * availableStats.length);
    const randomStat = availableStats[randomStatIndex];
    availableStats.splice(randomStatIndex, 1);
    
    // Generate stat value based on rarity
    let statValue = 0;
    switch (randomStat) {
      case 'attackSpeed':
        statValue = Math.floor(Math.random() * 20 + 5) * rarityData.statMultiplier;
        break;
      case 'critChance':
        statValue = Math.floor(Math.random() * 10 + 2) * rarityData.statMultiplier;
        break;
      case 'critDamage':
        statValue = Math.floor(Math.random() * 30 + 10) * rarityData.statMultiplier;
        break;
      case 'lifeSteal':
        statValue = Math.floor(Math.random() * 8 + 2) * rarityData.statMultiplier;
        break;
      case 'dodge':
        statValue = Math.floor(Math.random() * 15 + 3) * rarityData.statMultiplier;
        break;
      case 'blockChance':
        statValue = Math.floor(Math.random() * 12 + 3) * rarityData.statMultiplier;
        break;
    }
    
    item[randomStat] = Math.floor(statValue);
  }
  
  // Generate name with prefix/suffix
  let fullName = item.name;
  
  if (rarityData.prefix && rarityData.prefix.length > 0) {
    const prefix = rarityData.prefix[Math.floor(Math.random() * rarityData.prefix.length)];
    fullName = `${prefix} ${fullName}`;
  }
  
  if (rarityData.suffix && rarityData.suffix.length > 0) {
    const suffix = rarityData.suffix[Math.floor(Math.random() * rarityData.suffix.length)];
    fullName = `${fullName} ${suffix}`;
  }
  
  item.fullName = fullName;
  
  return item;
}

// Continue GameState class methods
GameState.prototype.calculateStats = function() {
    let totalAttack = 10; // Base attack
    let totalDefense = 5; // Base defense
    let equipmentAttack = 0;
    let equipmentDefense = 0;
    
    for (const slot in this.player.equipment) {
      const item = this.player.equipment[slot];
      if (item) {
        equipmentAttack += item.attack || 0;
        equipmentDefense += item.defense || 0;
      }
    }
    
    this.player.attack = totalAttack + equipmentAttack;
    this.player.defense = totalDefense + equipmentDefense;
    this.player.equipmentAttack = equipmentAttack;
    this.player.equipmentDefense = equipmentDefense;
};

GameState.prototype.addToInventory = function(item) {
    this.player.inventory.push(item);
};

GameState.prototype.equipItem = function(item, fromInventory = false, inventoryIndex = -1) {
    console.log('equipItem called with:', { item, fromInventory, inventoryIndex }); // Debug log
    const slot = item.type;
    
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
      attack: item.attack || 0,
      defense: item.defense || 0
    };
    
    console.log('Equipping to slot:', slot, 'new item:', newEquipmentItem); // Debug log
    
    // Equip the new item
    this.player.equipment[slot] = newEquipmentItem;
    
    // Handle inventory management
    if (fromInventory && inventoryIndex >= 0) {
      console.log('Removing from inventory at index:', inventoryIndex, 'inventory before:', [...this.player.inventory]); // Debug log
      
      // Remove the item from inventory using the provided index
      this.player.inventory.splice(inventoryIndex, 1);
      
      console.log('Inventory after removal:', [...this.player.inventory]); // Debug log
      
      // Add the previously equipped item to inventory if there was one
      if (currentlyEquipped) {
        console.log('Adding previously equipped item to inventory:', currentlyEquipped); // Debug log
        this.addToInventory(currentlyEquipped);
      }
    }
    
    this.calculateStats();
    console.log('Stats after equipping:', { attack: this.player.attack, defense: this.player.defense }); // Debug log
  }
  
  spawnEnemy() {
    const zone = this.zones[this.currentZone];
    if (!zone.enemies || zone.enemies.length === 0) return null;
    
    const enemyTemplate = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
    return {
      ...enemyTemplate,
      maxHp: enemyTemplate.hp
    };
  }
  
  gainXp(amount) {
    this.player.xp += amount;
    
    while (this.player.xp >= this.player.nextLevelXp) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.player.xp -= this.player.nextLevelXp;
    this.player.level++;
    this.player.nextLevelXp = Math.floor(this.player.nextLevelXp * 1.2);
    
    // Increase base stats
    this.player.maxHp += 10;
    this.player.hp = this.player.maxHp; // Full heal on level up
    
    // Show level up animation
    document.getElementById('player-level').classList.add('level-up');
    setTimeout(() => {
      document.getElementById('player-level').classList.remove('level-up');
    }, 500);
    
    this.addCombatMessage(`🎉 Level up! You are now level ${this.player.level}!`, 'level-up');
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
      currentZone: this.currentZone
    };
    localStorage.setItem('idleRPG_save', JSON.stringify(saveData));
    alert('Game saved successfully!');
  }
  
  load() {
    const saveData = localStorage.getItem('idleRPG_save');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.player = { ...this.player, ...data.player };
      this.currentZone = data.currentZone || 'forest';
      this.calculateStats();
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
}

// Game instance
const game = new GameState();

// UI Updates
function updateUI() {
  // Update player stats
  document.getElementById('player-level').textContent = game.player.level;
  document.getElementById('player-hp').textContent = game.player.hp;
  document.getElementById('player-max-hp').textContent = game.player.maxHp;
  document.getElementById('player-gold').textContent = game.player.gold;
  document.getElementById('player-xp').textContent = game.player.xp;
  document.getElementById('player-next-xp').textContent = game.player.nextLevelXp;
  document.getElementById('player-attack').textContent = game.player.attack;
  document.getElementById('player-defense').textContent = game.player.defense;
  
  // Update detailed stats panel
  updateStatsPanel();
  
  // Update activity log
  // game.updateActivityLog(); // Temporarily commented out to reduce console spam
  
  // Update player HP bar
  const playerHpPercent = (game.player.hp / game.player.maxHp) * 100;
  document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
  
  // Update enemy info
  if (game.currentEnemy) {
    document.getElementById('enemy-title').textContent = `${game.currentEnemy.emoji} ${game.currentEnemy.name}`;
    document.getElementById('enemy-attack').textContent = game.currentEnemy.attack;
    document.getElementById('enemy-defense').textContent = game.currentEnemy.defense;
    
    const enemyHpPercent = (game.currentEnemy.hp / game.currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
  }
  
  // Update equipment
  for (const slot in game.player.equipment) {
    const item = game.player.equipment[slot];
    const element = document.getElementById(`${slot}-item`);
    if (element) {
      element.textContent = item ? item.name : 'None';
      const slotElement = element.closest('.equipment-slot');
      if (item) {
        slotElement.classList.add('has-item');
      } else {
        slotElement.classList.remove('has-item');
      }
    }
  }
  
  // Update inventory
  updateInventory();
  
  // Update shop if in town
  if (game.currentZone === 'town') {
    updateShop();
  }
}

function updateStatsPanel() {
  document.getElementById('stats-level').textContent = game.player.level;
  document.getElementById('stats-base-attack').textContent = '10';
  document.getElementById('stats-eq-attack').textContent = `+${game.player.equipmentAttack || 0}`;
  document.getElementById('stats-total-attack').textContent = game.player.attack;
  document.getElementById('stats-base-defense').textContent = '5';
  document.getElementById('stats-eq-defense').textContent = `+${game.player.equipmentDefense || 0}`;
  document.getElementById('stats-total-defense').textContent = game.player.defense;
  document.getElementById('stats-max-hp').textContent = game.player.maxHp;
  document.getElementById('stats-gold').textContent = game.player.gold;
  document.getElementById('stats-xp-progress').textContent = `${game.player.xp}/${game.player.nextLevelXp}`;
  
  // Add color coding for equipment bonuses
  const eqAttack = document.getElementById('stats-eq-attack');
  const eqDefense = document.getElementById('stats-eq-defense');
  
  eqAttack.className = 'stat-value';
  eqDefense.className = 'stat-value';
  
  if (game.player.equipmentAttack > 0) {
    eqAttack.classList.add('positive');
  }
  if (game.player.equipmentDefense > 0) {
    eqDefense.classList.add('positive');
  }
}

function updateInventory() {
  const inventoryDiv = document.getElementById('inventory-items');
  
  if (!inventoryDiv) {
    console.error('Inventory div not found!');
    return;
  }
  
  // Check if inventory has actually changed
  const currentInventoryLength = inventoryDiv.children.length;
  const actualInventoryLength = game.player.inventory.length === 0 ? 1 : game.player.inventory.length; // 1 for empty message
  
  // Only rebuild if inventory length changed or if we're switching between empty/non-empty
  const hasEmptyMessage = inventoryDiv.querySelector('.inventory-empty') !== null;
  const shouldHaveEmptyMessage = game.player.inventory.length === 0;
  
  if (currentInventoryLength === actualInventoryLength && hasEmptyMessage === shouldHaveEmptyMessage) {
    return; // No need to rebuild
  }
  
  inventoryDiv.innerHTML = '';
  
  if (game.player.inventory.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'inventory-empty';
    emptyDiv.textContent = 'No items in inventory';
    emptyDiv.style.color = 'var(--light-color)';
    emptyDiv.style.fontStyle = 'italic';
    emptyDiv.style.textAlign = 'center';
    emptyDiv.style.padding = '20px';
    inventoryDiv.appendChild(emptyDiv);
    return;
  }
  
  game.player.inventory.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.setAttribute('data-item-index', index);
    
    itemDiv.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-stats">
        ATK: ${item.attack || 0} | DEF: ${item.defense || 0}
      </div>
      <div class="item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
      <div class="click-hint">Click to Equip</div>
    `;
    
    // Remove the bright test colors now that we know it works
    // itemDiv.style.border = '3px solid red';
    // itemDiv.style.backgroundColor = 'yellow';
    
    // Add click handler to equip item
    itemDiv.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
      const itemToEquip = game.player.inventory[itemIndex];
      
      if (itemToEquip && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
        // Create a copy for equipping
        const equipItem = { ...itemToEquip };
        
        // Equip the item with the inventory index
        game.equipItem(equipItem, true, itemIndex);
        game.addLogMessage(`✨ Equipped ${equipItem.name}!`, 'system');
        
        // Add visual feedback
        itemDiv.classList.add('equipping');
        setTimeout(() => {
          updateUI();
        }, 300);
      }
    });
    
    inventoryDiv.appendChild(itemDiv);
  });
}

function updateShop() {
  if (game.currentZone !== 'town') return;
  
  const shopDiv = document.getElementById('shop-items');
  const shopGold = document.getElementById('shop-gold');
  
  // Update gold display in shop
  if (shopGold) {
    shopGold.textContent = game.player.gold;
  }
  
  shopDiv.innerHTML = '';
  
  game.shopItems.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shop-item';
    
    const canAfford = game.player.gold >= item.price;
    
    itemDiv.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-stats">
        ATK: ${item.attack || 0} | DEF: ${item.defense || 0}
      </div>
      <div class="item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
      <div class="item-price ${canAfford ? 'affordable' : 'expensive'}">${item.price}g</div>
    `;
    
    if (canAfford) {
      itemDiv.addEventListener('click', () => {
        game.player.gold -= item.price;
        const purchasedItem = { ...item };
        game.addToInventory(purchasedItem);
        game.addLogMessage(`💰 Purchased ${item.name} for ${item.price} gold`, 'shop');
        
        // Add purchase animation
        itemDiv.classList.add('purchasing');
        setTimeout(() => {
          updateUI();
        }, 300);
      });
    } else {
      itemDiv.style.opacity = '0.6';
      itemDiv.style.cursor = 'not-allowed';
      itemDiv.title = `Need ${item.price - game.player.gold} more gold`;
    }
    
    shopDiv.appendChild(itemDiv);
  });
}

// Combat System
function startCombat() {
  if (game.currentZone === 'town') return;
  
  if (!game.currentEnemy) {
    game.currentEnemy = game.spawnEnemy();
    if (!game.currentEnemy) return;
    
    game.addCombatMessage(`A wild ${game.currentEnemy.name} appears!`);
    game.combat.isActive = true;
    game.combat.lastAttackTime = Date.now();
  }
}

function performCombat() {
  if (!game.combat.isActive || !game.currentEnemy || game.currentZone === 'town') return;
  
  const now = Date.now();
  if (now - game.combat.lastAttackTime < game.combat.attackInterval) return;
  
  if (game.combat.playerTurn) {
    // Player attacks - TESTING: One-hit kill
    const damage = game.currentEnemy.hp; // Instant kill for testing
    game.currentEnemy.hp -= damage;
    game.addCombatMessage(`You attack ${game.currentEnemy.name} for ${damage} damage! [ONE-HIT KILL]`, 'player-attack');
    
    // Add damage animation
    document.querySelector('.enemy-side').classList.add('damage-animation');
    setTimeout(() => {
      document.querySelector('.enemy-side').classList.remove('damage-animation');
    }, 300);
    
    if (game.currentEnemy.hp <= 0) {
      // Enemy defeated
      const goldGained = game.currentEnemy.gold;
      const xpGained = game.currentEnemy.xp;
      
      game.player.gold += goldGained;
      game.gainXp(xpGained);
      
      game.addCombatMessage(`${game.currentEnemy.name} defeated! Gained ${goldGained} gold and ${xpGained} XP!`, 'enemy-defeated');
      
      // TESTING: Guaranteed item drop
      const droppedItem = generateRandomItem();
      game.addToInventory(droppedItem);
      game.addCombatMessage(`${game.currentEnemy.name} dropped ${droppedItem.fullName}!`, 'enemy-defeated');
      
      game.currentEnemy = null;
      game.combat.isActive = false;
      
      // Spawn new enemy after a delay
      setTimeout(() => {
        startCombat();
      }, 1000);
    }
  } else {
    // Enemy attacks
    const damage = Math.max(1, game.currentEnemy.attack - game.player.defense + Math.floor(Math.random() * 3));
    game.player.hp -= damage;
    game.addCombatMessage(`${game.currentEnemy.name} attacks you for ${damage} damage!`, 'enemy-attack');
    
    // Add damage animation
    document.querySelector('.player-side').classList.add('damage-animation');
    setTimeout(() => {
      document.querySelector('.player-side').classList.remove('damage-animation');
    }, 300);
    
    if (game.player.hp <= 0) {
      // Player defeated
      const goldLost = Math.floor(game.player.gold * 0.2);
      game.player.gold = Math.max(0, game.player.gold - goldLost);
      game.player.hp = 1;
      
      game.addCombatMessage('You were defeated! Lost some gold but managed to escape...', 'enemy-attack');
      game.currentEnemy = null;
      game.combat.isActive = false;
      
      // Show death screen
      showDeathScreen(goldLost);
      return; // Don't continue combat
    }
  }
  
  game.combat.playerTurn = !game.combat.playerTurn;
  game.combat.lastAttackTime = now;
}

// Death Screen Functions
function showDeathScreen(goldLost) {
  const deathModal = document.getElementById('death-modal');
  const goldLostSpan = document.getElementById('gold-lost');
  
  goldLostSpan.textContent = goldLost;
  deathModal.style.display = 'flex';
  
  // Pause game loop temporarily
  game.combat.isActive = false;
}

function hideDeathScreen() {
  const deathModal = document.getElementById('death-modal');
  deathModal.style.display = 'none';
  
  // Send player to town
  changeZone('town');
  updateUI();
}

// Zone Management
function changeZone(zoneName) {
  game.currentZone = zoneName;
  game.currentEnemy = null;
  game.combat.isActive = false;
  
  // Update zone buttons
  document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-zone="${zoneName}"]`).classList.add('active');

  // Show/hide appropriate areas based on zone
  const combatArea = document.querySelector('.combat-area');
  const shopArea = document.getElementById('shop-area');
  
  if (zoneName === 'town') {
    combatArea.style.display = 'none';
    shopArea.style.display = 'flex';
    game.addLogMessage('Welcome to the peaceful town. Rest and shop here.', 'system');
    updateShop(); // Update shop when entering town
    
    // Heal player gradually in town
    const healInterval = setInterval(() => {
      if (game.currentZone === 'town' && game.player.hp < game.player.maxHp) {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + 2);
        updateUI();
      } else {
        clearInterval(healInterval);
      }
    }, 1000);
  } else {
    combatArea.style.display = 'grid';
    shopArea.style.display = 'none';
    game.addLogMessage(`Entered ${game.zones[zoneName].name}. ${game.zones[zoneName].description}`, 'system');
    setTimeout(() => startCombat(), 500);
  }
  
  updateUI();
}

// Initialize zones
function initializeZones() {
  const zoneButtonsDiv = document.getElementById('zone-buttons');
  
  for (const [zoneKey, zone] of Object.entries(game.zones)) {
    const button = document.createElement('button');
    button.className = `zone-btn ${zoneKey === 'town' ? 'town' : ''}`;
    button.textContent = zone.name;
    button.setAttribute('data-zone', zoneKey);
    button.addEventListener('click', () => changeZone(zoneKey));
    zoneButtonsDiv.appendChild(button);
  }
}

// Event Listeners
document.getElementById('save-game').addEventListener('click', () => game.save());
document.getElementById('load-game').addEventListener('click', () => {
  if (game.load()) {
    updateUI();
    changeZone(game.currentZone);
  }
});
document.getElementById('reset-game').addEventListener('click', () => game.reset());
document.getElementById('respawn-btn').addEventListener('click', () => hideDeathScreen());

// Equipment slot click handlers
document.querySelectorAll('.equipment-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const slotType = slot.getAttribute('data-slot');
    const equippedItem = game.player.equipment[slotType];
    
    if (equippedItem) {
      // Unequip item
      game.addToInventory({ ...equippedItem, type: slotType });
      game.player.equipment[slotType] = null;
      game.calculateStats();
      game.addLogMessage(`Unequipped ${equippedItem.name}`, 'system');
      
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

// Game Loop
let lastUpdateTime = 0;
let lastCombatTime = 0;
const COMBAT_INTERVAL = 1000; // Combat every 1 second
const UI_INTERVAL = 500; // UI update every 0.5 seconds

function gameLoop(currentTime = performance.now()) {
  // Perform combat every 1 second
  if (currentTime - lastCombatTime >= COMBAT_INTERVAL) {
    performCombat();
    lastCombatTime = currentTime;
  }
  
  // Update UI every 0.5 seconds to prevent event interference
  if (currentTime - lastUpdateTime >= UI_INTERVAL) {
    updateUI();
    lastUpdateTime = currentTime;
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialize Game
function initGame() {
  game.calculateStats();
  initializeZones();
  changeZone('forest');
  
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
  
  // Add initial welcome message
  game.addLogMessage('🎮 Welcome to the Idle RPG! Your adventure begins...', 'system');
  
  // Try to load saved game
  if (localStorage.getItem('idleRPG_save')) {
    if (confirm('Found a saved game. Would you like to load it?')) {
      game.load();
      changeZone(game.currentZone);
      game.addLogMessage('📂 Game loaded successfully!', 'system');
    }
  }
  
  updateUI();
  gameLoop();
}

// Start the game
initGame();
