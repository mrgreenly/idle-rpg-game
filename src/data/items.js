// Item rarity definitions with stats and appearance
export const ITEM_RARITIES = {
  common: {
    name: 'Common',
    color: '#9CA3AF', // Gray
    chance: 50,
    affixCount: 0,
    prefix: [],
    suffix: []
  },
  uncommon: {
    name: 'Uncommon',
    color: '#10B981', // Green
    chance: 30,
    affixCount: 1,
    prefix: ['Sturdy', 'Sharp', 'Keen', 'Fine'],
    suffix: ['of Power', 'of Might', 'of the Warrior']
  },
  rare: {
    name: 'Rare',
    color: '#3B82F6', // Blue
    chance: 15,
    affixCount: 2,
    prefix: ['Masterwork', 'Superior', 'Enhanced', 'Reinforced'],
    suffix: ['of the Elite', 'of Excellence', 'of the Champion', 'of Mastery']
  },
  epic: {
    name: 'Epic',
    color: '#8B5CF6', // Purple
    chance: 4,
    affixCount: 3,
    prefix: ['Legendary', 'Ancient', 'Mythical', 'Heroic', 'Blessed', 'Cursed'],
    suffix: ['of the Gods', 'of Legends', 'of Heroes', 'of Destiny', 'of the Void', 'of Strength']
  },
  legendary: {
    name: 'Legendary',
    color: '#F59E0B', // Orange/Gold
    chance: 1,
    affixCount: 5,
    prefix: ['Divine', 'Celestial', 'Eternal', 'Transcendent', 'Omnipotent', 'Radiant'],
    suffix: ['of the Immortals', 'of Eternity', 'of the Divine', 'of Transcendence', 'of Infinity', 'of the Cosmos']
  }
};

// Affix definitions with stat modifiers and item type restrictions
export const AFFIXES = {
  prefix: {
    // Uncommon prefixes
    'Sturdy': { 
      stats: { maxHp: 15, blockChance: 2 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Armor only
    },
    'Sharp': { 
      stats: { attack: 2, critChance: 3 },
      allowedTypes: ['weapon'] // Weapons only
    },
    'Keen': { 
      stats: { critChance: 5, critDamage: 8 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'Fine': { 
      stats: { attack: 1, maxHp: 5, attackSpeed: 2 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // All items
    },
    
    // Rare prefixes
    'Masterwork': { 
      stats: { attack: 4, maxHp: 10, critChance: 3 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Weapons and armor
    },
    'Superior': { 
      stats: { attack: 3, critDamage: 10 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'Enhanced': { 
      stats: { attackSpeed: 8, dodge: 5, critChance: 3 },
      allowedTypes: ['weapon', 'boots', 'legs', 'necklace', 'ring'] // Agility items
    },
    'Reinforced': { 
      stats: { maxHp: 30, blockChance: 8, dodge: 2 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Armor only
    },
    
    // Epic prefixes
    'Legendary': { 
      stats: { attack: 6, critChance: 8, critDamage: 15 },
      allowedTypes: ['weapon'] // Weapons only
    },
    'Ancient': { 
      stats: { attack: 5, maxHp: 20, blockChance: 5 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // All items
    },
    'Mythical': { 
      stats: { critDamage: 20, dodge: 8 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'Heroic': { 
      stats: { attack: 7, attackSpeed: 12, critChance: 10 },
      allowedTypes: ['weapon'] // Weapons only
    },
    'Blessed': { 
      stats: { maxHp: 25, dodge: 6, blockChance: 6 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // Armor and accessories
    },
    'Cursed': { 
      stats: { attack: 8, critChance: 12, critDamage: 18, attackSpeed: 10 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    
    // Legendary prefixes
    'Divine': { 
      stats: { attack: 10, critChance: 15, critDamage: 25 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'Celestial': { 
      stats: { maxHp: 40, blockChance: 15, dodge: 12, attackSpeed: 15 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Armor only
    },
    'Eternal': { 
      stats: { attack: 8, maxHp: 30, critDamage: 30 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // All items
    },
    'Transcendent': { 
      stats: { attack: 12, critChance: 20, dodge: 15, attackSpeed: 20 },
      allowedTypes: ['weapon', 'boots', 'legs', 'necklace', 'ring'] // Agility items
    },
    'Omnipotent': { 
      stats: { attack: 15, critChance: 18, critDamage: 35 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'Radiant': { 
      stats: { maxHp: 50, dodge: 18, attackSpeed: 25, blockChance: 20 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Armor only
    }
  },
  suffix: {
    // Uncommon suffixes
    'of Power': { 
      stats: { attack: 3 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of Might': { 
      stats: { attack: 2, critDamage: 5 },
      allowedTypes: ['weapon'] // Weapons only
    },
    'of the Warrior': { 
      stats: { attack: 1, maxHp: 10, blockChance: 3 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Weapons and armor
    },
    
    // Rare suffixes
    'of the Elite': { 
      stats: { attack: 4, critChance: 5, attackSpeed: 5 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of Excellence': { 
      stats: { critChance: 8, critDamage: 12 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of the Champion': { 
      stats: { attack: 3, maxHp: 15, dodge: 5 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand'] // Weapons and armor
    },
    'of Mastery': { 
      stats: { attackSpeed: 10, critChance: 6, dodge: 6 },
      allowedTypes: ['weapon', 'boots', 'legs', 'necklace', 'ring'] // Agility items
    },
    
    // Epic suffixes
    'of the Gods': { 
      stats: { attack: 8, critChance: 12, critDamage: 20 },
      allowedTypes: ['weapon'] // Weapons only
    },
    'of Legends': { 
      stats: { maxHp: 30, blockChance: 12 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // Armor and accessories
    },
    'of Heroes': { 
      stats: { attack: 6, attackSpeed: 15, dodge: 10 },
      allowedTypes: ['weapon', 'boots', 'legs'] // Weapons and mobility items
    },
    'of Destiny': { 
      stats: { critDamage: 25, attackSpeed: 12 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of the Void': { 
      stats: { attack: 7, critChance: 10, dodge: 12 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of Strength': { 
      stats: { attack: 9, critDamage: 22, attackSpeed: 8 },
      allowedTypes: ['weapon', 'belt', 'necklace', 'ring'] // Power items
    },
    
    // Legendary suffixes
    'of the Immortals': { 
      stats: { attack: 10, maxHp: 40, blockChance: 15 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // All items
    },
    'of Eternity': { 
      stats: { critChance: 20, critDamage: 35, attackSpeed: 25 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of the Divine': { 
      stats: { attack: 12, maxHp: 50, dodge: 20 },
      allowedTypes: ['weapon', 'helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // All items
    },
    'of Transcendence': { 
      stats: { attack: 15, critChance: 25, critDamage: 40, attackSpeed: 30 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of Infinity': { 
      stats: { attack: 13, critChance: 22, critDamage: 38, dodge: 16 },
      allowedTypes: ['weapon', 'necklace', 'ring'] // Weapons and accessories
    },
    'of the Cosmos': { 
      stats: { maxHp: 60, attackSpeed: 28, blockChance: 18 },
      allowedTypes: ['helmet', 'body', 'legs', 'boots', 'belt', 'offhand', 'necklace', 'ring'] // Armor and accessories
    }
  }
};

// Base item templates organized by equipment slot
export const BASE_ITEMS = {
  weapon: [
    { 
      name: 'Sword', 
      attack: 10, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 2000, // 2.0 seconds
      critChance: 5, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0,
      handType: '1h'
    },
    { 
      name: 'Axe', 
      attack: 15, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 2800, // 2.8 seconds (slower)
      critChance: 8, 
      critDamage: 15, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0,
      handType: '1h'
    },
    { 
      name: 'Mace', 
      attack: 12, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 2400, // 2.4 seconds
      critChance: 2, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 5,
      handType: '1h'
    },
    { 
      name: 'Dagger', 
      attack: 6, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 1600, // 1.6 seconds (faster)
      critChance: 12, 
      critDamage: 20, 
      lifeSteal: 0, 
      dodge: 8, 
      blockChance: 0,
      handType: '1h'
    },
    { 
      name: 'Staff', 
      attack: 8, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 2200, // 2.2 seconds
      critChance: 10, 
      critDamage: 25, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0,
      handType: '1h'
    },
    { 
      name: 'Greatsword', 
      attack: 20, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 3200, // 3.2 seconds (much slower)
      critChance: 3, 
      critDamage: 25, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0,
      handType: '2h'
    },
    { 
      name: 'Battleaxe', 
      attack: 25, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 3600, // 3.6 seconds (slowest)
      critChance: 5, 
      critDamage: 30, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0,
      handType: '2h'
    },
    { 
      name: 'Warhammer', 
      attack: 22, 
      maxHp: 0, 
      attackSpeed: 0, 
      baseAttackInterval: 3400, // 3.4 seconds (very slow)
      critChance: 1, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 8,
      handType: '2h'
    }
  ],
  offhand: [
    { 
      name: 'Buckler', 
      attack: 0, 
      maxHp: 40, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 5, 
      blockChance: 15 
    },
    { 
      name: 'Round Shield', 
      attack: 0, 
      maxHp: 60, 
      attackSpeed: -5, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 20 
    },
    { 
      name: 'Tower Shield', 
      attack: 0, 
      maxHp: 18, 
      attackSpeed: -10, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: -5, 
      blockChance: 30 
    },
    { 
      name: 'Tome', 
      attack: 3, 
      maxHp: 0, 
      attackSpeed: 5, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    }
  ],
  helmet: [
    { 
      name: 'Helmet', 
      attack: 0, 
      maxHp: 5, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 3 
    },
    { 
      name: 'Cap', 
      attack: 0, 
      maxHp: 3, 
      attackSpeed: 2, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 2, 
      blockChance: 0 
    },
    { 
      name: 'Crown', 
      attack: 0, 
      maxHp: 20, 
      attackSpeed: 0, 
      critChance: 3, 
      critDamage: 5, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    },
    { 
      name: 'Hood', 
      attack: 0, 
      maxHp: 10, 
      attackSpeed: 3, 
      critChance: 2, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 5, 
      blockChance: 0 
    }
  ],
  body: [
    { 
      name: 'Armor', 
      attack: 0, 
      maxHp: 60, 
      attackSpeed: -5, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 8 
    },
    { 
      name: 'Robe', 
      attack: 0, 
      maxHp: 40, 
      attackSpeed: 5, 
      critChance: 5, 
      critDamage: 10, 
      lifeSteal: 2, 
      dodge: 0, 
      blockChance: 0 
    },
    { 
      name: 'Vest', 
      attack: 0, 
      maxHp: 50, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 3, 
      blockChance: 2 
    },
    { 
      name: 'Tunic', 
      attack: 0, 
      maxHp: 30, 
      attackSpeed: 8, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 5, 
      blockChance: 0 
    }
  ],
  legs: [
    { 
      name: 'Greaves', 
      attack: 0, 
      maxHp: 40, 
      attackSpeed: -3, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 5 
    },
    { 
      name: 'Pants', 
      attack: 0, 
      maxHp: 30, 
      attackSpeed: 5, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 3, 
      blockChance: 0 
    },
    { 
      name: 'Leggings', 
      attack: 0, 
      maxHp: 7, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 2, 
      blockChance: 2 
    },
    { 
      name: 'Shorts', 
      attack: 0, 
      maxHp: 20, 
      attackSpeed: 10, 
      critChance: 2, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 8, 
      blockChance: 0 
    }
  ],
  boots: [
    { 
      name: 'Sandals', 
      attack: 0, 
      maxHp: 10, 
      attackSpeed: 8, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 8, 
      blockChance: 0 
    },
    { 
      name: 'Boots', 
      attack: 0, 
      maxHp: 5, 
      attackSpeed: 3, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 5, 
      blockChance: 0 
    },
    { 
      name: 'Heavy Boots', 
      attack: 0, 
      maxHp: 40, 
      attackSpeed: -3, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 5 
    },
    { 
      name: 'Speed Boots', 
      attack: 0, 
      maxHp: 3, 
      attackSpeed: 15, 
      critChance: 2, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 12, 
      blockChance: 0 
    }
  ],
  belt: [
    { 
      name: 'Leather Belt', 
      attack: 0, 
      maxHp: 1, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    },
    { 
      name: 'Utility Belt', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 5, 
      critChance: 3, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 3, 
      blockChance: 0 
    },
    { 
      name: 'Chain Belt', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 0, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 3 
    },
    { 
      name: 'War Belt', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 0, 
      critChance: 5, 
      critDamage: 8, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    }
  ],
  necklace: [
    { 
      name: 'Amulet', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 0, 
      critChance: 8, 
      critDamage: 15, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    },
    { 
      name: 'Pendant', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 5, 
      critChance: 0, 
      critDamage: 0, 
      lifeSteal: 5, 
      dodge: 0, 
      blockChance: 0 
    }
  ],
  ring: [
    { 
      name: 'Ring', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 3, 
      critChance: 5, 
      critDamage: 8, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    },
    { 
      name: 'Bracelet', 
      attack: 0, 
      maxHp: 0, 
      attackSpeed: 8, 
      critChance: 6, 
      critDamage: 0, 
      lifeSteal: 0, 
      dodge: 0, 
      blockChance: 0 
    }
  ]
};
