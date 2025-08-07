// Zone and enemy data for the Idle RPG game

export const ZONES = {
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
      { name: 'Slime', imageClass: 'slime', hp: 50, attack: 4, defense: 2, xp: 15, gold: 5, attackInterval: 3000 },
      { name: 'Goblin', imageClass: 'goblin', hp: 80, attack: 8, defense: 5, xp: 25, gold: 10, attackInterval: 2000 },
      { name: 'Wolf', imageClass: 'wolf', hp: 70, attack: 12, defense: 4, xp: 20, gold: 8, attackInterval: 2200 }
    ],
    dropChance: 25, // 25% base drop rate
    allowedRarities: ['common'] // Only common items can drop
  },
  cave: {
    name: '🕳️ Mysterious Cave',
    description: 'Deep caves with stronger monsters',
    enemies: [
      { name: 'Orc', imageClass: 'orc', hp: 120, attack: 18, defense: 8, xp: 35, gold: 15, attackInterval: 2800 },
      { name: 'Skeleton', imageClass: 'skeleton', hp: 100, attack: 20, defense: 6, xp: 30, gold: 12, attackInterval: 2300 },
      { name: 'Spider', imageClass: 'spider', hp: 90, attack: 16, defense: 4, xp: 28, gold: 10, attackInterval: 1800 }
    ],
    dropChance: 30, // 30% base drop rate
    allowedRarities: ['common', 'uncommon'] // Common and uncommon items can drop
  },
  mountain: {
    name: '⛰️ Snowy Mountains',
    description: 'Treacherous peaks with powerful foes',
    enemies: [
      { name: 'Yeti', imageClass: 'yeti', hp: 200, attack: 25, defense: 12, xp: 50, gold: 25, attackInterval: 3500 },
      { name: 'Dragon', imageClass: 'dragon', hp: 300, attack: 35, defense: 15, xp: 80, gold: 50, attackInterval: 2200 },
      { name: 'Giant', imageClass: 'giant', hp: 250, attack: 30, defense: 10, xp: 65, gold: 35, attackInterval: 4000 }
    ],
    dropChance: 35, // 35% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare'] // Common, uncommon, and rare items can drop
  },
  goblinCave: {
    name: '🏴‍☠️ Goblin Cave',
    description: 'A dark cave infested with goblins. Defeat 15 goblins to face the Goblin King!',
    enemies: [
      { name: 'Goblin Runt', imageClass: 'goblin', hp: 60, attack: 10, defense: 3, xp: 18, gold: 7, attackInterval: 2400 },
      { name: 'Goblin Shaman', imageClass: 'goblin', hp: 85, attack: 16, defense: 6, xp: 28, gold: 12, attackInterval: 2800 },
      { name: 'Goblin Slinger', imageClass: 'goblin', hp: 75, attack: 14, defense: 4, xp: 22, gold: 9, attackInterval: 2100 },
      { name: 'Goblin Brute', imageClass: 'goblin', hp: 110, attack: 20, defense: 8, xp: 35, gold: 15, attackInterval: 3200 }
    ],
    dropChance: 40, // 40% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare', 'epic'], // Common through epic items can drop
    boss: {
      name: 'Goblin King',
      imageClass: 'goblin',
      hp: 400,
      attack: 40,
      defense: 20,
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
  { name: 'Iron Sword', type: 'weapon', attack: 15, defense: 0, price: 100 },
  { name: 'Steel Helmet', type: 'helmet', attack: 0, defense: 8, price: 80 },
  { name: 'Leather Armor', type: 'body', attack: 0, defense: 12, price: 120 },
  { name: 'Chain Legs', type: 'legs', attack: 0, defense: 10, price: 100 },
  { name: 'Studded Belt', type: 'belt', attack: 3, defense: 6, price: 70 },
  { name: 'Leather Boots', type: 'boots', attack: 0, defense: 4, price: 60 },
  { name: 'Iron Shield', type: 'offhand', attack: 0, defense: 10, price: 90 },
  { name: 'Magic Ring', type: 'ring', attack: 5, defense: 5, price: 150 },
  { name: 'Steel Sword', type: 'weapon', attack: 25, defense: 0, price: 250 },
  { name: 'Iron Plate', type: 'body', attack: 0, defense: 20, price: 300 },
  { name: 'Dragon Sword', type: 'weapon', attack: 40, defense: 0, price: 500 }
];
