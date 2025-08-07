// Zone and enemy data for the Idle RPG game

export const ZONES = {
  town: {
    name: '🏘️ Town',
    description: 'A peaceful place to rest and shop',
    enemies: [],
    isShop: true
  },
  restArea: {
    name: '🏕️ Rest Area',
    description: 'A peaceful campsite where you can pause and relax. Nothing happens here.',
    enemies: [],
    isRestArea: true
  },
  basement: {
    name: '🏠 The Basement',
    description: 'A damp, dark basement infested with weak rats. Perfect for beginners.',
    enemies: [
      { name: 'Sewer Rat', imageClass: 'sewer-rat', hp: 25, attack: 2, xp: 8, gold: 2, attackInterval: 3500 },
      { name: 'Giant Rat', imageClass: 'giant-rat', hp: 35, attack: 3, xp: 12, gold: 3, attackInterval: 3000 },
      { name: 'Diseased Rat', imageClass: 'diseased-rat', hp: 30, attack: 4, xp: 10, gold: 3, attackInterval: 2800 }
    ],
    dropChance: 15, // 15% base drop rate - lower than other zones
    allowedRarities: ['common'] // Only common items can drop
  },
  forest: {
    name: '🌲 Dark Forest',
    description: 'A mysterious forest filled with creatures',
    enemies: [
      { name: 'Slime', imageClass: 'slime', hp: 50, attack: 4, xp: 15, gold: 5, attackInterval: 3000 },
      { name: 'Goblin', imageClass: 'goblin', hp: 80, attack: 8, xp: 25, gold: 10, attackInterval: 2000 },
      { name: 'Wolf', imageClass: 'wolf', hp: 70, attack: 12, xp: 20, gold: 8, attackInterval: 2200 }
    ],
    dropChance: 25, // 25% base drop rate
    allowedRarities: ['common'] // Only common items can drop
  },
  cave: {
    name: '🕳️ Mysterious Cave',
    description: 'Deep caves with stronger monsters',
    enemies: [
      { name: 'Orc', imageClass: 'orc', hp: 120, attack: 18, xp: 35, gold: 15, attackInterval: 2800 },
      { name: 'Skeleton', imageClass: 'skeleton', hp: 100, attack: 20, xp: 30, gold: 12, attackInterval: 2300 },
      { name: 'Spider', imageClass: 'spider', hp: 90, attack: 16, xp: 28, gold: 10, attackInterval: 1800 }
    ],
    dropChance: 30, // 30% base drop rate
    allowedRarities: ['common', 'uncommon'] // Common and uncommon items can drop
  },
  mountain: {
    name: '⛰️ Snowy Mountains',
    description: 'Treacherous peaks with powerful foes',
    enemies: [
      { name: 'Yeti', imageClass: 'yeti', hp: 200, attack: 25, xp: 50, gold: 25, attackInterval: 3500 },
      { name: 'Dragon', imageClass: 'dragon', hp: 300, attack: 35, xp: 80, gold: 50, attackInterval: 2200 },
      { name: 'Giant', imageClass: 'giant', hp: 250, attack: 30, xp: 65, gold: 35, attackInterval: 4000 }
    ],
    dropChance: 35, // 35% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare'] // Common, uncommon, and rare items can drop
  },
  goblinCave: {
    name: '🏴‍☠️ Goblin Cave',
    description: 'A dark cave infested with goblins. Defeat 15 goblins to face the Goblin King!',
    enemies: [
      { name: 'Goblin Runt', imageClass: 'goblin', hp: 60, attack: 10, xp: 18, gold: 7, attackInterval: 2400 },
      { name: 'Goblin Shaman', imageClass: 'goblin', hp: 85, attack: 16, xp: 28, gold: 12, attackInterval: 2800 },
      { name: 'Goblin Slinger', imageClass: 'goblin', hp: 75, attack: 14, xp: 22, gold: 9, attackInterval: 2100 },
      { name: 'Goblin Brute', imageClass: 'goblin', hp: 110, attack: 20, xp: 35, gold: 15, attackInterval: 3200 }
    ],
    dropChance: 40, // 40% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare', 'epic'], // Common through epic items can drop
    boss: {
      name: 'Goblin King',
      imageClass: 'goblin',
      hp: 400,
      attack: 40,
      xp: 150,
      gold: 100,
      requiredKills: 15,
      isLegendaryDropper: true,
      attackInterval: 2500
    },
    killCount: 0
  }
};

export const SHOP_ITEMS = [
  { name: 'Iron Sword', type: 'weapon', attack: 15, maxHp: 0, price: 100 },
  { name: 'Steel Helmet', type: 'helmet', attack: 0, maxHp: 8, price: 80 },
  { name: 'Leather Armor', type: 'body', attack: 0, maxHp: 12, price: 120 },
  { name: 'Chain Legs', type: 'legs', attack: 0, maxHp: 10, price: 100 },
  { name: 'Studded Belt', type: 'belt', attack: 3, maxHp: 6, price: 70 },
  { name: 'Leather Boots', type: 'boots', attack: 0, maxHp: 4, price: 60 },
  { name: 'Iron Shield', type: 'offhand', attack: 0, maxHp: 10, price: 90 },
  { name: 'Magic Ring', type: 'ring', attack: 5, maxHp: 5, price: 150 },
  { name: 'Steel Sword', type: 'weapon', attack: 25, maxHp: 0, price: 250 },
  { name: 'Iron Plate', type: 'body', attack: 0, maxHp: 20, price: 300 },
  { name: 'Dragon Sword', type: 'weapon', attack: 40, maxHp: 0, price: 500 }
];
