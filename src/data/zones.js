// Initialize zones
export function initializeZones(game, document, startCombat) {
  const zoneButtonsDiv = document.getElementById('zone-buttons');

  // preload images
  Object.values(game.zones).forEach(zone => {
    zone.enemies.forEach(enemy => {
      const enemyImage = new Image();
      enemyImage.src = `assets/enemies/${enemy.imageClass}.png`;
    });
  });

  //sort the zones based on their zoneNumber
  const sortedZones = Object.entries(game.zones).sort(
    ([, a], [, b]) => (a.zoneNumber || 0) - (b.zoneNumber || 0)
  );

  //
  for (const [zoneKey, zone] of sortedZones) {
    const button = document.createElement('button');
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    
    button.className = `zone-btn ${zoneKey === 'town' ? 'town' : ''} ${!isUnlocked ? 'locked' : ''}`;
    button.textContent = zone.name;
    button.setAttribute('data-zone', zoneKey);

    if (isUnlocked) {
      button.addEventListener('click', () => changeZone(game, document, zoneKey, startCombat));
    } else {
      button.addEventListener('click', () => {
        if (zone.unlockLevel) {
          game.addLogMessage(`This zone is locked. Reach level ${zone.unlockLevel} to unlock it!`, 'system');
        } else {
          game.addLogMessage('This zone is locked. Complete more areas to unlock it!', 'system');
        }
      });
    }

    button.addEventListener('mouseleave', () => { hideZoneTooltip(); });
    button.addEventListener('mouseenter', (e) => { showZoneTooltip(game, document, e, zoneKey, zone, isUnlocked); });
    button.addEventListener('mousemove', (e) => { updateZoneTooltipPosition(e); });
    
    zoneButtonsDiv.appendChild(button);
  }
}

export function checkZoneUnlocks(game, document, startCombat) {
  const playerLevel = game.player.level;
  let newZoneUnlocked = false;
  
  // Unlock conditions for each zone
  let baseUnlockConditions = {};

  // Define zone unlock conditions
  Object.values(game.zones).forEach(zone => {
    baseUnlockConditions[zone.name] = { level: zone.unlockLevel , message: `The ${zone.name} can now be accessed!`};
  });

  // Deep copy to avoid mutation
  let unlockConditions = {};
  for (const key in baseUnlockConditions) {
    unlockConditions[key] = { ...baseUnlockConditions[key] };
  }
  
  console.log(unlockConditions);
    
  for (const [zoneKey, condition] of Object.entries(unlockConditions)) {
    if (!game.unlockedZones.includes(zoneKey) && playerLevel >= condition.level) {
      game.unlockedZones.push(zoneKey);
      game.addLogMessage(condition.message, 'system');
      newZoneUnlocked = true;
    }
  }
  
  // Always refresh zone tooltips to update current level display
  refreshZoneTooltips(game, document, startCombat);

  // If new zones were unlocked, refresh the zone buttons
  if (newZoneUnlocked) {
    refreshZoneButtons(game, document, startCombat);
  }
}

// Zone Tooltip Functions
function showZoneTooltip(game, document, event, zoneKey, zone, isUnlocked) {
  const tooltip = document.getElementById('zone-tooltip');
  const iconElement = document.getElementById('zone-tooltip-icon');
  const titleElement = document.getElementById('zone-tooltip-title');
  const descriptionElement = document.getElementById('zone-tooltip-description');
  const contentElement = document.getElementById('zone-tooltip-content');

  // Always show tooltip when called
  tooltip.style.display = 'block';
  setTimeout(() => tooltip.classList.add('visible'), 10);

  // Set zone icon based on type
  const zoneIcons = {
    forest: '🌲',
    cave: '🕳️',
    goblinCave: '👹',
    mountain: '🏔️'
  };

  let contentHtml = '';
  console.log(document)

  iconElement.textContent = zoneIcons[zoneKey] || '🗺️';
  titleElement.textContent = zone.name;
  descriptionElement.textContent = zone.description;

  if (!tooltip || !iconElement || !titleElement || !descriptionElement || !contentElement){
    console.log("One or more tooltip elements are missing.");
    return;
  }
  console.log("Tooltip: ", tooltip, "iconElement: ", iconElement, "titleElement: ", titleElement, "descriptionElement: ", descriptionElement, "contentElement: ", contentElement);

  if (zone.allowedRarities && zone.allowedRarities.length > 0) {
    contentHtml += `
      <div class="zone-drop-rarities">
        <div class="zone-drop-rarities-title">🎁 Drop Rarities:</div>
        <div class="zone-drop-rarities-list">
          ${zone.allowedRarities.map(allowedRarity => `• ${allowedRarity}`).join('<br>')}
        </div>
      </div>
    `;
  }

  if (zone.enemies && zone.enemies.length > 0) {
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
        <div class="zone-tooltip-boss-info">HP: ${zone.boss.hp}, ATK: ${zone.boss.attack}<br>Requires ${zone.boss.requiredKills} goblin kills<br>Drops epic rarity items!</div>
      </div>
    `;
  }
  
  // Show unlock requirements for locked zones
  if (!isUnlocked) {
    // Show unlock requirements for locked zones
    if (zone.unlockLevel) {
      const currentLevel = game.player.level;
      contentHtml += `
        <div class="zone-tooltip-unlock">
          <div class="zone-tooltip-unlock-title">🔒 Zone Locked</div>
          <div class="zone-tooltip-unlock-req">Required Level: ${zone.unlockLevel}</div>
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
  console.log(`Zone tooltip for ${zoneKey}`);
  
  tooltip.style.display = 'block';
  tooltip.classList.add('visible');
  updateZoneTooltipPosition(event);
}

// Zone Management
export function changeZone(game, document, zoneName, startCombat) {
  game.killCount = 0;
  game.currentZone = zoneName;
  game.currentEnemy = null;
  game.combat.isActive = false;
  
  // Update zone buttons
  document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  console.log(zoneName)
  document.querySelector(`[data-zone="${zoneName}"]`).classList.add('active');

  // Show/hide appropriate areas based on zone
  const combatArea = document.querySelector('.combat-area');
  const shopArea = document.getElementById('shop-area');
  
  if (zoneName === 'restArea') {
    combatArea.style.display = 'grid';
    shopArea.style.display = 'none';
    game.addLogMessage(`${game.zones[zoneName].name} - ${game.zones[zoneName].description}`, 'system');
    // Don't start combat or healing - just a peaceful pause area
  } else {
    combatArea.style.display = 'grid';
    shopArea.style.display = 'none';
    game.addLogMessage(`Entered ${game.zones[zoneName].name}. ${game.zones[zoneName].description}`, 'system');
  }
  setTimeout(() => startCombat(game), 500);
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

function refreshZoneTooltips(game, document, startCombat) {
  // Define unlock conditions (same as in initializeZones)
  const baseUnlockConditions = {
    'forest': { level: 1},
    'cave': { level: 5, message: 'The Mysterious Cave is now accessible!' },
    'goblinCave': { level: 8, message: 'You discovered the Goblin Cave!' },
    'mountain': { level: 12, message: 'The Snowy Mountains path has opened!' },
  };
  // Deep copy to avoid mutating shared object
  let unlockConditions = {};
  for (const key in baseUnlockConditions) {
    unlockConditions[key] = { ...baseUnlockConditions[key] };
  }
 
  //unlockConditions[key].level = Math.max(1, unlockConditions[key].level);
  
  // Update zone button tooltips to reflect current state
  const zoneButtons = document.querySelectorAll('.zone-btn');
  zoneButtons.forEach(button => {
    const zoneKey = button.getAttribute('data-zone');
    const zone = game.zones[zoneKey];
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    
    // Remove existing event listeners by cloning the button
    const newButton = button.cloneNode(true);
    
    // Add click functionality back
    if (isUnlocked) {
      newButton.addEventListener('click', () => changeZone(game, document, zoneKey, startCombat));
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

    newButton.addEventListener('mouseleave', () => { hideZoneTooltip(); });
    newButton.addEventListener('mouseenter', (e) => { showZoneTooltip(game, document, e, zoneKey, zone, isUnlocked); });
    newButton.addEventListener('mousemove', (e) => { updateZoneTooltipPosition(e); });

    button.parentNode.replaceChild(newButton, button);
    console.log(button.innerHTML, button);
    console.log(`Zone button for ${zoneKey} refreshed`);
    console.log(newButton.innerHTML, newButton);
  });
}

// Function to refresh zone button states
function refreshZoneButtons(game, document, startCombat) {
  const zoneButtons = document.querySelectorAll('.zone-btn');
  zoneButtons.forEach(button => {
    const zoneKey = button.getAttribute('data-zone');
    const isUnlocked = game.unlockedZones.includes(zoneKey);
    const zone = game.zones[zoneKey];

    if (isUnlocked && button.classList.contains('locked')) {
      button.classList.remove('locked');
      
      // Remove old click handler and add new one
      const newButton = button.cloneNode(true);

      newButton.addEventListener('click', () => changeZone(game, document, zoneKey, startCombat));
      newButton.addEventListener('mouseleave', () => { hideZoneTooltip(); });
      newButton.addEventListener('mouseenter', (e) => { showZoneTooltip(game, document, e, zoneKey, zone, isUnlocked); });
      newButton.addEventListener('mousemove', (e) => { updateZoneTooltipPosition(e); });

      button.parentNode.replaceChild(newButton, button);
    }
  });
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

export function showBossWarning(bossName) {
  const warningDiv = document.getElementById('boss-warning');
  const bossNameSpan = document.getElementById('boss-warning-name');
  
  bossNameSpan.textContent = bossName;
  warningDiv.style.display = 'block';
  
  // Hide warning after 2 seconds
  setTimeout(() => {
    warningDiv.style.display = 'none';
  }, 2000);
}

export function showVictoryMessage(bossName) {
  const victoryDiv = document.getElementById('victory-message');
  const victorySubtext = document.getElementById('victory-subtext');
  
  victorySubtext.textContent = `The ${bossName} has been defeated!`;
  victoryDiv.style.display = 'block';
  
  // Hide victory message after 4 seconds
  setTimeout(() => {
    victoryDiv.style.display = 'none';
  }, 4000);
}

// Zone and enemy data
export const ZONES = {
  restArea: {
    name: 'Rest Area',
    description: 'A peaceful campsite where you can pause and relax. Nothing happens here.',
    zoneNumber: 0,
    unlockLevel: 1,
    enemies: [],
    killCount: 0,
    isRestArea: true
  },
  basement: {
    name: 'The Basement',
    description: 'A damp, dark basement infested with weak rats. Rats are too small to carry anything of value.',
    zoneNumber: 1,
    unlockLevel: 1,
    killCount: 0,
    enemies: [
      { name: 'Sewer Rat', imageClass: 'sewerRat', hp: 25, attack: 2, xp: 5, gold: 2, attackInterval: 1800}, //1.11 dps
      { name: 'Giant Rat', imageClass: 'giantRat', hp: 50, attack: 4, xp: 8, gold: 5, attackInterval: 3000}, //1.33 dps
      { name: 'Diseased Rat', imageClass: 'diseasedRat', hp: 30, attack: 3, xp: 6, gold: 3, attackInterval: 2200} //0.82 dps
    ],
  // No item drops in the basement
  },
  forest: {
    name: 'Dark Forest',
    description: 'A mysterious forest filled with creatures',
    zoneNumber: 2,
    unlockLevel: 1,
    killCount: 0,
    enemies: [
      { name: 'Slime', imageClass: 'slime', hp: 120, attack: 4, xp: 15, gold: 5, attackInterval: 3000}, //1.33 dps
      { name: 'Goblin', imageClass: 'goblin', hp: 40, attack: 6, xp: 25, gold: 10, attackInterval: 2000}, //3 dps
      { name: 'Wolf', imageClass: 'wolf', hp: 60, attack: 12, xp: 20, gold: 8, attackInterval: 2200} //2.73 dps
    ],
  dropChance: 25, // 25% base drop rate
  allowedRarities: ['common', 'uncommon'] // Common and uncommon items can drop
  },
  cave: {
    name: 'Mysterious Cave',
    description: 'Deep caves with stronger monsters',
    zoneNumber: 3,
    unlockLevel: 5,
    killCount: 0,
    enemies: [
      { name: 'Orc', imageClass: 'orc', hp: 120, attack: 18, xp: 35, gold: 15, attackInterval: 2800 }, // 6.43 dps
      { name: 'Skeleton', imageClass: 'skeleton', hp: 100, attack: 20, xp: 30, gold: 12, attackInterval: 2300 }, // 8.70 dps
      { name: 'Spider', imageClass: 'spider', hp: 90, attack: 16, xp: 28, gold: 10, attackInterval: 1800 } // 8.89 dps
    ],
    dropChance: 30, // 30% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare'] // Common, uncommon, and rare items can drop
  },
  mountain: {
    name: 'Snowy Mountains',
    description: 'Treacherous peaks with powerful foes',
    zoneNumber: 5,
    unlockLevel: 10,
    killCount: 0,
    enemies: [
      { name: 'Yeti', imageClass: 'yeti', hp: 200, attack: 25, xp: 50, gold: 25, attackInterval: 3500 }, // 7.14 dps
      { name: 'Dragon', imageClass: 'dragon', hp: 300, attack: 35, xp: 80, gold: 50, attackInterval: 3200 }, // 10.94 dps
      { name: 'Giant', imageClass: 'giant', hp: 250, attack: 30, xp: 65, gold: 35, attackInterval: 4000 } // 7.50 dps
    ],
    dropChance: 35, // 35% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare', 'epic'] // Common, uncommon, rare, and epic items can drop
  },
  goblinCave: {
    name: 'Goblin Cave',
    description: 'A dark cave infested with goblins. Defeat 15 goblins to face the Goblin King!',
    zoneNumber: 4,
    unlockLevel: 8,
    killCount: 0,
    enemies: [
      { name: 'Goblin Runt', imageClass: 'goblinRunt', hp: 60, attack: 10, xp: 18, gold: 7, attackInterval: 2400 }, // 2.50 dps
      { name: 'Goblin Shaman', imageClass: 'goblinShaman', hp: 85, attack: 16, xp: 28, gold: 12, attackInterval: 2800 }, // 5.71 dps
      { name: 'Goblin Slinger', imageClass: 'goblinSlinger', hp: 75, attack: 14, xp: 22, gold: 9, attackInterval: 2100 }, // 6.67 dps
      { name: 'Goblin Brute', imageClass: 'goblinBrute', hp: 110, attack: 20, xp: 35, gold: 15, attackInterval: 3200 } // 6.25 dps
    ],
    dropChance: 40, // 40% base drop rate
    allowedRarities: ['common', 'uncommon', 'rare'], // Common through rare items can drop
    boss: {
      name: 'Goblin King',
      imageClass: 'goblinKing',
      hp: 400,
      attack: 40,
      xp: 150,
      gold: 100,
      requiredKills: 15,
      isEpicDropper: true,
      attackInterval: 2500, // 16 dps
      xp: 150
    },
  }
};


