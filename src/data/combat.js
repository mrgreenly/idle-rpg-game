import * as talentTrees from './talentTrees.js'

export function updateKillCounter(game) {
  const killCounterDiv = document.getElementById('kill-counter');
  const killCounterText = document.getElementById('kill-counter-text');

  killCounterDiv.style.display = 'block';
  let zone = game.zones[game.currentZone];

  if (zone.boss && zone.boss.requiredKills > 0) {
    killCounterText.innerHTML = `Enemies defeated this zone: ${game.killCount} <br>Kills to boss: ${game.killCount % zone.boss.requiredKills}/${zone.boss.requiredKills}`;
  } else {
    killCounterText.textContent = `Enemies defeated this zone: ${game.killCount}`;
  }
}

// Floating damage numbers
export function createFloatingDamage(document, damage, targetElement, type = 'enemy', isCritical = false, isMiss = false, isHeal = false) {
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

// Combat System
export function startCombat(game) {
  if (game.currentZone === 'restArea') return;
  
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

// Death Screen Functions
export function showDeathScreen(game, document) {
  const deathModal = document.getElementById('death-modal');
  deathModal.style.display = 'flex';
  
  // Pause game loop temporarily
  game.combat.isActive = false;
}

export function hideDeathScreen(game, document) {
  const deathModal = document.getElementById('death-modal');
  deathModal.style.display = 'none';
  
  // Show talent tree
  talentTrees.showTalentTree(game, document);
}