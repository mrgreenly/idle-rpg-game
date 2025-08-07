import './style.css'
import { ITEM_RARITIES, BASE_ITEMS, AFFIXES } from './data/items.js'
import { ZONES, SHOP_ITEMS } from './data/zones.js'
import { getRandomDeathMessage } from './data/deathMessages.js'

// Talent Tree Data
const TALENT_TREES = {
  exploration: {
    name: 'Path of Exploration',
    icon: '🗺️',
    description: 'Unlock new zones and content',
    nodes: [
      {
        id: 'exploration_1',
        name: 'Zone Scout',
        description: 'Unlocks additional zones earlier',
        effect: 'Reduce zone unlock level requirements by 2',
        cost: 50,
        maxLevel: 1,
        prerequisites: []
      },
      {
        id: 'exploration_2',
        name: 'Monster Hunter',
        description: 'Encounter rare enemies more often',
        effect: 'Increase rare enemy spawn chance by 25%',
        cost: 75,
        maxLevel: 1,
        prerequisites: ['exploration_1']
      },
      {
        id: 'exploration_3',
        name: 'Boss Slayer',
        description: 'Reduce boss requirements',
        effect: 'Reduce boss spawn requirements by 5 kills',
        cost: 100,
        maxLevel: 1,
        prerequisites: ['exploration_2']
      },
      {
        id: 'exploration_4',
        name: 'Zone Master',
        description: 'Access to exclusive high-tier zones',
        effect: 'Unlocks special endgame zones',
        cost: 200,
        maxLevel: 1,
        prerequisites: ['exploration_3']
      }
    ]
  },
  power: {
    name: 'Path of Power',
    icon: '⚔️',
    description: 'Increase combat effectiveness',
    nodes: [
      {
        id: 'power_1',
        name: 'Warrior Training',
        description: 'Increase base attack power',
        effect: '+5 base attack per level',
        cost: 40,
        maxLevel: 5,
        prerequisites: []
      },
      {
        id: 'power_2',
        name: 'Combat Mastery',
        description: 'Improve critical hit chance',
        effect: '+2% critical chance per level',
        cost: 60,
        maxLevel: 3,
        prerequisites: ['power_1']
      },
      {
        id: 'power_3',
        name: 'Berserker Rage',
        description: 'Increase attack speed',
        effect: '+10% attack speed per level',
        cost: 80,
        maxLevel: 3,
        prerequisites: ['power_2']
      },
      {
        id: 'power_4',
        name: 'Legendary Warrior',
        description: 'Massive combat bonuses',
        effect: '+50% damage, +25% crit chance',
        cost: 250,
        maxLevel: 1,
        prerequisites: ['power_3']
      }
    ]
  },
  wealth: {
    name: 'Path of Wealth',
    icon: '💰',
    description: 'Increase gold gain and rewards',
    nodes: [
      {
        id: 'wealth_1',
        name: 'Coin Collector',
        description: 'Increase gold drops from enemies',
        effect: '+25% gold gain per level',
        cost: 45,
        maxLevel: 4,
        prerequisites: []
      },
      {
        id: 'wealth_2',
        name: 'Lucky Find',
        description: 'Increase item drop chance',
        effect: '+10% item drop chance per level',
        cost: 70,
        maxLevel: 3,
        prerequisites: ['wealth_1']
      },
      {
        id: 'wealth_3',
        name: 'Treasure Hunter',
        description: 'Higher chance for rare items',
        effect: '+15% chance for higher rarity per level',
        cost: 90,
        maxLevel: 2,
        prerequisites: ['wealth_2']
      },
      {
        id: 'wealth_4',
        name: 'Golden Touch',
        description: 'Massive wealth bonuses',
        effect: 'Double gold gain, +50% item drops',
        cost: 300,
        maxLevel: 1,
        prerequisites: ['wealth_3']
      }
    ]
  },
  knowledge: {
    name: 'Path of Knowledge',
    icon: '📚',
    description: 'Increase experience gain',
    nodes: [
      {
        id: 'knowledge_1',
        name: 'Quick Learner',
        description: 'Gain experience faster',
        effect: '+20% experience gain per level',
        cost: 35,
        maxLevel: 5,
        prerequisites: []
      },
      {
        id: 'knowledge_2',
        name: 'Battle Wisdom',
        description: 'Bonus XP from combat victories',
        effect: '+50% bonus XP from defeating enemies per level',
        cost: 55,
        maxLevel: 3,
        prerequisites: ['knowledge_1']
      },
      {
        id: 'knowledge_3',
        name: 'Master Scholar',
        description: 'Reduce XP requirements for leveling',
        effect: '-10% XP needed per level (max 30%)',
        cost: 85,
        maxLevel: 3,
        prerequisites: ['knowledge_2']
      },
      {
        id: 'knowledge_4',
        name: 'Enlightened One',
        description: 'Transcendent learning abilities',
        effect: 'Triple XP gain, start at level 5',
        cost: 400,
        maxLevel: 1,
        prerequisites: ['knowledge_3']
      }
    ]
  }
};

// Global variable to track Shift key state
let isShiftPressed = false;

// Global variables to track current tooltip state
let currentTooltipItem = null;
let currentTooltipEvent = null;

function generateRandomItem() {
  // Determine rarity (excluding legendary for regular monster drops)
  const regularRarities = {
    common: ITEM_RARITIES.common,
    uncommon: ITEM_RARITIES.uncommon,
    rare: ITEM_RARITIES.rare,
    epic: ITEM_RARITIES.epic
  };
  
  const rarityRoll = Math.random() * 100;
  let selectedRarity = 'common';
  let cumulativeChance = 0;
  
  for (const [rarity, data] of Object.entries(regularRarities)) {
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
  
  // Create the item with base stats (no multiplier)
  const item = {
    name: baseItem.name,
    type: selectedType,
    rarity: selectedRarity,
    attack: baseItem.attack,
    defense: baseItem.defense,
    attackSpeed: baseItem.attackSpeed,
    critChance: baseItem.critChance,
    critDamage: baseItem.critDamage,
    lifeSteal: baseItem.lifeSteal,
    dodge: baseItem.dodge,
    blockChance: baseItem.blockChance,
    price: Math.floor((baseItem.attack + baseItem.defense) * 10),
    handType: baseItem.handType || '1h', // Include handType for weapons
    baseAttackInterval: baseItem.baseAttackInterval, // Include base attack interval for weapons
    prefixes: [],
    suffixes: []
  };

  // Add affixes based on rarity (limited to 3 prefixes and 3 suffixes max)
  const affixCount = rarityData.affixCount;
  if (affixCount > 0) {
    const maxPrefixes = Math.min(3, Math.ceil(affixCount / 2));
    const maxSuffixes = Math.min(3, affixCount - maxPrefixes);
    
    // Add prefixes - filter by item type
    const availablePrefixes = rarityData.prefix.filter(prefix => {
      const affixData = AFFIXES.prefix[prefix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxPrefixes && availablePrefixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePrefixes.length);
      const selectedPrefix = availablePrefixes.splice(randomIndex, 1)[0];
      item.prefixes.push(selectedPrefix);
      
      // Apply prefix stats
      const prefixStats = AFFIXES.prefix[selectedPrefix].stats;
      if (prefixStats) {
        Object.keys(prefixStats).forEach(stat => {
          item[stat] += prefixStats[stat];
        });
      }
    }
    
    // Add suffixes - filter by item type
    const availableSuffixes = rarityData.suffix.filter(suffix => {
      const affixData = AFFIXES.suffix[suffix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxSuffixes && availableSuffixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableSuffixes.length);
      const selectedSuffix = availableSuffixes.splice(randomIndex, 1)[0];
      item.suffixes.push(selectedSuffix);
      
      // Apply suffix stats
      const suffixStats = AFFIXES.suffix[selectedSuffix].stats;
      if (suffixStats) {
        Object.keys(suffixStats).forEach(stat => {
          item[stat] += suffixStats[stat];
        });
      }
    }
  }
  
  // Generate name with prefixes/suffixes
  let fullName = item.name;
  
  if (item.prefixes.length > 0) {
    const prefix = item.prefixes[Math.floor(Math.random() * item.prefixes.length)];
    fullName = `${prefix} ${fullName}`;
  }
  
  if (item.suffixes.length > 0) {
    const suffix = item.suffixes[Math.floor(Math.random() * item.suffixes.length)];
    fullName = `${fullName} ${suffix}`;
  }
  
  item.fullName = fullName;
  
  return item;
}

// Function for generating random items with zone-specific rarity restrictions
function generateRandomItemForZone(allowedRarities) {
  // Filter rarities to only those allowed in the zone
  const zoneRarities = {};
  allowedRarities.forEach(rarity => {
    if (ITEM_RARITIES[rarity]) {
      zoneRarities[rarity] = ITEM_RARITIES[rarity];
    }
  });
  
  // If no valid rarities, fallback to common
  if (Object.keys(zoneRarities).length === 0) {
    zoneRarities.common = ITEM_RARITIES.common;
  }
  
  const rarityRoll = Math.random() * 100;
  let selectedRarity = 'common';
  let cumulativeChance = 0;
  
  for (const [rarity, data] of Object.entries(zoneRarities)) {
    cumulativeChance += data.dropChance;
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
  
  // Create the item with base stats (no multiplier)
  const item = {
    name: baseItem.name,
    type: selectedType,
    rarity: selectedRarity,
    attack: baseItem.attack,
    defense: baseItem.defense,
    attackSpeed: baseItem.attackSpeed,
    critChance: baseItem.critChance,
    critDamage: baseItem.critDamage,
    lifeSteal: baseItem.lifeSteal,
    dodge: baseItem.dodge,
    blockChance: baseItem.blockChance,
    price: Math.floor((baseItem.attack + baseItem.defense) * 10),
    handType: baseItem.handType || '1h',
    baseAttackInterval: baseItem.baseAttackInterval,
    prefixes: [],
    suffixes: []
  };

  // Add affixes based on rarity (same logic as generateRandomItem)
  const affixCount = rarityData.affixCount;
  if (affixCount > 0) {
    const maxPrefixes = Math.min(3, Math.ceil(affixCount / 2));
    const maxSuffixes = Math.min(3, affixCount - maxPrefixes);
    
    // Add prefixes - filter by item type
    const availablePrefixes = rarityData.prefix.filter(prefix => {
      const affixData = AFFIXES.prefix[prefix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxPrefixes && availablePrefixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePrefixes.length);
      const selectedPrefix = availablePrefixes.splice(randomIndex, 1)[0];
      item.prefixes.push(selectedPrefix);
      
      // Apply prefix stats
      const prefixStats = AFFIXES.prefix[selectedPrefix].stats;
      if (prefixStats) {
        Object.keys(prefixStats).forEach(stat => {
          item[stat] += prefixStats[stat];
        });
      }
    }
    
    // Add suffixes - filter by item type
    const availableSuffixes = rarityData.suffix.filter(suffix => {
      const affixData = AFFIXES.suffix[suffix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxSuffixes && availableSuffixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableSuffixes.length);
      const selectedSuffix = availableSuffixes.splice(randomIndex, 1)[0];
      item.suffixes.push(selectedSuffix);
      
      // Apply suffix stats
      const suffixStats = AFFIXES.suffix[selectedSuffix].stats;
      if (suffixStats) {
        Object.keys(suffixStats).forEach(stat => {
          item[stat] += suffixStats[stat];
        });
      }
    }
  }
  
  // Generate name with prefixes/suffixes
  let fullName = item.name;
  
  if (item.prefixes.length > 0) {
    const prefix = item.prefixes[Math.floor(Math.random() * item.prefixes.length)];
    fullName = `${prefix} ${fullName}`;
  }
  
  if (item.suffixes.length > 0) {
    const suffix = item.suffixes[Math.floor(Math.random() * item.suffixes.length)];
    fullName = `${fullName} ${suffix}`;
  }
  
  item.fullName = fullName;
  
  return item;
}

// Function for generating legendary items (for bosses)
function generateLegendaryItem() {
  const selectedRarity = 'legendary';
  
  // Select random item type and base item
  const itemTypes = Object.keys(BASE_ITEMS);
  const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const baseItems = BASE_ITEMS[selectedType];
  const baseItem = baseItems[Math.floor(Math.random() * baseItems.length)];
  
  const rarityData = ITEM_RARITIES[selectedRarity];
  
  // Create the item with base stats (no multiplier)
  const item = {
    name: baseItem.name,
    type: selectedType,
    rarity: selectedRarity,
    attack: baseItem.attack,
    defense: baseItem.defense,
    attackSpeed: baseItem.attackSpeed,
    critChance: baseItem.critChance,
    critDamage: baseItem.critDamage,
    lifeSteal: baseItem.lifeSteal,
    dodge: baseItem.dodge,
    blockChance: baseItem.blockChance,
    timestamp: Date.now(),
    prefixes: [],
    suffixes: []
  };
  
  // Add handType for weapons
  if (selectedType === 'weapon' && baseItem.handType) {
    item.handType = baseItem.handType;
  }
  
  // Add base attack interval for weapons
  if (selectedType === 'weapon' && baseItem.baseAttackInterval) {
    item.baseAttackInterval = baseItem.baseAttackInterval;
  }
  
  // Add affixes based on rarity (limited to 2 prefixes and 2 suffixes max)
  const affixCount = rarityData.affixCount;
  if (affixCount > 0) {
    const maxPrefixes = Math.min(2, Math.ceil(affixCount / 2));
    const maxSuffixes = Math.min(2, affixCount - maxPrefixes);
    
    // Add prefixes - filter by item type
    const availablePrefixes = rarityData.prefix.filter(prefix => {
      const affixData = AFFIXES.prefix[prefix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxPrefixes && availablePrefixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePrefixes.length);
      const selectedPrefix = availablePrefixes.splice(randomIndex, 1)[0];
      item.prefixes.push(selectedPrefix);
      
      // Apply prefix stats
      const prefixStats = AFFIXES.prefix[selectedPrefix].stats;
      if (prefixStats) {
        Object.keys(prefixStats).forEach(stat => {
          item[stat] += prefixStats[stat];
        });
      }
    }
    
    // Add suffixes - filter by item type
    const availableSuffixes = rarityData.suffix.filter(suffix => {
      const affixData = AFFIXES.suffix[suffix];
      return affixData && affixData.allowedTypes.includes(selectedType);
    });
    
    for (let i = 0; i < maxSuffixes && availableSuffixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableSuffixes.length);
      const selectedSuffix = availableSuffixes.splice(randomIndex, 1)[0];
      item.suffixes.push(selectedSuffix);
      
      // Apply suffix stats
      const suffixStats = AFFIXES.suffix[selectedSuffix].stats;
      if (suffixStats) {
        Object.keys(suffixStats).forEach(stat => {
          item[stat] += suffixStats[stat];
        });
      }
    }
  }
  
  // Generate full name with affixes
  let fullName = baseItem.name;
  
  if (item.prefixes.length > 0) {
    const prefix = item.prefixes[Math.floor(Math.random() * item.prefixes.length)];
    fullName = `${prefix} ${fullName}`;
  }
  
  if (item.suffixes.length > 0) {
    const suffix = item.suffixes[Math.floor(Math.random() * item.suffixes.length)];
    fullName = `${fullName} ${suffix}`;
  }
  
  item.fullName = fullName;
  
  return item;
}

// Helper function to calculate attack interval from attack speed
function calculateAttackInterval(attackSpeed, baseInterval = 2000) {
  // Attack speed reduces the base interval
  // Formula: newInterval = baseInterval / (1 + attackSpeed/100)
  // Example: 50% attack speed -> 2000ms / (1 + 0.5) = 1333ms
  const speedMultiplier = 1 + (attackSpeed / 100);
  return Math.max(500, baseInterval / speedMultiplier); // Minimum 0.5 seconds
}

// Helper function to format item name with rarity
function formatItemNameWithRarity(item) {
  const rarityData = ITEM_RARITIES[item.rarity] || ITEM_RARITIES.common;
  
  // For common items, just show the base name
  if (item.rarity === 'common') {
    return item.name;
  }
  
  // For other rarities, combine prefixes, base name, and suffixes
  let displayName = item.name;
  
  // Add prefixes before the name
  if (item.prefixes && item.prefixes.length > 0) {
    displayName = item.prefixes.join(' ') + ' ' + displayName;
  }
  
  // Add suffixes after the name
  if (item.suffixes && item.suffixes.length > 0) {
    displayName = displayName + ' ' + item.suffixes.join(' ');
  }
  
  return displayName;
}

// Helper function to separate base stats from affix bonuses
function separateItemStats(item) {
  // Find the base item template
  const baseItems = BASE_ITEMS[item.type];
  const baseTemplate = baseItems?.find(base => base.name === item.name);
  
  if (!baseTemplate) {
    // Special handling for starter items (like Rusty Sword)
    const isStarterItem = item.name === 'Rusty Sword' || (!item.prefixes && !item.suffixes);
    
    if (!isStarterItem) {
      console.warn('Base template not found for item:', item);
    }
    
    // For items with affixes, try to reverse-engineer base stats
    if (item.prefixes || item.suffixes) {
      // Calculate total affix bonuses
      const totalAffixStats = {
        attack: 0,
        defense: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        lifeSteal: 0,
        dodge: 0,
        blockChance: 0
      };
      
      // Add prefix bonuses
      if (item.prefixes) {
        item.prefixes.forEach(prefix => {
          const prefixStats = AFFIXES.prefix[prefix]?.stats;
          if (prefixStats) {
            Object.keys(prefixStats).forEach(stat => {
              if (totalAffixStats.hasOwnProperty(stat)) {
                totalAffixStats[stat] += prefixStats[stat];
              }
            });
          }
        });
      }
      
      // Add suffix bonuses
      if (item.suffixes) {
        item.suffixes.forEach(suffix => {
          const suffixStats = AFFIXES.suffix[suffix]?.stats;
          if (suffixStats) {
            Object.keys(suffixStats).forEach(stat => {
              if (totalAffixStats.hasOwnProperty(stat)) {
                totalAffixStats[stat] += suffixStats[stat];
              }
            });
          }
        });
      }
      
      // Calculate base stats by subtracting affix stats from current item stats
      return {
        baseStats: {
          attack: (item.attack || 0) - totalAffixStats.attack,
          defense: (item.defense || 0) - totalAffixStats.defense,
          attackSpeed: (item.attackSpeed || 0) - totalAffixStats.attackSpeed,
          critChance: (item.critChance || 0) - totalAffixStats.critChance,
          critDamage: (item.critDamage || 0) - totalAffixStats.critDamage,
          lifeSteal: (item.lifeSteal || 0) - totalAffixStats.lifeSteal,
          dodge: (item.dodge || 0) - totalAffixStats.dodge,
          blockChance: (item.blockChance || 0) - totalAffixStats.blockChance
        },
        affixStats: totalAffixStats
      };
    }
    
    // Fallback if no affixes - use the item's own stats as base stats
    return {
      baseStats: {
        attack: item.attack || 0,
        defense: item.defense || 0,
        attackSpeed: item.attackSpeed || 0,
        critChance: item.critChance || 0,
        critDamage: item.critDamage || 0,
        lifeSteal: item.lifeSteal || 0,
        dodge: item.dodge || 0,
        blockChance: item.blockChance || 0
      },
      affixStats: {
        attack: 0,
        defense: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        lifeSteal: 0,
        dodge: 0,
        blockChance: 0
      }
    };
  }
  
  // Calculate affix bonuses by applying all prefixes and suffixes
  const affixStats = {
    attack: 0,
    defense: 0,
    attackSpeed: 0,
    critChance: 0,
    critDamage: 0,
    lifeSteal: 0,
    dodge: 0,
    blockChance: 0
  };
  
  // Add prefix bonuses
  if (item.prefixes) {
    item.prefixes.forEach(prefix => {
      const prefixStats = AFFIXES.prefix[prefix]?.stats;
      if (prefixStats) {
        Object.keys(prefixStats).forEach(stat => {
          if (affixStats.hasOwnProperty(stat)) {
            affixStats[stat] += prefixStats[stat];
          }
        });
      }
    });
  }
  
  // Add suffix bonuses
  if (item.suffixes) {
    item.suffixes.forEach(suffix => {
      const suffixStats = AFFIXES.suffix[suffix]?.stats;
      if (suffixStats) {
        Object.keys(suffixStats).forEach(stat => {
          if (affixStats.hasOwnProperty(stat)) {
            affixStats[stat] += suffixStats[stat];
          }
        });
      }
    });
  }
  
  return {
    baseStats: {
      attack: baseTemplate.attack || 0,
      defense: baseTemplate.defense || 0,
      attackSpeed: baseTemplate.attackSpeed || 0,
      critChance: baseTemplate.critChance || 0,
      critDamage: baseTemplate.critDamage || 0,
      lifeSteal: baseTemplate.lifeSteal || 0,
      dodge: baseTemplate.dodge || 0,
      blockChance: baseTemplate.blockChance || 0
    },
    affixStats: affixStats
  };
}

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
      // New stats
      attackSpeed: 0,
      critChance: 0,
      critDamage: 0,
      lifeSteal: 0,
      dodge: 0,
      blockChance: 0,
      gold: 0,
      xp: 0,
      nextLevelXp: 100,
      equipment: {
        weapon: { 
          name: 'Rusty Sword', 
          type: 'weapon', 
          rarity: 'common',
          attack: 5, 
          defense: 0, 
          attackSpeed: 0,
          critChance: 0,
          critDamage: 0,
          lifeSteal: 0,
          dodge: 0,
          blockChance: 0,
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
    
    this.currentZone = 'forest';
    this.currentEnemy = null;
    this.unlockedZones = ['forest']; // Start with only Dark Forest unlocked
    this.needsInventoryUpdate = true;
    this.needsCharacterUpdate = true;
    this.respawnTimer = {
      isActive: false,
      currentTime: 0,
      maxTime: 3000 // 3 seconds
    };
    this.needsShopUpdate = true;
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
    
    // Inventory management settings
    this.inventorySettings = {
      sortBy: 'name', // 'name', 'rarity', 'type', 'attack', 'defense'
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
    
    this.zones = ZONES;
    
    this.shopItems = SHOP_ITEMS;
    
    // Talent Tree System
    this.talents = {
      exploration: {},
      power: {},
      wealth: {},
      knowledge: {}
    };
    this.ascensionCount = 0;
    this.isShowingTalentTree = false;
    
    // Death message for End Run button
    this.currentDeathMessage = getRandomDeathMessage();
  }
  
  calculateStats() {
    let totalAttack = 10; // Base attack
    let totalDefense = 5; // Base defense
    let baseMaxHp = this.getBaseMaxHpWithTalents(); // Base max HP with talents
    let equipmentAttack = 0;
    let equipmentDefense = 0;
    let equipmentMaxHp = 0;
    let equipmentAttackSpeed = 0;
    let equipmentCritChance = 0;
    let equipmentCritDamage = 0;
    let equipmentLifeSteal = 0;
    let equipmentDodge = 0;
    let equipmentBlockChance = 0;
    
    // Apply talent bonuses to base stats
    const powerLevel1 = this.getTalentLevel('power', 'power_1');
    const powerLevel2 = this.getTalentLevel('power', 'power_2');
    const powerLevel3 = this.getTalentLevel('power', 'power_3');
    const powerLevel4 = this.getTalentLevel('power', 'power_4');
    
    totalAttack += powerLevel1 * 5; // +5 attack per level
    let talentCritChance = powerLevel2 * 2; // +2% crit per level
    let talentAttackSpeed = powerLevel3 * 10; // +10% attack speed per level
    
    if (powerLevel4 > 0) {
      totalAttack *= 1.5; // +50% damage
      talentCritChance += 25; // +25% crit chance
    }
    
    for (const slot in this.player.equipment) {
      const item = this.player.equipment[slot];
      if (item) {
        equipmentAttack += item.attack || 0;
        equipmentDefense += item.defense || 0;
        equipmentMaxHp += item.maxHp || 0;
        equipmentAttackSpeed += item.attackSpeed || 0;
        equipmentCritChance += item.critChance || 0;
        equipmentCritDamage += item.critDamage || 0;
        equipmentLifeSteal += item.lifeSteal || 0;
        equipmentDodge += item.dodge || 0;
        equipmentBlockChance += item.blockChance || 0;
      }
    }
    
    // Calculate level-based HP bonus (10 HP per level beyond level 1)
    const levelHpBonus = (this.player.level - 1) * 10;
    
    this.player.attack = totalAttack + equipmentAttack;
    this.player.defense = totalDefense + equipmentDefense;
    this.player.maxHp = baseMaxHp + levelHpBonus + equipmentMaxHp;
    this.player.equipmentAttack = equipmentAttack;
    this.player.equipmentDefense = equipmentDefense;
    this.player.attackSpeed = equipmentAttackSpeed + talentAttackSpeed;
    this.player.critChance = equipmentCritChance + talentCritChance;
    this.player.critDamage = equipmentCritDamage;
    this.player.lifeSteal = equipmentLifeSteal;
    this.player.dodge = equipmentDodge;
    this.player.blockChance = equipmentBlockChance;
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
    const sellPrice = Math.floor((item.price || 10) * 0.5); // Sell for 50% of buy price
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
        case 'defense':
          return (b.defense || 0) - (a.defense || 0);
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
      defense: item.defense || 0,
      attackSpeed: item.attackSpeed || 0,
      critChance: item.critChance || 0,
      critDamage: item.critDamage || 0,
      lifeSteal: item.lifeSteal || 0,
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
    console.log('Stats after equipping:', { attack: this.player.attack, defense: this.player.defense });
  }
  
  spawnEnemy() {
    const zone = this.zones[this.currentZone];
    if (!zone.enemies || zone.enemies.length === 0) return null;
    
    // Check for boss encounter in Goblin Cave
    if (this.currentZone === 'goblinCave' && zone.boss && zone.killCount >= zone.boss.requiredKills) {
      // Show boss warning
      showBossWarning(zone.boss.name);
      
      // Spawn the boss
      const boss = {
        ...zone.boss,
        maxHp: zone.boss.hp,
        attackInterval: zone.boss.attackInterval || 2000,
        isBoss: true,
        isLegendaryDropper: zone.boss.isLegendaryDropper || false
      };
      
      // Reset kill count after spawning boss
      zone.killCount = 0;
      
      this.addCombatMessage(`🏴‍☠️ The Goblin King emerges from the depths!`, 'system');
      return boss;
    }
    
    // Regular enemy spawning
    const enemyTemplate = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
    
    const enemy = {
      ...enemyTemplate,
      maxHp: enemyTemplate.hp,
      attackInterval: enemyTemplate.attackInterval || 2000
    };
    
    return enemy;
  }
  
  gainXp(amount) {
    // Apply knowledge talent bonuses
    const knowledgeLevel1 = this.getTalentLevel('knowledge', 'knowledge_1');
    const knowledgeLevel2 = this.getTalentLevel('knowledge', 'knowledge_2');
    const knowledgeLevel4 = this.getTalentLevel('knowledge', 'knowledge_4');
    
    let xpBonus = 1 + (knowledgeLevel1 * 0.2); // +20% per level
    xpBonus += knowledgeLevel2 * 0.5; // +50% bonus per level
    
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
    const knowledgeLevel3 = this.getTalentLevel('knowledge', 'knowledge_3');
    const xpReduction = Math.min(0.3, knowledgeLevel3 * 0.1); // Max 30% reduction
    
    this.player.nextLevelXp = Math.floor(this.player.nextLevelXp * 1.2 * (1 - xpReduction));
    
    // Increase base stats
    this.player.maxHp += 10;
    this.player.hp = this.player.maxHp; // Full heal on level up
    
    // Show level up animation
    document.getElementById('character-level').classList.add('level-up');
    setTimeout(() => {
      document.getElementById('character-level').classList.remove('level-up');
    }, 500);
    
    this.addLogMessage(`🎉 Level up! You are now level ${this.player.level}!`, 'loot', 'level-up');
    
    // Check for zone unlocks
    checkZoneUnlocks();
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
      this.currentZone = data.currentZone || 'forest';
      this.unlockedZones = data.unlockedZones || ['forest']; // Default to forest only if no save data
      
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
      startCombat();
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
    let damage = Math.max(1, this.player.attack - this.currentEnemy.defense);
    let isCritical = false;
    let lifeStealHealing = 0;
    
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
      createFloatingDamage(damage, enemyHpBar, 'enemy', isCritical);
    }
    
    // Calculate life steal healing (based on damage dealt)
    if (this.player.lifeSteal > 0) {
      lifeStealHealing = Math.floor(damage * (this.player.lifeSteal / 100));
      if (lifeStealHealing > 0) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + lifeStealHealing);
        
        // Create floating heal for player (on player HP bar)
        const playerHpBar = document.getElementById('player-hp-bar');
        if (playerHpBar) {
          createFloatingDamage(lifeStealHealing, playerHpBar, 'player', false, false, true);
        }
      }
    }
    
    // Combat message with details
    let attackMessage = `You attack ${this.currentEnemy.name} for ${damage} damage`;
    if (isCritical) {
      attackMessage += ` (💥 CRITICAL HIT!)`;
    }
    if (lifeStealHealing > 0) {
      attackMessage += ` and heal for ${lifeStealHealing} HP`;
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
          createFloatingDamage(0, playerHpBar, 'player', false, true);
        }
        
        this.addCombatMessage(`You dodge ${this.currentEnemy.name}'s attack! 💨`, 'player-dodge');
        return; // Attack missed
      }
    }
    
    // Calculate damage
    let damage = Math.max(1, this.currentEnemy.attack - this.player.defense);
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
      createFloatingDamage(damage, playerHpBar, 'player', false, false, false);
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
    // Variable gold drop between 10% and 100% of base gold
    const baseGold = this.currentEnemy.gold;
    const goldMultiplier = 0.1 + (Math.random() * 0.9); // 0.1 to 1.0
    let goldGained = Math.floor(baseGold * goldMultiplier);
    let xpGained = this.currentEnemy.xp;
    
    // Apply wealth talent bonuses to gold
    goldGained = Math.floor(goldGained * this.getGoldMultiplier());
    
    // Apply experience multiplier to XP
    xpGained = Math.floor(xpGained * this.getExperienceMultiplier());
    
    this.player.gold += goldGained;
    this.gainXp(xpGained);
    
    this.addLogMessage(`${this.currentEnemy.name} defeated! Gained ${goldGained} gold and ${xpGained} XP!`, 'loot', 'enemy-defeated');
    
    // Check if this is a goblin in Goblin Cave for kill tracking
    if (this.currentZone === 'goblinCave' && this.currentEnemy.name.includes('Goblin') && !this.currentEnemy.isBoss) {
      this.zones.goblinCave.killCount++;
      this.addCombatMessage(`Goblins defeated: ${this.zones.goblinCave.killCount}/${this.zones.goblinCave.boss.requiredKills}`, 'system');
    }
    
    // Handle item drops
    let droppedItem;
    const currentZone = this.zones[this.currentZone];
    
    if (this.currentEnemy.isBoss && this.currentEnemy.isLegendaryDropper) {
      // Boss drops legendary items
      droppedItem = generateLegendaryItem();
      this.addLogMessage(`💎 The ${this.currentEnemy.name} dropped a legendary item! ${droppedItem.fullName}!`, 'loot', 'enemy-defeated');
      
      // Show victory message for boss
      showVictoryMessage(this.currentEnemy.name);
      this.addToInventory(droppedItem);
    } else {
      // Use zone's drop chance and rarity restrictions
      let dropChance = currentZone.dropChance || 30;
      const allowedRarities = currentZone.allowedRarities || ['common', 'uncommon', 'rare', 'epic'];
      
      // Apply wealth talent bonuses
      const wealthLevel2 = this.getTalentLevel('wealth', 'wealth_2');
      const wealthLevel4 = this.getTalentLevel('wealth', 'wealth_4');
      
      dropChance += wealthLevel2 * 10; // +10% per level
      if (wealthLevel4 > 0) {
        dropChance += 50; // +50% item drops
      }
      
      const dropRoll = Math.random() * 100;
      if (dropRoll <= dropChance) {
        droppedItem = generateRandomItemForZone(allowedRarities);
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
    this.attackBars.player.currentTime = 0;
    this.attackBars.enemy.currentTime = 0;
    
    // Reset kill count on death
    if (this.currentZone === 'goblinCave') {
      this.zones.goblinCave.killCount = 0;
    }
    
    this.addCombatMessage('You were defeated! Choose to ascend and gain permanent power...', 'player-death');
    this.currentEnemy = null;
    
    // Generate new death message for next time
    this.currentDeathMessage = getRandomDeathMessage();
    updateEndRunButton();
    
    // Show death screen followed by talent tree
    showDeathScreen();
  }

  // Talent Tree Methods
  getTalentLevel(pathwayName, talentId) {
    return this.talents[pathwayName][talentId] || 0;
  }

  getBaseAttackWithTalents() {
    const baseAttack = 10; // Original base attack
    const powerLevel1 = this.getTalentLevel('power', 'power_1');
    return baseAttack + (powerLevel1 * 5); // +5 attack per level of Warrior Training
  }

  getBaseDefenseWithTalents() {
    return 5; // No defense talents yet, but keeping for consistency
  }

  getBaseMaxHpWithTalents() {
    const baseMaxHp = 100; // Original base maxHp
    // Add any HP-related talents here in the future
    return baseMaxHp;
  }

  getBaseAttackSpeedWithTalents() {
    const powerLevel3 = this.getTalentLevel('power', 'power_3');
    return powerLevel3 * 10; // +10% attack speed per level of Berserker Rage
  }

  getBaseCritChanceWithTalents() {
    const powerLevel2 = this.getTalentLevel('power', 'power_2');
    const powerLevel4 = this.getTalentLevel('power', 'power_4');
    let baseCrit = powerLevel2 * 2; // +2% crit per level of Combat Mastery
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
    const knowledgeLevel2 = this.getTalentLevel('knowledge', 'knowledge_2');
    const knowledgeLevel4 = this.getTalentLevel('knowledge', 'knowledge_4');
    
    // Quick Learner: +20% experience gain per level
    multiplier += (knowledgeLevel1 * 0.20);
    
    // Battle Wisdom: +50% bonus XP from combat victories per level
    multiplier += (knowledgeLevel2 * 0.50);
    
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

  canAllocateTalent(pathwayName, talentId) {
    const pathway = TALENT_TREES[pathwayName];
    const talent = pathway.nodes.find(node => node.id === talentId);
    
    if (!talent) return false;
    
    const currentLevel = this.getTalentLevel(pathwayName, talentId);
    if (currentLevel >= talent.maxLevel) return false;
    
    const totalCost = talent.cost * (currentLevel + 1);
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
    
    const pathway = TALENT_TREES[pathwayName];
    const talent = pathway.nodes.find(node => node.id === talentId);
    const currentLevel = this.getTalentLevel(pathwayName, talentId);
    const cost = talent.cost * (currentLevel + 1);
    
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

  ascend() {
    // Store current gold for talent allocation
    const currentGold = this.player.gold;
    
    // Reset player stats
    this.player.level = 1;
    this.player.hp = this.getBaseMaxHpWithTalents();
    this.player.maxHp = this.getBaseMaxHpWithTalents();
    this.player.attack = 10;
    this.player.defense = 5;
    this.player.equipmentAttack = 0;
    this.player.equipmentDefense = 0;
    this.player.attackSpeed = 0;
    this.player.critChance = 0;
    this.player.critDamage = 0;
    this.player.lifeSteal = 0;
    this.player.dodge = 0;
    this.player.blockChance = 0;
    // Gold is now preserved between ascensions
    this.player.xp = 0;
    this.player.nextLevelXp = 100;
    
    // Clear inventory and equipment (except starting weapon)
    this.player.inventory = [];
    this.player.equipment = {
      weapon: { 
        name: 'Rusty Sword', 
        type: 'weapon', 
        rarity: 'common',
        attack: 5, 
        defense: 0, 
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        lifeSteal: 0,
        dodge: 0,
        blockChance: 0,
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
    
    // Reset zones (except starting zone)
    this.unlockedZones = ['forest'];
    this.currentZone = 'forest';
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
    this.needsShopUpdate = true;
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
    
    // Apply exploration talents (zone unlocks)
    const explorationLevel1 = this.getTalentLevel('exploration', 'exploration_1');
    if (explorationLevel1 > 0) {
      // Reduce zone unlock requirements by 2 levels
      // This will be applied when checking zone unlocks
    }
    
    // Recalculate stats with equipment
    this.calculateStats();
  }

  calculateXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }
}

// Game instance
const game = new GameState();

// Floating damage numbers
function createFloatingDamage(damage, targetElement, type = 'enemy', isCritical = false, isMiss = false, isHeal = false) {
  const damageEl = document.createElement('div');
  damageEl.className = 'floating-damage';
  
  if (isMiss) {
    damageEl.textContent = 'MISS';
    damageEl.classList.add('miss');
  } else if (isHeal) {
    damageEl.textContent = `+${damage}`;
    damageEl.classList.add('heal');
  } else {
    damageEl.textContent = `-${damage}`;
    damageEl.classList.add(type);
    
    if (isCritical) {
      damageEl.classList.add('critical');
      damageEl.textContent = `CRIT! -${damage}`;
    }
  }
  
  // Position relative to the target element (HP bar)
  if (!targetElement) return;
  
  const rect = targetElement.getBoundingClientRect();
  
  // Position at center of the HP bar with some random offset
  damageEl.style.position = 'fixed';
  damageEl.style.left = `${rect.left + rect.width / 2 + Math.random() * 40 - 20}px`;
  damageEl.style.top = `${rect.top + rect.height / 2}px`;
  damageEl.style.transform = 'translate(-50%, -50%)';
  
  document.body.appendChild(damageEl);
  
  // Remove after animation
  setTimeout(() => {
    if (damageEl.parentNode) {
      damageEl.parentNode.removeChild(damageEl);
    }
  }, 1500);
}

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
  
  // Calculate and display attack interval
  const playerInterval = game.getPlayerAttackInterval();
  document.getElementById('player-attack-interval').textContent = `${(playerInterval / 1000).toFixed(1)}s`;
  
  // Update player attack and defense in combat display
  const playerAttackElement = document.getElementById('player-attack');
  const playerDefenseElement = document.getElementById('player-defense');
  if (playerAttackElement) {
    playerAttackElement.textContent = game.player.attack;
  }
  if (playerDefenseElement) {
    playerDefenseElement.textContent = game.player.defense;
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
  updateKillCounter();
  
  // Update enemy info
  if (game.currentEnemy) {
    document.getElementById('enemy-title').textContent = game.currentEnemy.name;
    document.getElementById('enemy-attack').textContent = game.currentEnemy.attack;
    document.getElementById('enemy-defense').textContent = game.currentEnemy.defense;
    
    // Update enemy image
    const enemyImage = document.getElementById('enemy-image');
    if (enemyImage) {
      // Remove all enemy type classes first, then add the current one
      enemyImage.classList.remove('slime', 'goblin', 'orc', 'skeleton', 'dragon');
      enemyImage.classList.add('enemy-image', game.currentEnemy.imageClass);
      enemyImage.style.display = 'block';
      enemyImage.style.visibility = 'visible';
    }
    
    // Calculate and display enemy attack interval
    const enemyInterval = game.getEnemyAttackInterval(game.currentEnemy);
    document.getElementById('enemy-attack-interval').textContent = `${(enemyInterval / 1000).toFixed(1)}s`;
    
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
    document.getElementById('enemy-defense').textContent = '-';
    document.getElementById('enemy-attack-interval').textContent = '-';
    
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
    document.getElementById('enemy-defense').textContent = '-';
    document.getElementById('enemy-attack-interval').textContent = '-';
    
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
            updateCharacterTooltip(tooltipElement, item);
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
    updateInventory();
    game.needsInventoryUpdate = false;
  }
  
  // Update shop if in town and shop needs updating
  if (game.currentZone === 'town' && game.needsShopUpdate) {
    updateShop();
    game.needsShopUpdate = false;
  }
}

function updateStatsPanel() {
  // Only update the displayed stats (total attack, total defense, max HP, actual attack speed, and advanced stats)
  document.getElementById('stats-total-attack').textContent = game.player.attack;
  document.getElementById('stats-total-defense').textContent = game.player.defense;
  document.getElementById('stats-max-hp').textContent = game.player.maxHp;
  
  // Calculate and display actual attack speed
  const actualAttackSpeed = game.getPlayerAttackInterval();
  document.getElementById('stats-actual-attack-speed').textContent = `${(actualAttackSpeed / 1000).toFixed(1)}s`;
  
  // Update advanced stats
  document.getElementById('stats-crit-chance').textContent = `${game.player.critChance || 0}%`;
  document.getElementById('stats-crit-damage').textContent = `${game.player.critDamage || 0}%`;
  document.getElementById('stats-life-steal').textContent = `${game.player.lifeSteal || 0}%`;
  document.getElementById('stats-dodge').textContent = `${game.player.dodge || 0}%`;
  document.getElementById('stats-block-chance').textContent = `${game.player.blockChance || 0}%`;
  
  // Update multipliers
  document.getElementById('stats-xp-multiplier').textContent = `${game.getExperienceMultiplier().toFixed(2)}x`;
  document.getElementById('stats-gold-multiplier').textContent = `${game.getGoldMultiplier().toFixed(2)}x`;
  
  // Add color coding for main stats
  const totalAttackElement = document.getElementById('stats-total-attack');
  const totalDefenseElement = document.getElementById('stats-total-defense');
  const maxHpElement = document.getElementById('stats-max-hp');
  
  if (totalAttackElement) {
    totalAttackElement.className = 'stat-value';
    if (game.player.equipmentAttack > 0) {
      totalAttackElement.classList.add('positive');
    }
  }
  
  if (totalDefenseElement) {
    totalDefenseElement.className = 'stat-value';
    if (game.player.equipmentDefense > 0) {
      totalDefenseElement.classList.add('positive');
    }
  }
  
  if (maxHpElement) {
    maxHpElement.className = 'stat-value';
  }
  
  // Add color coding for advanced stats
  const advancedStats = ['crit-chance', 'crit-damage', 'life-steal', 'dodge', 'block-chance'];
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

function updateCharacterTooltip(tooltipElement, item) {
  const rarityData = ITEM_RARITIES[item.rarity] || ITEM_RARITIES.common;
  const rarityColor = rarityData.color;
  
  // Fix missing type property right here in the tooltip function
  if (!item.type) {
    // Try to determine the type from the equipment slot it's in
    for (const [slot, equippedItem] of Object.entries(game.player.equipment)) {
      if (equippedItem === item) {
        item.type = slot;
        break;
      }
    }
  }
  
  // For items that aren't in BASE_ITEMS (like starting gear), show stats directly
  if (!item.type) {
    // Handle legacy items that might not have proper structure
    const statsLines = [];
    
    // Show all non-zero stats
    if (item.attack) statsLines.push(`<div class="tooltip-stat-line"><span>Attack:</span><span>${item.attack}</span></div>`);
    if (item.defense) statsLines.push(`<div class="tooltip-stat-line"><span>Defense:</span><span>${item.defense}</span></div>`);
    if (item.baseAttackInterval) statsLines.push(`<div class="tooltip-stat-line"><span>Attack Speed:</span><span>${(item.baseAttackInterval/1000).toFixed(1)}s</span></div>`);
    if (item.attackSpeed) statsLines.push(`<div class="tooltip-stat-line"><span>Attack Speed:</span><span>${item.attackSpeed}%</span></div>`);
    if (item.critChance) statsLines.push(`<div class="tooltip-stat-line"><span>Critical Chance:</span><span>${item.critChance}%</span></div>`);
    if (item.critDamage) statsLines.push(`<div class="tooltip-stat-line"><span>Critical Damage:</span><span>${item.critDamage}%</span></div>`);
    if (item.lifeSteal) statsLines.push(`<div class="tooltip-stat-line"><span>Life Steal:</span><span>${item.lifeSteal}%</span></div>`);
    if (item.dodge) statsLines.push(`<div class="tooltip-stat-line"><span>Dodge:</span><span>${item.dodge}%</span></div>`);
    if (item.blockChance) statsLines.push(`<div class="tooltip-stat-line"><span>Block Chance:</span><span>${item.blockChance}%</span></div>`);
    
    tooltipElement.innerHTML = `
      <div class="tooltip-name" style="color: ${rarityColor};">
        ${formatItemNameWithRarity(item)}
      </div>
      <div class="tooltip-stats">
        ${statsLines.join('')}
      </div>
      <div class="tooltip-rarity" style="color: ${rarityColor};">
        ${rarityData.name}
      </div>
    `;
    return;
  }
  
  // Separate base stats from affix stats
  const { baseStats, affixStats } = separateItemStats(item);
  
  // Ensure baseStats and affixStats are defined
  if (!baseStats || !affixStats) {
    console.error('Error separating item stats:', item);
    
    // For legacy items that can't be separated, show all stats as base stats
    const baseStatsHtml = [];
    if (item.attack) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Attack:</span><span>${item.attack}</span></div>`);
    if (item.defense) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Defense:</span><span>${item.defense}</span></div>`);
    if (item.baseAttackInterval) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Base Attack Speed:</span><span>${(item.baseAttackInterval/1000).toFixed(1)}s</span></div>`);
    if (item.attackSpeed) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Attack Speed:</span><span>${item.attackSpeed}%</span></div>`);
    if (item.critChance) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Critical Chance:</span><span>${item.critChance}%</span></div>`);
    if (item.critDamage) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Critical Damage:</span><span>${item.critDamage}%</span></div>`);
    if (item.lifeSteal) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Life Steal:</span><span>${item.lifeSteal}%</span></div>`);
    if (item.dodge) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Dodge:</span><span>${item.dodge}%</span></div>`);
    if (item.blockChance) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Block Chance:</span><span>${item.blockChance}%</span></div>`);
    
    tooltipElement.innerHTML = `
      <div class="tooltip-name" style="color: ${rarityColor};">
        ${formatItemNameWithRarity(item)}
      </div>
      <div class="tooltip-stats">
        ${baseStatsHtml.join('')}
      </div>
      <div class="tooltip-rarity" style="color: ${rarityColor};">
        ${rarityData.name}
      </div>
    `;
    return;
  }
  
  const baseStatsHtml = [];
  const affixStatsHtml = [];
  
  // Base stats section - show base values only
  if (item.type === 'weapon' || baseStats.attack > 0) {
    baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Attack:</span><span>${baseStats.attack}</span></div>`);
  }
  
  // Add base attack interval for weapons right after attack
  if (item.type === 'weapon' && item.baseAttackInterval) {
    baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Base Attack Speed:</span><span>${(item.baseAttackInterval/1000).toFixed(1)}s</span></div>`);
  }
  
  if (['helmet', 'body', 'legs', 'boots', 'offhand'].includes(item.type) || baseStats.defense > 0) {
    baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Defense:</span><span>${baseStats.defense}</span></div>`);
  }
  
  // Other base stats
  const statList = [
    { key: 'attackSpeed', label: 'Attack Speed', unit: '%' },
    { key: 'critChance', label: 'Critical Chance', unit: '%' },
    { key: 'critDamage', label: 'Critical Damage', unit: '%' },
    { key: 'lifeSteal', label: 'Life Steal', unit: '%' },
    { key: 'dodge', label: 'Dodge', unit: '%' },
    { key: 'blockChance', label: 'Block Chance', unit: '%' }
  ];
  
  statList.forEach(({ key, label, unit }) => {
    if (baseStats[key] > 0) {
      const sign = key === 'attackSpeed' ? '' : '';
      baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>${label}:</span><span>${sign}${baseStats[key]}${unit}</span></div>`);
    }
  });
  
  // Affix stats section - show only affix bonuses
  if (affixStats.attack > 0) {
    affixStatsHtml.push(`<div class="tooltip-stat-line stat-neutral"><span>Attack:</span><span>${affixStats.attack}</span></div>`);
  }
  
  if (affixStats.defense > 0) {
    affixStatsHtml.push(`<div class="tooltip-stat-line stat-neutral"><span>Defense:</span><span>${affixStats.defense}</span></div>`);
  }
  
  statList.forEach(({ key, label, unit }) => {
    if (affixStats[key] > 0) {
      affixStatsHtml.push(`<div class="tooltip-stat-line stat-neutral"><span>${label}:</span><span>${affixStats[key]}${unit}</span></div>`);
    }
  });
  
  // Build stats content with separator if both sections exist
  let statsContent = baseStatsHtml.join('');
  if (baseStatsHtml.length > 0 && affixStatsHtml.length > 0) {
    statsContent += '<div class="tooltip-separator"></div>';
  }
  statsContent += affixStatsHtml.join('');
  
  tooltipElement.innerHTML = `
    <div class="tooltip-name" style="color: ${rarityColor};">
      ${formatItemNameWithRarity(item)}
    </div>
    <div class="tooltip-stats">
      ${statsContent}
    </div>
    <div class="tooltip-rarity" style="color: ${rarityColor};">
      ${rarityData.name}
    </div>
  `;
}

// Check if an item provides significant stat improvements (more than half of available stats)
function isStatImprovement(item) {
  const currentItem = game.player.equipment[item.type];
  if (!currentItem) return true; // Always an improvement if nothing equipped
  
  const newStats = {
    attack: item.attack || 0,
    defense: item.defense || 0,
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
    defense: currentItem.defense || 0,
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
    return `<img src="./src/assets/gear/${iconName}.svg" alt="${item}" class="gear-icon" />`;
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
  
  return `<img src="./src/assets/gear/${svgFileName}.svg" alt="${item.name}" class="gear-icon rarity-${rarity}" loading="eager" onerror="this.style.display='none';" />`;
}

function updateInventory() {
  const inventoryDiv = document.getElementById('inventory-items');
  
  if (!inventoryDiv) {
    console.error('Inventory div not found!');
    return;
  }
  
  // Hide any existing tooltip since inventory is being rebuilt
  hideInventoryTooltip();
  
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
    const rarityColor = item.rarity && ITEM_RARITIES[item.rarity] ? ITEM_RARITIES[item.rarity].color : '#9CA3AF';
    
    // Add sell price for tooltip use
    const sellPrice = Math.floor((item.price || 10) * 0.5);
    
    itemDiv.innerHTML = `
      <div class="item-icon">${getGearIcon(item)}</div>
      <div class="item-name" style="color: ${rarityColor}; font-weight: bold;">
        ${formatItemNameWithRarity(item)}
      </div>
    `;
    
    // Remove the rarity border since we're using white/green for stat improvements now
    // itemDiv.style.border = `2px solid ${rarityColor}`;
    
    // Add tooltip handlers
    itemDiv.addEventListener('mouseenter', (e) => {
      currentTooltipItem = item;
      currentTooltipEvent = e;
      showInventoryTooltip(e, item, isShiftPressed);
    });
    
    itemDiv.addEventListener('mouseleave', (e) => {
      currentTooltipItem = null;
      currentTooltipEvent = null;
      hideInventoryTooltip();
    });
    
    itemDiv.addEventListener('mousemove', (e) => {
      currentTooltipEvent = e;
      updateTooltipPosition(e);
    });
    
    // Add click handler to equip item
    itemDiv.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if shift key is held for selling
      if (e.shiftKey) {
        // Sell item
        const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
        const itemToSell = game.player.inventory[itemIndex];
        
        if (itemToSell && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
          game.sellItem(itemToSell);
          game.player.inventory.splice(itemIndex, 1);
          game.needsInventoryUpdate = true;
          
          // Hide tooltip since item is being removed
          hideInventoryTooltip();
          
          // Add visual feedback
          itemDiv.classList.add('selling');
          setTimeout(() => {
            updateUI();
          }, 300);
        }
      } else {
        // Equip item
        const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
        const itemToEquip = game.player.inventory[itemIndex];
        
        if (itemToEquip && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
          // Create a copy for equipping
          const equipItem = { ...itemToEquip };
          
          // Hide tooltip since inventory will be updated
          hideInventoryTooltip();
          
          // Equip the item with the inventory index
          game.equipItem(equipItem, true, itemIndex);
          game.addLogMessage(`✨ Equipped ${equipItem.fullName || equipItem.name}!`, 'system');
          
          // Add visual feedback
          itemDiv.classList.add('equipping');
          setTimeout(() => {
            updateUI();
          }, 300);
        }
      }
    });
    
    // Add right-click handler to sell item
    itemDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent default context menu
      e.stopPropagation();
      
      // Sell item on right-click
      const itemIndex = parseInt(itemDiv.getAttribute('data-item-index'));
      const itemToSell = game.player.inventory[itemIndex];
      
      if (itemToSell && itemIndex >= 0 && itemIndex < game.player.inventory.length) {
        game.sellItem(itemToSell);
        game.player.inventory.splice(itemIndex, 1);
        game.needsInventoryUpdate = true;
        
        // Hide tooltip since item is being removed
        hideInventoryTooltip();
        
        // Add visual feedback
        itemDiv.classList.add('selling');
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
    
    // Check if this item provides significant stat improvements
    if (isStatImprovement(item)) {
      itemDiv.classList.add('stat-improvement');
    }
    
    const canAfford = game.player.gold >= item.price;
    
    // Create stats display - only show non-zero stats
    const shopStats = [];
    if (item.attack > 0) shopStats.push(`ATK: ${item.attack}`);
    if (item.defense > 0) shopStats.push(`DEF: ${item.defense}`);
    const shopStatsHtml = shopStats.join(' | ');
    
    itemDiv.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-stats">
        ${shopStatsHtml}
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
        
        // Mark shop for update since gold changed
        game.needsShopUpdate = true;
        
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
    
    // Reset attack bars
    game.attackBars.player.currentTime = 0;
    game.attackBars.enemy.currentTime = 0;
    game.attackBars.player.maxTime = game.getPlayerAttackInterval();
    game.attackBars.enemy.maxTime = game.getEnemyAttackInterval(game.currentEnemy);
  }
}

function performCombat() {
  // This function is now handled by the attack bar system in updateAttackBars
  // Left as placeholder for compatibility
}

// Death Screen Functions
function showDeathScreen() {
  const deathModal = document.getElementById('death-modal');
  deathModal.style.display = 'flex';
  
  // Pause game loop temporarily
  game.combat.isActive = false;
}

function hideDeathScreen() {
  const deathModal = document.getElementById('death-modal');
  deathModal.style.display = 'none';
  
  // Show talent tree instead of going to town
  showTalentTree();
}

// Talent Tree UI Functions
function showTalentTree() {
  const talentModal = document.getElementById('talent-tree-modal');
  talentModal.style.display = 'flex';
  game.isShowingTalentTree = true;
  
  // Populate talent tree
  populateTalentTree();
  updateTalentTreeUI();
}

function hideTalentTree() {
  const talentModal = document.getElementById('talent-tree-modal');
  talentModal.style.display = 'none';
  game.isShowingTalentTree = false;
  
  // Trigger ascension
  game.ascend();
  
  // Send player to starting zone
  changeZone('forest');
  updateUI();
}

function populateTalentTree() {
  Object.keys(TALENT_TREES).forEach(pathwayName => {
    const pathway = TALENT_TREES[pathwayName];
    const pathwayElement = document.getElementById(`pathway-${pathwayName}`);
    
    if (!pathwayElement) return;
    
    // Update talent nodes only (header is now static)
    const nodesContainer = pathwayElement.querySelector('.talent-nodes');
    if (nodesContainer) {
      nodesContainer.innerHTML = '';
      
      pathway.nodes.forEach(talent => {
        const currentLevel = game.getTalentLevel(pathwayName, talent.id);
        const canAllocate = game.canAllocateTalent(pathwayName, talent.id);
        const nextCost = talent.cost * (currentLevel + 1);
        
        const nodeElement = document.createElement('div');
        nodeElement.className = `talent-node ${currentLevel > 0 ? 'allocated' : ''} ${canAllocate ? 'available' : 'locked'}`;
        nodeElement.dataset.pathway = pathwayName;
        nodeElement.dataset.talent = talent.id;
        
        nodeElement.innerHTML = `
          ${currentLevel > 0 ? `<div class="purchase-counter">${currentLevel}</div>` : ''}
          <div class="talent-header">
            <div class="talent-node-name">${talent.name}</div>
          </div>
          <div class="talent-node-cost">${nextCost} gold</div>
        `;
        
        // Add tooltip functionality
        nodeElement.addEventListener('mouseenter', (e) => {
          showTalentTooltip(e, talent, currentLevel, nextCost);
        });
        
        nodeElement.addEventListener('mouseleave', () => {
          hideTalentTooltip();
        });
        
        nodeElement.addEventListener('mousemove', (e) => {
          updateTalentTooltipPosition(e);
        });
        
        nodeElement.addEventListener('click', () => {
          if (game.canAllocateTalent(pathwayName, talent.id)) {
            game.allocateTalent(pathwayName, talent.id);
            updateTalentTreeUI();
          }
        });
        
        nodesContainer.appendChild(nodeElement);
      });
    }
  });
}

function updateTalentTreeUI() {
  // Update gold display
  const goldDisplay = document.getElementById('talent-gold');
  if (goldDisplay) {
    goldDisplay.textContent = game.player.gold;
  }
  
  // Update talent points display
  const talentPointsDisplay = document.getElementById('talent-points');
  if (talentPointsDisplay) {
    talentPointsDisplay.textContent = game.getTotalTalentPoints();
  }
  
  // Update ascension count
  const ascensionDisplay = document.getElementById('ascension-count');
  if (ascensionDisplay) {
    ascensionDisplay.textContent = game.ascensionCount;
  }
  
  // Re-populate to update costs and availability
  populateTalentTree();
}

// Talent Tooltip Functions
function showTalentTooltip(event, talent, currentLevel, nextCost) {
  const tooltip = document.getElementById('talent-tooltip');
  const nameElement = document.getElementById('talent-tooltip-name');
  const levelElement = document.getElementById('talent-tooltip-level');
  const descriptionElement = document.getElementById('talent-tooltip-description');
  const effectElement = document.getElementById('talent-tooltip-effect');
  const costElement = document.getElementById('talent-tooltip-cost');
  
  if (tooltip && nameElement && levelElement && descriptionElement && effectElement && costElement) {
    nameElement.textContent = talent.name;
    levelElement.textContent = `${currentLevel}/${talent.maxLevel}`;
    descriptionElement.textContent = talent.description;
    effectElement.textContent = talent.effect;
    
    if (currentLevel >= talent.maxLevel) {
      costElement.textContent = 'Max Level';
    } else {
      costElement.textContent = `Cost: ${nextCost} gold`;
    }
    
    tooltip.style.display = 'block';
    tooltip.classList.add('visible');
    updateTalentTooltipPosition(event);
  }
}

function hideTalentTooltip() {
  const tooltip = document.getElementById('talent-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    setTimeout(() => {
      if (!tooltip.classList.contains('visible')) {
        tooltip.style.display = 'none';
      }
    }, 200);
  }
}

function updateTalentTooltipPosition(event) {
  const tooltip = document.getElementById('talent-tooltip');
  if (tooltip && tooltip.style.display === 'block') {
    const x = event.clientX + 10;
    const y = event.clientY + 10;
    
    // Prevent tooltip from going off-screen
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    if (x + tooltipRect.width > windowWidth) {
      finalX = event.clientX - tooltipRect.width - 10;
    }
    
    if (y + tooltipRect.height > windowHeight) {
      finalY = event.clientY - tooltipRect.height - 10;
    }
    
    tooltip.style.left = finalX + 'px';
    tooltip.style.top = finalY + 'px';
  }
}

// Zone Tooltip Functions
function showZoneTooltip(event, zoneKey, zone, isUnlocked, unlockReq = null) {
  const tooltip = document.getElementById('zone-tooltip');
  const iconElement = document.getElementById('zone-tooltip-icon');
  const titleElement = document.getElementById('zone-tooltip-title');
  const descriptionElement = document.getElementById('zone-tooltip-description');
  const contentElement = document.getElementById('zone-tooltip-content');
  
  if (!tooltip || !iconElement || !titleElement || !descriptionElement || !contentElement) return;
  
  // Set zone icon based on type
  const zoneIcons = {
    forest: '🌲',
    town: '🏘️',
    cave: '🕳️',
    goblinCave: '👹',
    mountain: '🏔️'
  };
  
  iconElement.textContent = zoneIcons[zoneKey] || '🗺️';
  titleElement.textContent = zone.name;
  descriptionElement.textContent = zone.description;
  
  let contentHtml = '';
  
  // Always show enemies/features for all zones (both locked and unlocked)
  if (zoneKey === 'town') {
    // Special info for town
    contentHtml += `
      <div class="zone-tooltip-enemies">
        <div class="zone-tooltip-enemies-title">🏪 Features:</div>
        <div class="zone-tooltip-enemy-list">
          • Purchase equipment<br>
          • Heal over time<br>
          • Safe from combat
        </div>
      </div>
    `;
  } else if (zone.enemies && zone.enemies.length > 0) {
    // Show enemies for combat zones
    contentHtml += `
      <div class="zone-tooltip-enemies">
        <div class="zone-tooltip-enemies-title">⚔️ Enemies:</div>
        <div class="zone-tooltip-enemy-list">
          ${zone.enemies.map(enemy => `• ${enemy.name} (HP: ${enemy.hp}, ATK: ${enemy.attack})`).join('<br>')}
        </div>
      </div>
    `;
  }
  
  // Add boss info for Goblin Cave
  if (zoneKey === 'goblinCave' && zone.boss) {
    contentHtml += `
      <div class="zone-tooltip-boss">
        <div class="zone-tooltip-boss-title">👑 Boss: ${zone.boss.name}</div>
        <div class="zone-tooltip-boss-info">HP: ${zone.boss.hp}, ATK: ${zone.boss.attack}<br>Requires ${zone.boss.requiredKills} goblin kills<br>Drops legendary items!</div>
      </div>
    `;
  }
  
  // Show unlock requirements for locked zones
  if (!isUnlocked) {
    // Show unlock requirements for locked zones
    if (unlockReq) {
      const currentLevel = game.player.level;
      contentHtml += `
        <div class="zone-tooltip-unlock">
          <div class="zone-tooltip-unlock-title">🔒 Zone Locked</div>
          <div class="zone-tooltip-unlock-req">Required Level: ${unlockReq.level}</div>
          <div class="zone-tooltip-unlock-current">Current Level: ${currentLevel}</div>
        </div>
      `;
    } else {
      contentHtml += `
        <div class="zone-tooltip-unlock">
          <div class="zone-tooltip-unlock-title">🔒 Zone Locked</div>
          <div class="zone-tooltip-unlock-req">Complete more areas to unlock</div>
        </div>
      `;
    }
  }
  
  contentElement.innerHTML = contentHtml;
  
  tooltip.style.display = 'block';
  tooltip.classList.add('visible');
  updateZoneTooltipPosition(event);
}

function hideZoneTooltip() {
  const tooltip = document.getElementById('zone-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    setTimeout(() => {
      if (!tooltip.classList.contains('visible')) {
        tooltip.style.display = 'none';
      }
    }, 200);
  }
}

function updateZoneTooltipPosition(event) {
  const tooltip = document.getElementById('zone-tooltip');
  if (tooltip && tooltip.style.display === 'block') {
    const x = event.clientX + 15;
    const y = event.clientY + 15;
    
    // Prevent tooltip from going off-screen
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    if (x + tooltipRect.width > windowWidth) {
      finalX = event.clientX - tooltipRect.width - 15;
    }
    
    if (y + tooltipRect.height > windowHeight) {
      finalY = event.clientY - tooltipRect.height - 15;
    }
    
    tooltip.style.left = finalX + 'px';
    tooltip.style.top = finalY + 'px';
  }
}

// Zone Management
function changeZone(zoneName) {
  // Reset kill count when leaving Goblin Cave
  if (game.currentZone === 'goblinCave' && zoneName !== 'goblinCave') {
    game.zones.goblinCave.killCount = 0;
  }
  
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
    game.needsShopUpdate = true; // Mark shop for update when entering town
    
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
  
  // Define unlock conditions
  const unlockConditions = {
    'cave': { level: 5, message: 'The Mysterious Cave is now accessible!' },
    'goblinCave': { level: 8, message: 'You discovered the Goblin Cave!' },
    'mountain': { level: 12, message: 'The Snowy Mountains path has opened!' },
    'town': { level: 3, message: 'You can now visit the Town to trade and rest!' }
  };
  
  for (const [zoneKey, zone] of Object.entries(game.zones)) {
    const button = document.createElement('button');
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    
    button.className = `zone-btn ${zoneKey === 'town' ? 'town' : ''} ${!isUnlocked ? 'locked' : ''}`;
    button.textContent = zone.name;
    button.setAttribute('data-zone', zoneKey);
    
    if (isUnlocked) {
      button.addEventListener('click', () => changeZone(zoneKey));
    } else {
      button.addEventListener('click', () => {
        const unlockReq = unlockConditions[zoneKey];
        if (unlockReq) {
          game.addLogMessage(`This zone is locked. Reach level ${unlockReq.level} to unlock it!`, 'system');
        } else {
          game.addLogMessage('This zone is locked. Complete more areas to unlock it!', 'system');
        }
      });
    }
    
    // Create tooltip with unlock requirements or enemy list
    if (isUnlocked) {
      if (zone.enemies && zone.enemies.length > 0) {
        // Add event listeners for custom tooltip instead of title
        button.addEventListener('mouseenter', (e) => {
          showZoneTooltip(e, zoneKey, zone, true);
        });
        
        button.addEventListener('mouseleave', () => {
          hideZoneTooltip();
        });
        
        button.addEventListener('mousemove', (e) => {
          updateZoneTooltipPosition(e);
        });
      } else {
        // Add event listeners for town/description-only zones
        button.addEventListener('mouseenter', (e) => {
          showZoneTooltip(e, zoneKey, zone, true);
        });
        
        button.addEventListener('mouseleave', () => {
          hideZoneTooltip();
        });
        
        button.addEventListener('mousemove', (e) => {
          updateZoneTooltipPosition(e);
        });
      }
    } else {
      // Show unlock requirements for locked zones
      button.addEventListener('mouseenter', (e) => {
        showZoneTooltip(e, zoneKey, zone, false, unlockConditions[zoneKey]);
      });
      
      button.addEventListener('mouseleave', () => {
        hideZoneTooltip();
      });
      
      button.addEventListener('mousemove', (e) => {
        updateZoneTooltipPosition(e);
      });
    }
    
    zoneButtonsDiv.appendChild(button);
  }
}

function refreshZoneTooltips() {
  // Define unlock conditions (same as in initializeZones)
  const unlockConditions = {
    'cave': { level: 5, message: 'The Mysterious Cave is now accessible!' },
    'goblinCave': { level: 8, message: 'You discovered the Goblin Cave!' },
    'mountain': { level: 12, message: 'The Snowy Mountains path has opened!' },
    'town': { level: 3, message: 'You can now visit the Town to trade and rest!' }
  };
  
  // Update zone button tooltips to reflect current state
  const zoneButtons = document.querySelectorAll('.zone-btn');
  zoneButtons.forEach(button => {
    const zoneKey = button.getAttribute('data-zone');
    const zone = game.zones[zoneKey];
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    
    // Remove existing event listeners by cloning the button
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add click functionality back
    if (isUnlocked) {
      newButton.addEventListener('click', () => changeZone(zoneKey));
    } else {
      newButton.addEventListener('click', () => {
        const unlockReq = unlockConditions[zoneKey];
        if (unlockReq) {
          game.addLogMessage(`This zone is locked. Reach level ${unlockReq.level} to unlock it!`, 'system');
        } else {
          game.addLogMessage('This zone is locked. Complete more areas to unlock it!', 'system');
        }
      });
    }
    
    // Add tooltip functionality
    if (isUnlocked) {
      newButton.addEventListener('mouseenter', (e) => {
        showZoneTooltip(e, zoneKey, zone, true);
      });
      
      newButton.addEventListener('mouseleave', () => {
        hideZoneTooltip();
      });
      
      newButton.addEventListener('mousemove', (e) => {
        updateZoneTooltipPosition(e);
      });
    } else {
      newButton.addEventListener('mouseenter', (e) => {
        showZoneTooltip(e, zoneKey, zone, false, unlockConditions[zoneKey]);
      });
      
      newButton.addEventListener('mouseleave', () => {
        hideZoneTooltip();
      });
      
      newButton.addEventListener('mousemove', (e) => {
        updateZoneTooltipPosition(e);
      });
    }
  });
}

// Function to unlock new zones based on player progress
function checkZoneUnlocks() {
  const playerLevel = game.player.level;
  let newZoneUnlocked = false;
  
  // Unlock conditions for each zone
  const unlockConditions = {
    'cave': { level: 5, message: 'The Mysterious Cave is now accessible!' },
    'goblinCave': { level: 8, message: 'You discovered the Goblin Cave!' },
    'mountain': { level: 12, message: 'The Snowy Mountains path has opened!' },
    'town': { level: 3, message: 'You can now visit the Town to trade and rest!' }
  };
  
  for (const [zoneKey, condition] of Object.entries(unlockConditions)) {
    if (!game.unlockedZones.includes(zoneKey) && playerLevel >= condition.level) {
      game.unlockedZones.push(zoneKey);
      game.addLogMessage(condition.message, 'system');
      newZoneUnlocked = true;
    }
  }
  
  // Always refresh zone tooltips to update current level display
  refreshZoneTooltips();
  
  // If new zones were unlocked, refresh the zone buttons
  if (newZoneUnlocked) {
    refreshZoneButtons();
  }
}

// Function to refresh zone button states
function refreshZoneButtons() {
  const zoneButtons = document.querySelectorAll('.zone-btn');
  zoneButtons.forEach(button => {
    const zoneKey = button.getAttribute('data-zone');
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    
    if (isUnlocked && button.classList.contains('locked')) {
      button.classList.remove('locked');
      
      // Remove old click handler and add new one
      const newButton = button.cloneNode(true);
      newButton.addEventListener('click', () => changeZone(zoneKey));
      button.parentNode.replaceChild(newButton, button);
      
      // Update tooltip
      const zone = game.zones[zoneKey];
      if (zone.enemies && zone.enemies.length > 0) {
        const enemyList = zone.enemies.map(enemy => 
          `${enemy.name}`
        ).join('\n');
        
        let tooltip = `${zone.description}\n\nEnemies:\n${enemyList}`;
        
        if (zoneKey === 'goblinCave' && zone.boss) {
          tooltip += `\n\nBoss: ${zone.boss.name} (drops legendary items!)`;
        }
        
        newButton.title = tooltip;
      } else {
        newButton.title = zone.description;
      }
    }
  });
}

function updateKillCounter() {
  const killCounterDiv = document.getElementById('kill-counter');
  const killCounterText = document.getElementById('kill-counter-text');
  
  if (game.currentZone === 'goblinCave') {
    const zone = game.zones.goblinCave;
    killCounterDiv.style.display = 'block';
    killCounterText.textContent = `Goblins defeated: ${zone.killCount}/${zone.boss.requiredKills}`;
  } else {
    killCounterDiv.style.display = 'none';
  }
}

function showBossWarning(bossName) {
  const warningDiv = document.getElementById('boss-warning');
  const bossNameSpan = document.getElementById('boss-warning-name');
  
  bossNameSpan.textContent = bossName;
  warningDiv.style.display = 'block';
  
  // Hide warning after 2 seconds
  setTimeout(() => {
    warningDiv.style.display = 'none';
  }, 2000);
}

function showVictoryMessage(bossName) {
  const victoryDiv = document.getElementById('victory-message');
  const victorySubtext = document.getElementById('victory-subtext');
  
  victorySubtext.textContent = `The ${bossName} has been defeated!`;
  victoryDiv.style.display = 'block';
  
  // Hide victory message after 4 seconds
  setTimeout(() => {
    victoryDiv.style.display = 'none';
  }, 4000);
}

// Function to update the End Run button text
function updateEndRunButton() {
  const endRunBtn = document.getElementById('end-run-btn');
  if (endRunBtn) {
    endRunBtn.textContent = `💀 ${game.currentDeathMessage}`;
    endRunBtn.title = `End current run: ${game.currentDeathMessage}`;
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
document.getElementById('end-run-btn').addEventListener('click', () => {
  if (confirm(`Are you sure you want to ${game.currentDeathMessage.toLowerCase()}? This will end your current run and trigger ascension.`)) {
    // Kill the player by setting HP to 0 and triggering death
    game.player.hp = 0;
    game.handlePlayerDeath();
  }
});
document.getElementById('ascend-btn').addEventListener('click', () => hideDeathScreen());
document.getElementById('confirm-ascend').addEventListener('click', () => hideTalentTree());

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
      game.calculateStats();
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
    showStatsTooltip(e, tooltipType);
  });
  
  item.addEventListener('mouseleave', () => {
    hideStatsTooltip();
  });
  
  item.addEventListener('mousemove', (e) => {
    updateStatsTooltipPosition(e);
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
  
  // Update attack bars every frame when combat is active
  if (game.combat.isActive && game.currentEnemy && game.currentZone !== 'town') {
    game.updateAttackBars(deltaTime);
  }
  
  // Update respawn timer when active
  if (game.respawnTimer.isActive && game.currentZone !== 'town') {
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
  console.log('initGame: Starting game initialization');
  game.calculateStats();
  initializeZones();
  changeZone('forest');
  console.log('initGame: Game initialized, current zone:', game.currentZone, 'Combat active:', game.combat.isActive);
  
  // Initialize the end run button text
  updateEndRunButton();
  
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
  if (localStorage.getItem('idleRPG_save')) {
    if (confirm('Found a saved game. Would you like to load it?')) {
      game.load();
      changeZone(game.currentZone);
      game.addLogMessage('📂 Game loaded successfully!', 'system');
    }
  }
  
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

// Tooltip functions for inventory stat comparison
function showInventoryTooltip(event, item, showComparison = false) {
  const tooltip = document.getElementById('inventory-tooltip');
  if (!tooltip || !item) return;
  
  // Get currently equipped item of the same type
  const equippedItem = game.player.equipment[item.type];
  
  // Get rarity colors for styling
  const itemRarity = ITEM_RARITIES[item.rarity] || ITEM_RARITIES.common;
  const equippedRarity = equippedItem ? (ITEM_RARITIES[equippedItem.rarity] || ITEM_RARITIES.common) : null;
  
  // Build tooltip HTML
  let comparisonHtml = `<div class="tooltip-title" style="color: ${itemRarity.color};">${formatItemNameWithRarity(item)}</div>`;
  comparisonHtml += `<div class="tooltip-item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>`;
  
  // Always show item's own stats
  const { baseStats, affixStats } = separateItemStats(item);
  
  const baseStatsHtml = [];
  const affixStatsHtml = [];
  
  // Show base stats
  if (baseStats.attack > 0) {
    let statText = `${baseStats.attack} Base Attack`;
    
    // Add comparison change if showing comparison and equipped item exists
    if (showComparison && equippedItem) {
      const { baseStats: equippedBaseStats } = separateItemStats(equippedItem);
      const difference = baseStats.attack - equippedBaseStats.attack;
      if (difference > 0) {
        statText = `<div class="stat-gain">${statText} (+${difference})</div>`;
      } else if (difference < 0) {
        statText = `<div class="stat-loss">${statText} (${difference})</div>`;
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
    } else {
      statText = `<div class="stat-base">${statText}</div>`;
    }
    baseStatsHtml.push(statText);
  }
  
  // For weapons, show base attack interval
  if (item.type === 'weapon' && item.baseAttackInterval) {
    let statText = `${(item.baseAttackInterval/1000).toFixed(1)}s Base Attack Speed`;
    
    if (showComparison && equippedItem) {
      const equippedInterval = equippedItem.baseAttackInterval || 2000;
      const intervalDiff = item.baseAttackInterval - equippedInterval;
      
      if (intervalDiff > 0) {
        statText = `<div class="stat-loss">${statText} (+${(intervalDiff/1000).toFixed(1)}s)</div>`;
      } else if (intervalDiff < 0) {
        statText = `<div class="stat-gain">${statText} (${(intervalDiff/1000).toFixed(1)}s)</div>`;
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
    } else {
      statText = `<div class="stat-base">${statText}</div>`;
    }
    baseStatsHtml.push(statText);
  }
  
  if (baseStats.defense > 0) {
    let statText = `${baseStats.defense} Defense`;
    
    if (showComparison && equippedItem) {
      const { baseStats: equippedBaseStats } = separateItemStats(equippedItem);
      const difference = baseStats.defense - equippedBaseStats.defense;
      if (difference > 0) {
        statText = `<div class="stat-gain">${statText} (+${difference})</div>`;
      } else if (difference < 0) {
        statText = `<div class="stat-loss">${statText} (${difference})</div>`;
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
    } else {
      statText = `<div class="stat-base">${statText}</div>`;
    }
    baseStatsHtml.push(statText);
  }
  
  // Other base stats
  const statList = [
    { key: 'attackSpeed', label: 'Attack Speed', unit: '%' },
    { key: 'critChance', label: 'Crit Chance', unit: '%' },
    { key: 'critDamage', label: 'Crit Damage', unit: '%' },
    { key: 'lifeSteal', label: 'Life Steal', unit: '%' },
    { key: 'dodge', label: 'Dodge', unit: '%' },
    { key: 'blockChance', label: 'Block Chance', unit: '%' }
  ];
  
  statList.forEach(({ key, label, unit }) => {
    if (baseStats[key] > 0) {
      const sign = key === 'attackSpeed' ? '' : '';
      let statText = `${sign}${baseStats[key]}${unit} ${label}`;
      
      if (showComparison && equippedItem) {
        const { baseStats: equippedBaseStats } = separateItemStats(equippedItem);
        const difference = baseStats[key] - equippedBaseStats[key];
        
        if (difference > 0) {
          const diffSign = key === 'attackSpeed' ? '' : '';
          statText = `<div class="stat-gain">${statText} (${diffSign}${difference}${unit})</div>`;
        } else if (difference < 0) {
          statText = `<div class="stat-loss">${statText} (${difference}${unit})</div>`;
        } else {
          statText = `<div class="stat-neutral">${statText}</div>`;
        }
      } else {
        statText = `<div class="stat-base">${statText}</div>`;
      }
      baseStatsHtml.push(statText);
    }
  });
  
  // Show affix stats
  if (affixStats.attack > 0) {
    let statText = `${affixStats.attack} Attack`;
    
    if (showComparison && equippedItem) {
      const { affixStats: equippedAffixStats } = separateItemStats(equippedItem);
      const difference = affixStats.attack - equippedAffixStats.attack;
      if (difference > 0) {
        statText = `<div class="stat-gain">${statText} (+${difference})</div>`;
      } else if (difference < 0) {
        statText = `<div class="stat-loss">${statText} (${difference})</div>`;
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
    } else {
      statText = `<div class="stat-neutral">${statText}</div>`;
    }
    affixStatsHtml.push(statText);
  }
  
  if (affixStats.defense > 0) {
    let statText = `${affixStats.defense} Defense`;
    
    if (showComparison && equippedItem) {
      const { affixStats: equippedAffixStats } = separateItemStats(equippedItem);
      const difference = affixStats.defense - equippedAffixStats.defense;
      if (difference > 0) {
        statText = `<div class="stat-gain">${statText} (+${difference})</div>`;
      } else if (difference < 0) {
        statText = `<div class="stat-loss">${statText} (${difference})</div>`;
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
    } else {
      statText = `<div class="stat-neutral">${statText}</div>`;
    }
    affixStatsHtml.push(statText);
  }
  
  statList.forEach(({ key, label, unit }) => {
    if (affixStats[key] > 0) {
      const sign = key === 'attackSpeed' ? '' : '';
      let statText = `${sign}${affixStats[key]}${unit} ${label}`;
      
      if (showComparison && equippedItem) {
        const { affixStats: equippedAffixStats } = separateItemStats(equippedItem);
        const difference = affixStats[key] - equippedAffixStats[key];
        
        if (difference > 0) {
          const diffSign = key === 'attackSpeed' ? '' : '';
          statText = `<div class="stat-gain">${statText} (${diffSign}${difference}${unit})</div>`;
        } else if (difference < 0) {
          statText = `<div class="stat-loss">${statText} (${difference}${unit})</div>`;
        } else {
          statText = `<div class="stat-neutral">${statText}</div>`;
        }
      } else {
        statText = `<div class="stat-neutral">${statText}</div>`;
      }
      affixStatsHtml.push(statText);
    }
  });
  
  // Add base stats
  comparisonHtml += baseStatsHtml.join('');
  
  // Add separator if both base and affix stats exist
  if (baseStatsHtml.length > 0 && affixStatsHtml.length > 0) {
    comparisonHtml += '<div class="tooltip-separator"></div>';
  }
  
  // Add affix stats
  comparisonHtml += affixStatsHtml.join('');
  
  // Only show missing stats comparison when Shift is held
  if (showComparison && equippedItem) {
    const { baseStats: equippedBaseStats, affixStats: equippedAffixStats } = separateItemStats(equippedItem);
    const missingStatsHtml = [];
    
    // Check for stats that exist on equipped item but not on inventory item
    const allStats = [
      { key: 'attack', label: 'Attack', unit: '', isBase: true },
      { key: 'defense', label: 'Defense', unit: '', isBase: true },
      { key: 'attackSpeed', label: 'Attack Speed', unit: '%', isBase: true },
      { key: 'critChance', label: 'Crit Chance', unit: '%', isBase: true },
      { key: 'critDamage', label: 'Crit Damage', unit: '%', isBase: true },
      { key: 'lifeSteal', label: 'Life Steal', unit: '%', isBase: true },
      { key: 'dodge', label: 'Dodge', unit: '%', isBase: true },
      { key: 'blockChance', label: 'Block Chance', unit: '%', isBase: true }
    ];
    
    allStats.forEach(({ key, label, unit }) => {
      const equippedTotal = (equippedBaseStats[key] || 0) + (equippedAffixStats[key] || 0);
      const itemTotal = (baseStats[key] || 0) + (affixStats[key] || 0);
      
      // If equipped item has this stat but inventory item doesn't
      if (equippedTotal > 0 && itemTotal === 0) {
        const sign = key === 'attackSpeed' ? '' : '';
        missingStatsHtml.push(`<div class="stat-missing">${label}: ${sign}${equippedTotal}${unit} → 0${unit} (-${equippedTotal}${unit})</div>`);
      }
    });
    
    // Add missing stats section if any exist
    if (missingStatsHtml.length > 0) {
      comparisonHtml += '<div class="tooltip-separator"></div>';
      comparisonHtml += missingStatsHtml.join('');
    }
    
    comparisonHtml += `<div class="tooltip-comparison">Compared to: <span style="color: ${equippedRarity.color};">${formatItemNameWithRarity(equippedItem)}</span></div>`;
  } else if (equippedItem) {
    // Show hint about shift key if there's an equipped item but comparison is not shown
    comparisonHtml += '<div class="tooltip-comparison">Hold Shift for detailed comparison</div>';
  } else {
    // No equipped item
    comparisonHtml += `<div class="tooltip-comparison">No ${item.type} equipped</div>`;
  }
  
  // Add sell information at the bottom
  const sellPrice = Math.floor((item.price || 10) * 0.5);
  comparisonHtml += `<div class="tooltip-sell-info">Right-click to sell for ${sellPrice} gold</div>`;
  
  tooltip.innerHTML = comparisonHtml;
  tooltip.style.display = 'block';
  updateTooltipPosition(event);
}

function hideInventoryTooltip() {
  const tooltip = document.getElementById('inventory-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('inventory-tooltip');
  if (!tooltip) return;
  
  const rect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Use clientX/clientY since we're using position: fixed
  let x = event.clientX + 10;
  let y = event.clientY + 10;
  
  // Adjust if tooltip would go off right edge
  if (x + rect.width > viewportWidth) {
    x = event.clientX - rect.width - 10;
  }
  
  // Adjust if tooltip would go off bottom edge
  if (y + rect.height > viewportHeight) {
    y = event.clientY - rect.height - 10;
  }
  
  // Ensure tooltip doesn't go off left or top edges
  x = Math.max(5, x);
  y = Math.max(5, y);
  
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

// Stats Tooltip Functions
function showStatsTooltip(event, statType) {
  const tooltip = document.getElementById('stats-tooltip');
  const nameElement = document.getElementById('stats-tooltip-name');
  const contentElement = document.getElementById('stats-tooltip-content');
  
  if (tooltip && nameElement && contentElement) {
    let tooltipContent = '';
    
    // Helper function to get equipment breakdown for a specific stat
    function getEquipmentBreakdown(statName) {
      const breakdown = [];
      for (const slot in game.player.equipment) {
        const item = game.player.equipment[slot];
        if (item && item[statName] && item[statName] > 0) {
          breakdown.push({
            slot: slot,
            name: item.fullName || item.name,
            value: item[statName]
          });
        }
      }
      return breakdown;
    }
    
    if (statType === 'attack') {
      const baseAttack = game.getBaseAttackWithTalents();
      const equipmentAttack = game.player.equipmentAttack || 0;
      const talentAttack = baseAttack - 10; // Talent bonuses only
      const equipmentBreakdown = getEquipmentBreakdown('attack');
      
      nameElement.textContent = 'Total Attack Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Attack:</span>
          <span class="stat-breakdown-value">10</span>
        </div>
        ${talentAttack > 0 ? `
        <div class="stat-breakdown-item">
          <span>Talent Bonuses:</span>
          <span class="stat-breakdown-value">+${talentAttack}</span>
        </div>
        ` : ''}
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Attack:</span>
          <span class="stat-breakdown-value">${game.player.attack}</span>
        </div>
      `;
    } else if (statType === 'defense') {
      const baseDefense = game.getBaseDefenseWithTalents();
      const equipmentDefense = game.player.equipmentDefense || 0;
      const equipmentBreakdown = getEquipmentBreakdown('defense');
      
      nameElement.textContent = 'Total Defense Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Defense:</span>
          <span class="stat-breakdown-value">${baseDefense}</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Defense:</span>
          <span class="stat-breakdown-value">${game.player.defense}</span>
        </div>
      `;
    } else if (statType === 'hp') {
      const baseHP = 100; // Base HP
      const equipmentBreakdown = getEquipmentBreakdown('maxHp');
      const totalEquipmentHP = equipmentBreakdown.reduce((sum, item) => sum + item.value, 0);
      
      nameElement.textContent = 'Max HP Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base HP:</span>
          <span class="stat-breakdown-value">${baseHP}</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Max HP:</span>
          <span class="stat-breakdown-value">${game.player.maxHp}</span>
        </div>
      `;
    } else if (statType === 'attack-speed') {
      const equippedWeapon = game.player.equipment.weapon;
      const baseInterval = equippedWeapon?.baseAttackInterval || 2000;
      const totalSpeedBonus = game.player.attackSpeed || 0;
      const talentSpeedBonus = game.getBaseAttackSpeedWithTalents();
      const equipmentSpeedBonus = totalSpeedBonus - talentSpeedBonus;
      const equipmentBreakdown = getEquipmentBreakdown('attackSpeed');
      const actualInterval = game.getPlayerAttackInterval();
      
      nameElement.textContent = 'Attack Speed Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Attack Speed:</span>
          <span class="stat-breakdown-value">${(baseInterval / 1000).toFixed(1)}s</span>
        </div>
        ${talentSpeedBonus > 0 ? `
        <div class="stat-breakdown-item">
          <span>Talent Speed Bonus:</span>
          <span class="stat-breakdown-value">+${talentSpeedBonus}%</span>
        </div>
        ` : ''}
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        ${totalSpeedBonus > 0 ? `
        <div class="stat-breakdown-item">
          <span>Total Speed Bonus:</span>
          <span class="stat-breakdown-value">+${totalSpeedBonus}%</span>
        </div>
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Actual Attack Speed:</span>
          <span class="stat-breakdown-value">${(actualInterval / 1000).toFixed(1)}s</span>
        </div>
      `;
    } else if (statType === 'crit-chance') {
      const talentCrit = game.getBaseCritChanceWithTalents();
      const equipmentBreakdown = getEquipmentBreakdown('critChance');
      const totalEquipmentCrit = equipmentBreakdown.reduce((sum, item) => sum + item.value, 0);
      
      nameElement.textContent = 'Critical Chance Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Critical Chance:</span>
          <span class="stat-breakdown-value">0%</span>
        </div>
        ${talentCrit > 0 ? `
        <div class="stat-breakdown-item">
          <span>Talent Bonuses:</span>
          <span class="stat-breakdown-value">+${talentCrit}%</span>
        </div>
        ` : ''}
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Critical Chance:</span>
          <span class="stat-breakdown-value">${game.player.critChance || 0}%</span>
        </div>
      `;
    } else if (statType === 'crit-damage') {
      const equipmentBreakdown = getEquipmentBreakdown('critDamage');
      
      nameElement.textContent = 'Critical Damage Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Critical Damage:</span>
          <span class="stat-breakdown-value">0%</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Critical Damage:</span>
          <span class="stat-breakdown-value">${game.player.critDamage || 0}%</span>
        </div>
      `;
    } else if (statType === 'life-steal') {
      const equipmentBreakdown = getEquipmentBreakdown('lifeSteal');
      
      nameElement.textContent = 'Life Steal Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Life Steal:</span>
          <span class="stat-breakdown-value">0%</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Life Steal:</span>
          <span class="stat-breakdown-value">${game.player.lifeSteal || 0}%</span>
        </div>
      `;
    } else if (statType === 'dodge') {
      const equipmentBreakdown = getEquipmentBreakdown('dodge');
      
      nameElement.textContent = 'Dodge Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Dodge:</span>
          <span class="stat-breakdown-value">0%</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Dodge:</span>
          <span class="stat-breakdown-value">${game.player.dodge || 0}%</span>
        </div>
      `;
    } else if (statType === 'block-chance') {
      const equipmentBreakdown = getEquipmentBreakdown('blockChance');
      
      nameElement.textContent = 'Block Chance Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Block Chance:</span>
          <span class="stat-breakdown-value">0%</span>
        </div>
        ${equipmentBreakdown.length > 0 ? `
        <div class="stat-breakdown-section">Equipment Bonuses:</div>
        ${equipmentBreakdown.map(item => `
          <div class="stat-breakdown-item equipment-item">
            <span>${item.name}:</span>
            <span class="stat-breakdown-value">+${item.value}%</span>
          </div>
        `).join('')}
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Block Chance:</span>
          <span class="stat-breakdown-value">${game.player.blockChance || 0}%</span>
        </div>
      `;
    } else if (statType === 'xp-multiplier') {
      const baseMultiplier = 1.0;
      const knowledgeLevel1 = game.getTalentLevel('knowledge', 'knowledge_1');
      const knowledgeLevel2 = game.getTalentLevel('knowledge', 'knowledge_2');
      const knowledgeLevel4 = game.getTalentLevel('knowledge', 'knowledge_4');
      const totalMultiplier = game.getExperienceMultiplier();
      
      nameElement.textContent = 'Experience Multiplier Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Multiplier:</span>
          <span class="stat-breakdown-value">${baseMultiplier.toFixed(2)}x</span>
        </div>
        ${knowledgeLevel1 > 0 ? `
        <div class="stat-breakdown-item">
          <span>Quick Learner (Lv${knowledgeLevel1}):</span>
          <span class="stat-breakdown-value">+${(knowledgeLevel1 * 0.20).toFixed(2)}x</span>
        </div>
        ` : ''}
        ${knowledgeLevel2 > 0 ? `
        <div class="stat-breakdown-item">
          <span>Battle Wisdom (Lv${knowledgeLevel2}):</span>
          <span class="stat-breakdown-value">+${(knowledgeLevel2 * 0.50).toFixed(2)}x</span>
        </div>
        ` : ''}
        ${knowledgeLevel4 > 0 ? `
        <div class="stat-breakdown-item">
          <span>Enlightened One:</span>
          <span class="stat-breakdown-value">×3.00x</span>
        </div>
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Experience Multiplier:</span>
          <span class="stat-breakdown-value">${totalMultiplier.toFixed(2)}x</span>
        </div>
      `;
    } else if (statType === 'gold-multiplier') {
      const baseMultiplier = 1.0;
      const wealthLevel1 = game.getTalentLevel('wealth', 'wealth_1');
      const wealthLevel4 = game.getTalentLevel('wealth', 'wealth_4');
      const totalMultiplier = game.getGoldMultiplier();
      
      nameElement.textContent = 'Gold Multiplier Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Multiplier:</span>
          <span class="stat-breakdown-value">${baseMultiplier.toFixed(2)}x</span>
        </div>
        ${wealthLevel1 > 0 ? `
        <div class="stat-breakdown-item">
          <span>Coin Collector (Lv${wealthLevel1}):</span>
          <span class="stat-breakdown-value">+${(wealthLevel1 * 0.25).toFixed(2)}x</span>
        </div>
        ` : ''}
        ${wealthLevel4 > 0 ? `
        <div class="stat-breakdown-item">
          <span>Golden Touch:</span>
          <span class="stat-breakdown-value">×2.00x</span>
        </div>
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Gold Multiplier:</span>
          <span class="stat-breakdown-value">${totalMultiplier.toFixed(2)}x</span>
        </div>
      `;
    }
    
    contentElement.innerHTML = tooltipContent;
    tooltip.style.display = 'block';
    tooltip.classList.add('visible');
    updateStatsTooltipPosition(event);
  }
}

function hideStatsTooltip() {
  const tooltip = document.getElementById('stats-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    setTimeout(() => {
      if (!tooltip.classList.contains('visible')) {
        tooltip.style.display = 'none';
      }
    }, 200);
  }
}

function updateStatsTooltipPosition(event) {
  const tooltip = document.getElementById('stats-tooltip');
  if (tooltip && tooltip.style.display === 'block') {
    const x = event.clientX + 10;
    const y = event.clientY + 10;
    
    // Prevent tooltip from going off-screen
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    if (x + tooltipRect.width > windowWidth) {
      finalX = event.clientX - tooltipRect.width - 10;
    }
    
    if (y + tooltipRect.height > windowHeight) {
      finalY = event.clientY - tooltipRect.height - 10;
    }
    
    tooltip.style.left = `${finalX}px`;
    tooltip.style.top = `${finalY}px`;
  }
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
    img.src = `./src/assets/gear/${iconName}.svg`;
    // Optional: add to a cache or just let browser cache handle it
  });
}

// Add event listeners for shift key tracking
document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = true;
    // Refresh tooltip if currently showing
    if (currentTooltipItem && currentTooltipEvent) {
      showInventoryTooltip(currentTooltipEvent, currentTooltipItem, isShiftPressed);
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    isShiftPressed = false;
    // Refresh tooltip if currently showing
    if (currentTooltipItem && currentTooltipEvent) {
      showInventoryTooltip(currentTooltipEvent, currentTooltipItem, isShiftPressed);
    }
  }
});

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  preloadGearIcons();
  initGame();
});
