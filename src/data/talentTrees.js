

export function hideTalentTree(game, document) {
  const talentModal = document.getElementById('talent-tree-modal');
  talentModal.style.display = 'none';
  game.isShowingTalentTree = false;
  game.ascend(game, document);
}

// Talent Tree UI Functions
export function showTalentTree(game, document) {
  const talentModal = document.getElementById('talent-tree-modal');
  talentModal.style.display = 'flex';
  game.isShowingTalentTree = true;
  
  // Populate talent tree
  populateTalentTree(game, document);
  updateTalentTreeUI(game);
}

export function populateTalentTree(game, document) {
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    Object.keys(TALENT_TREES).forEach(pathwayName => {
      const pathway = TALENT_TREES[pathwayName];
      const pathwayElement = document.getElementById(`pathway-${pathwayName}`);
      
      if (!pathwayElement) return;
      
      // Get containers - try both selectors
      let nodesContainer = pathwayElement.querySelector('.talent-nodes-container');
      let connectionsContainer = pathwayElement.querySelector('.talent-connections');
      
      // Fallback to ID-based selectors if class-based ones don't work
      if (!nodesContainer) {
        nodesContainer = document.getElementById(`${pathwayName}-nodes`);
      }
      if (!connectionsContainer) {
        connectionsContainer = document.getElementById(`${pathwayName}-connections`);
      }
      
      if (!nodesContainer || !connectionsContainer) return;
      
      // Clear existing content
      nodesContainer.innerHTML = '';
      connectionsContainer.innerHTML = '';
      
      // Calculate grid dimensions with fallbacks
      const gridWidth = nodesContainer.clientWidth || 180;
      const gridHeight = nodesContainer.clientHeight || 350;
      const nodeSize = 60;
      
      // Get max grid coordinates to normalize positions
      const maxX = Math.max(...pathway.nodes.map(n => n.position.x));
      const maxY = Math.max(...pathway.nodes.map(n => n.position.y));
      
      if (maxX === 0 || maxY === 0) return;
      
      // Create talent nodes
      const nodePositions = {};
      pathway.nodes.forEach(talent => {
        const currentLevel = game.getTalentLevel(pathwayName, talent.id);
        const canAllocate = game.canAllocateTalent(pathwayName, talent.id);
        let nextCost = talent.cost * (currentLevel + 1);
        
        // Apply Enlightened One cost reduction for display
        const enlightenedOneLevel = game.getTalentLevel('knowledge', 'knowledge_4');
        if (enlightenedOneLevel > 0) {
          nextCost = Math.floor(nextCost * 0.5);
        }
        
        // Calculate absolute position
        const x = (talent.position.x / maxX) * (gridWidth - nodeSize) + nodeSize/2;
        const y = (talent.position.y / maxY) * (gridHeight - nodeSize) + nodeSize/2;
        nodePositions[talent.id] = { x, y };
        
        const nodeElement = document.createElement('div');
        nodeElement.className = `talent-node tier-${talent.tier} ${currentLevel > 0 ? 'allocated' : ''} ${canAllocate ? 'available' : 'locked'}`;
        nodeElement.dataset.pathway = pathwayName;
        nodeElement.dataset.talent = talent.id;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        
        nodeElement.innerHTML = `
          ${currentLevel > 0 ? `<div class="purchase-counter">${currentLevel}</div>` : ''}
          <div class="talent-icon">${talent.icon}</div>
        `;
        
        // Add tooltip functionality
        nodeElement.addEventListener('mouseenter', (e) => {
          showTalentTooltip(e, talent, currentLevel, nextCost);
        });
        
        nodeElement.addEventListener('mouseleave', () => {
          hideTalentTooltip();
        });
        
        nodeElement.addEventListener('mousemove', (e) => {
          updateTalentTooltipPosition(e, document);
        });
        
        nodeElement.addEventListener('click', () => {
          if (game.canAllocateTalent(pathwayName, talent.id)) {
            game.allocateTalent(pathwayName, talent.id);
            updateTalentTreeUI(game);
          }
        });
        
        nodesContainer.appendChild(nodeElement);
      });
      
      // Draw connection lines
      pathway.nodes.forEach(talent => {
        if (talent.prerequisites && talent.prerequisites.length > 0) {
          talent.prerequisites.forEach(prereqId => {
            const prereqNode = pathway.nodes.find(n => n.id === prereqId);
            if (prereqNode && nodePositions[talent.id] && nodePositions[prereqId]) {
              drawConnection(
                connectionsContainer,
                nodePositions[prereqId],
                nodePositions[talent.id],
                game.getTalentLevel(pathwayName, prereqId) > 0,
                game.canAllocateTalent(pathwayName, talent.id)
              );
            }
          });
        }
      });
    });
  }, 100);
}

function drawConnection(svgContainer, fromPos, toPos, isActive, isAvailable) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', fromPos.x);
  line.setAttribute('y1', fromPos.y);
  line.setAttribute('x2', toPos.x);
  line.setAttribute('y2', toPos.y);
  
  // Use setAttribute for SVG class instead of className
  let classNames = 'talent-connection-line';
  if (isActive) classNames += ' active';
  if (isAvailable) classNames += ' available';
  line.setAttribute('class', classNames);
  
  svgContainer.appendChild(line);
}

export function updateTalentTreeUI(game) {
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
  populateTalentTree(game, document);
}

// Talent Tooltip Functions
export function showTalentTooltip(event, talent, currentLevel, nextCost) {
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
    updateTalentTooltipPosition(event, document);
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

function updateTalentTooltipPosition(event, document) {
  const tooltip = document.getElementById('talent-tooltip');
  if (tooltip && tooltip.style.display === 'block') {
    // Place tooltip slightly above and to the right of the cursor
    let x = event.clientX + 12;
    let y = event.clientY - 8 - tooltip.offsetHeight;
    // If above is offscreen, place below
    if (y < 0) y = event.clientY + 12;
    // Prevent tooltip from going off right/bottom edge
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (x + tooltipRect.width > windowWidth) x = windowWidth - tooltipRect.width - 8;
    if (y + tooltipRect.height > windowHeight) y = windowHeight - tooltipRect.height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }
}



// Talent Tree Data - Easy to modify and extend
export const TALENT_TREES = {
  power: {
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
        effect: '+5 attack',
        stat: 'attack',
        value: 5,
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
        effect: '+10% attack per level',
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
  },

  wealth: {
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
  },

  knowledge: {
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
  }
};


// energy: {
//     name: 'Path of Energy',
//     icon: '⚡',
//     description: 'Enhance energy usage and energy storage',
//     nodes: [
//       // Tier 1 - Starting nodes
//       {
//         id: 'energy_1',
//         name: 'Energy Flow',
//         description: 'Improve energy regeneration rate',
//         icon: '💧',
//         effect: '+5 attack',
//         stat: 'attack',
//         value: 5,
//         cost: 40,
//         maxLevel: 5,
//         tier: 1,
//         position: { x: 2, y: 0 },
//         prerequisites: []
//       },
//       {
//         id: 'energy_2',
//         name: 'Energy Storage',
//         icon: '💧',
//         description: 'Increase energy storage capacity',
//         effect: '+10% energy storage per level',
//         cost: 50,
//         tier: 1,
//         position: { x: 2, y: 0 },
//         prerequisites: []
//       },
//       // Tier 2 - First branch
//       {
//         id: 'exploration_2a',
//         name: 'Monster Hunter',
//         icon: '🏹',
//         description: 'Encounter rare enemies more often',
//         effect: 'Increase rare enemy spawn chance by 25%',
//         cost: 75,
//         tier: 2,
//         position: { x: 1, y: 1 },
//         prerequisites: ['exploration_1']
//       },
//       {
//         id: 'exploration_2b',
//         name: 'Zone Master',
//         icon: '🌍',
//         description: 'Better understanding of zones',
//         effect: 'Gain 15% more XP and gold from all zones',
//         cost: 75,
//         maxLevel: 2,
//         tier: 2,
//         position: { x: 3, y: 1 },
//         prerequisites: ['exploration_1']
//       },
//       // Tier 3 - Specialized branches
//       {
//         id: 'exploration_3a',
//         name: 'Beast Tracker',
//         icon: '🐺',
//         description: 'Specialize in hunting beasts',
//         effect: 'Double drop chance from beast-type enemies',
//         cost: 100,
//         tier: 3,
//         position: { x: 0, y: 2 },
//         prerequisites: ['exploration_2a']
//       },
//       {
//         id: 'exploration_3b',
//         name: 'Boss Slayer',
//         icon: '🗡️',
//         description: 'Reduce boss requirements',
//         effect: 'Reduce boss spawn requirements by 5 kills',
//         cost: 100,
//         tier: 3,
//         position: { x: 2, y: 2 },
//         prerequisites: ['exploration_2a', 'exploration_2b']
//       },
//       {
//         id: 'exploration_3c',
//         name: 'Territory Control',
//         icon: '🏰',
//         description: 'Dominate zones completely',
//         effect: 'Killing 100 enemies in a zone grants permanent 10% bonus',
//         cost: 120,
//         maxLevel: 3,
//         tier: 3,
//         position: { x: 4, y: 2 },
//         prerequisites: ['exploration_2b']
//       },
//       // Tier 4 - Master nodes
//       {
//         id: 'exploration_4',
//         name: 'Realm Walker',
//         icon: '👑',
//         description: 'Master of all zones',
//         effect: 'Unlocks special endgame zones and 25% global bonus',
//         cost: 250,
//         tier: 4,
//         position: { x: 2, y: 3 },
//         prerequisites: ['exploration_3a', 'exploration_3b', 'exploration_3c']
//       }
//     ]
//   },