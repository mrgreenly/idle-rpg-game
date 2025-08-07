// Talent Tree Configuration
// Easy to add new pathways, nodes, and modify existing ones

// Helper function to create talent nodes easily
function createTalentNode(config) {
  return {
    id: config.id,
    name: config.name,
    icon: config.icon,
    description: config.description,
    effect: config.effect,
    cost: config.cost,
    maxLevel: config.maxLevel || 1,
    tier: config.tier,
    position: config.position, // { x, y }
    prerequisites: config.prerequisites || []
  };
}

// Helper function to create talent pathways easily
function createTalentPathway(config) {
  return {
    name: config.name,
    icon: config.icon,
    description: config.description,
    nodes: config.nodes.map(node => createTalentNode(node))
  };
}

// Talent Tree Data - Easy to modify and extend
export const TALENT_TREES = {
  exploration: createTalentPathway({
    name: 'Path of Exploration',
    icon: '🗺️',
    description: 'Unlock new zones and content',
    nodes: [
      // Tier 1 - Starting nodes
      {
        id: 'exploration_1',
        name: 'Zone Scout',
        icon: '🧭',
        description: 'Unlocks additional zones earlier',
        effect: 'Reduce zone unlock level requirements by 2',
        cost: 50,
        tier: 1,
        position: { x: 2, y: 0 },
        prerequisites: []
      },
      // Tier 2 - First branch
      {
        id: 'exploration_2a',
        name: 'Monster Hunter',
        icon: '🏹',
        description: 'Encounter rare enemies more often',
        effect: 'Increase rare enemy spawn chance by 25%',
        cost: 75,
        tier: 2,
        position: { x: 1, y: 1 },
        prerequisites: ['exploration_1']
      },
      {
        id: 'exploration_2b',
        name: 'Zone Master',
        icon: '🌍',
        description: 'Better understanding of zones',
        effect: 'Gain 15% more XP and gold from all zones',
        cost: 75,
        maxLevel: 2,
        tier: 2,
        position: { x: 3, y: 1 },
        prerequisites: ['exploration_1']
      },
      // Tier 3 - Specialized branches
      {
        id: 'exploration_3a',
        name: 'Beast Tracker',
        icon: '🐺',
        description: 'Specialize in hunting beasts',
        effect: 'Double drop chance from beast-type enemies',
        cost: 100,
        tier: 3,
        position: { x: 0, y: 2 },
        prerequisites: ['exploration_2a']
      },
      {
        id: 'exploration_3b',
        name: 'Boss Slayer',
        icon: '🗡️',
        description: 'Reduce boss requirements',
        effect: 'Reduce boss spawn requirements by 5 kills',
        cost: 100,
        tier: 3,
        position: { x: 2, y: 2 },
        prerequisites: ['exploration_2a', 'exploration_2b']
      },
      {
        id: 'exploration_3c',
        name: 'Territory Control',
        icon: '🏰',
        description: 'Dominate zones completely',
        effect: 'Killing 100 enemies in a zone grants permanent 10% bonus',
        cost: 120,
        maxLevel: 3,
        tier: 3,
        position: { x: 4, y: 2 },
        prerequisites: ['exploration_2b']
      },
      // Tier 4 - Master nodes
      {
        id: 'exploration_4',
        name: 'Realm Walker',
        icon: '👑',
        description: 'Master of all zones',
        effect: 'Unlocks special endgame zones and 25% global bonus',
        cost: 250,
        tier: 4,
        position: { x: 2, y: 3 },
        prerequisites: ['exploration_3a', 'exploration_3b', 'exploration_3c']
      }
    ]
  }),

  power: createTalentPathway({
    name: 'Path of Power',
    icon: '⚔️',
    description: 'Increase combat effectiveness',
    nodes: [
      // Tier 1
      {
        id: 'power_1',
        name: 'Warrior Training',
        icon: '💪',
        description: 'Increase base attack power',
        effect: '+5 base attack per level',
        cost: 40,
        maxLevel: 5,
        tier: 1,
        position: { x: 2, y: 0 },
        prerequisites: []
      },
      // Tier 2 - Combat branches
      {
        id: 'power_2a',
        name: 'Weapon Mastery',
        icon: '🗡️',
        description: 'Master weapon combat',
        effect: '+10% weapon damage per level',
        cost: 60,
        maxLevel: 3,
        tier: 2,
        position: { x: 1, y: 1 },
        prerequisites: ['power_1']
      },
      {
        id: 'power_2b',
        name: 'Combat Mastery',
        icon: '🎯',
        description: 'Improve critical hit chance',
        effect: '+2% critical chance per level',
        cost: 60,
        maxLevel: 3,
        tier: 2,
        position: { x: 3, y: 1 },
        prerequisites: ['power_1']
      },
      // Tier 3 - Specialized combat
      {
        id: 'power_3a',
        name: 'Berserker Rage',
        icon: '⚡',
        description: 'Increase attack speed',
        effect: '+10% attack speed per level',
        cost: 80,
        maxLevel: 3,
        tier: 3,
        position: { x: 0, y: 2 },
        prerequisites: ['power_2a']
      },
      {
        id: 'power_3b',
        name: 'Precise Strikes',
        icon: '🔥',
        description: 'Deadly precision',
        effect: '+15% critical damage per level',
        cost: 85,
        maxLevel: 4,
        tier: 3,
        position: { x: 2, y: 2 },
        prerequisites: ['power_2a', 'power_2b']
      },
      {
        id: 'power_3c',
        name: 'Battle Focus',
        icon: '🧠',
        description: 'Mental fortitude in combat',
        effect: '+5% dodge chance and +3% block chance per level',
        cost: 90,
        maxLevel: 2,
        tier: 3,
        position: { x: 4, y: 2 },
        prerequisites: ['power_2b']
      },
      // Tier 4 - Ultimate power
      {
        id: 'power_4',
        name: 'Legendary Warrior',
        icon: '🏆',
        description: 'Transcendent combat mastery',
        effect: '+50% damage, +25% crit chance, +20% attack speed',
        cost: 300,
        tier: 4,
        position: { x: 2, y: 3 },
        prerequisites: ['power_3a', 'power_3b', 'power_3c']
      }
    ]
  }),

  wealth: createTalentPathway({
    name: 'Path of Wealth',
    icon: '💰',
    description: 'Increase gold gain and rewards',
    nodes: [
      // Tier 1
      {
        id: 'wealth_1',
        name: 'Coin Collector',
        icon: '🪙',
        description: 'Increase gold drops from enemies',
        effect: '+25% gold gain per level',
        cost: 45,
        maxLevel: 4,
        tier: 1,
        position: { x: 2, y: 0 },
        prerequisites: []
      },
      // Tier 2 - Wealth branches
      {
        id: 'wealth_2a',
        name: 'Lucky Find',
        icon: '🍀',
        description: 'Increase item drop chance',
        effect: '+10% item drop chance per level',
        cost: 70,
        maxLevel: 3,
        tier: 2,
        position: { x: 1, y: 1 },
        prerequisites: ['wealth_1']
      },
      {
        id: 'wealth_2b',
        name: 'Gold Rush',
        icon: '💸',
        description: 'Bonus gold from streaks',
        effect: 'Killing enemies without taking damage gives +5% gold per streak',
        cost: 65,
        maxLevel: 5,
        tier: 2,
        position: { x: 3, y: 1 },
        prerequisites: ['wealth_1']
      },
      // Tier 3 - Advanced wealth
      {
        id: 'wealth_3a',
        name: 'Treasure Hunter',
        icon: '💎',
        description: 'Higher chance for rare items',
        effect: '+15% chance for higher rarity per level',
        cost: 90,
        maxLevel: 2,
        tier: 3,
        position: { x: 0, y: 2 },
        prerequisites: ['wealth_2a']
      },
      {
        id: 'wealth_3b',
        name: 'Merchant Mind',
        icon: '🏪',
        description: 'Better item values',
        effect: 'Items sell for +20% more gold per level',
        cost: 95,
        maxLevel: 3,
        tier: 3,
        position: { x: 2, y: 2 },
        prerequisites: ['wealth_2a', 'wealth_2b']
      },
      {
        id: 'wealth_3c',
        name: 'Golden Streak',
        icon: '🌟',
        description: 'Massive streak bonuses',
        effect: 'Gold streak bonuses last 50% longer per level',
        cost: 100,
        maxLevel: 2,
        tier: 3,
        position: { x: 4, y: 2 },
        prerequisites: ['wealth_2b']
      },
      // Tier 4 - Ultimate wealth
      {
        id: 'wealth_4',
        name: 'Golden Touch',
        icon: '✨',
        description: 'Midas-like power',
        effect: 'Double gold gain, +50% item drops, items have 10% chance to duplicate',
        cost: 350,
        tier: 4,
        position: { x: 2, y: 3 },
        prerequisites: ['wealth_3a', 'wealth_3b', 'wealth_3c']
      }
    ]
  }),

  knowledge: createTalentPathway({
    name: 'Path of Knowledge',
    icon: '📚',
    description: 'Increase experience gain',
    nodes: [
      // Tier 1
      {
        id: 'knowledge_1',
        name: 'Quick Learner',
        icon: '📖',
        description: 'Gain experience faster',
        effect: '+20% experience gain per level',
        cost: 35,
        maxLevel: 5,
        tier: 1,
        position: { x: 2, y: 0 },
        prerequisites: []
      },
      // Tier 2 - Learning branches
      {
        id: 'knowledge_2a',
        name: 'Battle Wisdom',
        icon: '⚔️',
        description: 'Bonus XP from combat victories',
        effect: '+50% bonus XP from defeating enemies per level',
        cost: 55,
        maxLevel: 3,
        tier: 2,
        position: { x: 1, y: 1 },
        prerequisites: ['knowledge_1']
      },
      {
        id: 'knowledge_2b',
        name: 'Study Habits',
        icon: '📝',
        description: 'Efficient learning methods',
        effect: 'Gain bonus XP equal to 5% of current level every 60 seconds',
        cost: 50,
        maxLevel: 4,
        tier: 2,
        position: { x: 3, y: 1 },
        prerequisites: ['knowledge_1']
      },
      // Tier 3 - Advanced learning
      {
        id: 'knowledge_3a',
        name: 'Master Scholar',
        icon: '🎓',
        description: 'Reduce XP requirements for leveling',
        effect: '-10% XP needed per level (max 30%)',
        cost: 85,
        maxLevel: 3,
        tier: 3,
        position: { x: 0, y: 2 },
        prerequisites: ['knowledge_2a']
      },
      {
        id: 'knowledge_3b',
        name: 'Experience Burst',
        icon: '💫',
        description: 'Burst learning periods',
        effect: 'Every 10th enemy gives 5x experience',
        cost: 90,
        maxLevel: 2,
        tier: 3,
        position: { x: 2, y: 2 },
        prerequisites: ['knowledge_2a', 'knowledge_2b']
      },
      {
        id: 'knowledge_3c',
        name: 'Passive Learning',
        icon: '🧘',
        description: 'Learn while inactive',
        effect: 'Gain XP over time even when not fighting',
        cost: 80,
        maxLevel: 3,
        tier: 3,
        position: { x: 4, y: 2 },
        prerequisites: ['knowledge_2b']
      },
      // Tier 4 - Ultimate knowledge
      {
        id: 'knowledge_4',
        name: 'Enlightened One',
        icon: '🔮',
        description: 'Transcendent learning abilities',
        effect: 'Triple XP gain, start at level 5, reduce talent costs by 50%',
        cost: 400,
        tier: 4,
        position: { x: 2, y: 3 },
        prerequisites: ['knowledge_3a', 'knowledge_3b', 'knowledge_3c']
      }
    ]
  })
};

// Template for adding new pathways - just copy and modify
export const NEW_PATHWAY_TEMPLATE = {
  pathwayId: createTalentPathway({
    name: 'New Pathway Name',
    icon: '🆕',
    description: 'Description of what this pathway does',
    nodes: [
      {
        id: 'pathway_1',
        name: 'Starting Node',
        icon: '🌟',
        description: 'Description of the talent',
        effect: 'What the talent does mechanically',
        cost: 50,
        maxLevel: 1,
        tier: 1,
        position: { x: 2, y: 0 },
        prerequisites: []
      }
      // Add more nodes here following the pattern
    ]
  })
};

// Template for adding new nodes to existing pathways
export const NEW_NODE_TEMPLATE = {
  id: 'pathway_new',
  name: 'New Talent Name',
  icon: '🆕',
  description: 'What this talent does',
  effect: 'Mechanical effect with numbers',
  cost: 100,
  maxLevel: 1,
  tier: 2,
  position: { x: 1, y: 1 }, // Position in the grid
  prerequisites: ['prerequisite_node_id'] // Array of required talents
};
