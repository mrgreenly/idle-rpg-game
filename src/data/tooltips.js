import * as talentTrees from './talentTrees.js'
import * as items from './items.js'

// Function to destroy all tooltips
export function destroyAllTooltips(game, document, currentTooltipItem, currentTooltipEvent) {
  // Clear global tooltip state
  currentTooltipItem = null;
  currentTooltipEvent = null;
  
  // Hide all equipment slot tooltips
  const tooltipSlots = ['weapon', 'helmet', 'body', 'legs', 'accessory1', 'accessory2', 'belt', 'boots', 'offhand'];
  tooltipSlots.forEach(slot => {
    const tooltipElement = document.getElementById(`${slot}-tooltip`);
    if (tooltipElement) {
      tooltipElement.innerHTML = '';
      tooltipElement.style.display = 'none';
    }
  });
  
  // Hide any other visible tooltips by class
  const allTooltips = document.querySelectorAll('.tooltip, .zone-tooltip, .stat-tooltip');
  allTooltips.forEach(tooltip => {
    tooltip.style.display = 'none';
    tooltip.innerHTML = '';
  });
}

// Tooltip functions for inventory stat comparison
export function showInventoryTooltip(game, document, event, item, showComparison = false) {
  const tooltip = document.getElementById('inventory-tooltip');
  if (!tooltip || !item) return;
  
  // Get currently equipped item of the same type
  const equippedItem = game.player.equipment[item.type];
  
  // Get rarity colors for styling
  const itemRarity = items.ITEM_RARITIES[item.rarity] || items.ITEM_RARITIES.common;
  const equippedRarity = equippedItem ? (items.ITEM_RARITIES[equippedItem.rarity] || items.ITEM_RARITIES.common) : null;

  // Build tooltip HTML
  let comparisonHtml = `<div class="tooltip-title" style="color: ${itemRarity.color};">${items.formatItemNameWithRarity(item)}</div>`;
  comparisonHtml += `<div class="tooltip-item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>`;
  
  // Always show item's own stats
  const { baseStats, affixStats } = items.separateItemStats(item);
  
  const baseStatsHtml = [];
  const affixStatsHtml = [];
  
  // Show base stats
  if (baseStats.attack > 0) {
    let statText = `${baseStats.attack} Base Attack`;
    
    // Add comparison change if showing comparison and equipped item exists
    if (showComparison && equippedItem) {
      const { baseStats: equippedBaseStats } = items.separateItemStats(equippedItem);
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
  
  if (baseStats.maxHp > 0) {
    let statText = `${baseStats.maxHp} Max HP`;
    
    if (showComparison && equippedItem) {
      const { baseStats: equippedBaseStats } = items.separateItemStats(equippedItem);
      const difference = baseStats.maxHp - equippedBaseStats.maxHp;
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
        const { baseStats: equippedBaseStats } = items.separateItemStats(equippedItem);
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
      const { affixStats: equippedAffixStats } = items.separateItemStats(equippedItem);
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
  
  if (affixStats.maxHp > 0) {
    let statText = `${affixStats.maxHp} Max HP`;
    
    if (showComparison && equippedItem) {
      const { affixStats: equippedAffixStats } = items.separateItemStats(equippedItem);
      const difference = affixStats.maxHp - equippedAffixStats.maxHp;
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
        const { affixStats: equippedAffixStats } = items.separateItemStats(equippedItem);
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
    const { baseStats: equippedBaseStats, affixStats: equippedAffixStats } = items.separateItemStats(equippedItem);
    const missingStatsHtml = [];
    
    // Check for stats that exist on equipped item but not on inventory item
    const allStats = [
      { key: 'attack', label: 'Attack', unit: '', isBase: true },
      { key: 'maxHp', label: 'Max HP', unit: '', isBase: true },
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
    
    comparisonHtml += `<div class="tooltip-comparison">Compared to: <span style="color: ${equippedRarity.color};">${items.formatItemNameWithRarity(equippedItem)}</span></div>`;
  } else if (equippedItem) {
    // Show hint about shift key if there's an equipped item but comparison is not shown
    comparisonHtml += '<div class="tooltip-comparison">Hold Shift for detailed comparison</div>';
  } else {
    // No equipped item
    comparisonHtml += `<div class="tooltip-comparison">No ${item.type} equipped</div>`;
  }
  
  // Add interaction information at the bottom
  const sellPrice = Math.floor((item.price !== undefined ? item.price : 10) * 0.5);
  comparisonHtml += `<div class="tooltip-sell-info">Right click to sell for ${sellPrice} gold</div>`;
  
  tooltip.innerHTML = comparisonHtml;
  tooltip.style.display = 'block';
  updateTooltipPosition(event, document);
}

export function hideInventoryTooltip() {
  const tooltip = document.getElementById('inventory-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

export function updateTooltipPosition(event, document) {
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
export function showStatsTooltip(game, event, statType) {
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
    
    // Data-driven, future-proof stat breakdown
    const statDefs = {
      'attack': { key: 'attack', label: 'Attack', unit: '' },
      'hp': { key: 'maxHp', label: 'Max HP', unit: '' },
      'attack-speed': { key: 'attackSpeed', label: 'Attack Speed', unit: 'ms' },
      'crit-chance': { key: 'critChance', label: 'Crit Chance', unit: '%' },
      'crit-damage': { key: 'critDamage', label: 'Crit Damage', unit: '%' },
      'life-steal': { key: 'lifeSteal', label: 'Life Steal', unit: '%' },
      'dodge': { key: 'dodge', label: 'Dodge', unit: '%' },
      'block-chance': { key: 'blockChance', label: 'Block Chance', unit: '%' },
    };

    if (statDefs[statType]) {
      const { key, label, unit } = statDefs[statType];
      nameElement.textContent = `${label} Breakdown`;
      let breakdownHtml = '';

      // Base stat
      const baseValue = (key === 'attack') ? game.player.baseAttack + (game.player.level - 1) * 2 : (key === 'maxHp') ? game.player.baseHp + (game.player.level - 1) * 10 : (key === 'attackSpeed') ? game.player.equipment.weapon.baseAttackInterval : (game.player[`base${label.replace(/ /g, '')}`] ?? 0);
      breakdownHtml += `
        <div class="stat-breakdown-item">
          <span>Base:</span>
          <span class="stat-breakdown-value">${baseValue}${unit}</span>
        </div>
      `;

      // Equipment breakdown (list each item)
      let equipmentTotal = 0;
      for (const slot in game.player.equipment) {
        const item = game.player.equipment[slot];
        if (item && item[key] && item[key] !== 0) {
          breakdownHtml += `
            <div class="stat-breakdown-item">
              <span>${item.fullName || item.name} (${slot}):</span>
              <span class="stat-breakdown-value">+${item[key]}${(key === 'attackSpeed' ? '%' : unit)}</span>
            </div>
          `;
          equipmentTotal += item[key];
        }
      }
      if (equipmentTotal === 0) {
        breakdownHtml += `
          <div class="stat-breakdown-item">
            <span>Equipment:</span>
            <span class="stat-breakdown-value">+0${(key === 'attackSpeed' ? '%' : unit)}</span>
          </div>
        `;
      }

      // Talent breakdown (list each talent that affects this stat)
      let talentTotal = 0;
  for (const treeName in talentTrees.TALENT_TREES) {
    const tree = talentTrees.TALENT_TREES[treeName];
    for (const talent of tree.nodes) {
          if (talent.stat && talent.stat === key) {
            const lvl = game.getTalentLevel(treeName, talent.id);
            if (lvl > 0) {
              let bonus = 0;
              if (typeof talent.value === 'function') {
                bonus = talent.value(lvl);
              } else if (Array.isArray(talent.value)) {
                bonus = talent.value[lvl-1] || 0;
              } else {
                bonus = (talent.value || 0) * lvl;
              }
              breakdownHtml += `
                <div class="stat-breakdown-item">
                  <span>${talent.name} (Talent):</span>
                  <span class="stat-breakdown-value">+${bonus}${(key === 'attackSpeed' ? '%' : unit)}</span>
                </div>
              `;
              talentTotal += bonus;
            }
          }
        }
      }
      if (talentTotal === 0) {
        breakdownHtml += `
          <div class="stat-breakdown-item">
            <span>Talents:</span>
            <span class="stat-breakdown-value">+0${(key === 'attackSpeed' ? '%' : unit)}</span>
          </div>
        `;
      }

      // Total
      let total = baseValue + equipmentTotal + talentTotal;
      // Use getter if available for final stat (to include all effects)
      let finalValue = total;
      if (typeof game[`getPlayer${label.replace(/ /g, '')}`] === 'function') {
        try {
          finalValue = game[`getPlayer${label.replace(/ /g, '')}`]();
        } catch {}
      }
      breakdownHtml += `
        <div class="stat-breakdown-item total">
          <span>Total ${label}:</span>
          <span class="stat-breakdown-value">${finalValue}${unit}</span>
        </div>
      `;
      tooltipContent = breakdownHtml;
    } else if (statType === 'xp-multiplier') {
      const baseMultiplier = 1.0;
      const knowledgeLevel1 = game.getTalentLevel('knowledge', 'knowledge_1');
      const knowledgeLevel2a = game.getTalentLevel('knowledge', 'knowledge_2a');
      // Ascendancy: Enlightened One (should be in knowledge tree, id: 'asc_knowledge_1')
      const ascendancyXp = game.getTalentLevel('knowledge', 'asc_knowledge_1');
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
        ${knowledgeLevel2a > 0 ? `
        <div class="stat-breakdown-item">
          <span>Battle Wisdom (Lv${knowledgeLevel2a}):</span>
          <span class="stat-breakdown-value">+${(knowledgeLevel2a * 0.50).toFixed(2)}x</span>
        </div>
        ` : ''}
        ${ascendancyXp > 0 ? `
        <div class="stat-breakdown-item">
          <span>Enlightened One (Ascendancy):</span>
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
      // Ascendancy: Golden Touch (should be in wealth tree, id: 'asc_wealth_1')
      const ascendancyGold = game.getTalentLevel('wealth', 'asc_wealth_1');
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
        ${ascendancyGold > 0 ? `
        <div class="stat-breakdown-item">
          <span>Golden Touch (Ascendancy):</span>
          <span class="stat-breakdown-value">×2.00x</span>
        </div>
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Gold Multiplier:</span>
          <span class="stat-breakdown-value">${totalMultiplier.toFixed(2)}x</span>
        </div>
      `;
    } else if (statType === 'item-drop-chance') {
      const baseChance = 25;
      const wealthLevel2a = game.getTalentLevel('wealth', 'wealth_2a');
      // Ascendancy: Golden Touch (should be in wealth tree, id: 'asc_wealth_1')
      const ascendancyGold = game.getTalentLevel('wealth', 'asc_wealth_1');
      const totalMultiplier = game.getItemDropMultiplier();
      nameElement.textContent = 'Item Drop Chance Breakdown';
      tooltipContent = `
        <div class="stat-breakdown-item">
          <span>Base Drop Chance:</span>
          <span class="stat-breakdown-value">${baseChance}%</span>
        </div>
        ${wealthLevel2a > 0 ? `
        <div class="stat-breakdown-item">
          <span>Lucky Find (Lv${wealthLevel2a}):</span>
          <span class="stat-breakdown-value">+${(wealthLevel2a * 10).toFixed(0)}%</span>
        </div>
        ` : ''}
        ${ascendancyGold > 0 ? `
        <div class="stat-breakdown-item">
          <span>Golden Touch (Ascendancy):</span>
          <span class="stat-breakdown-value">+50%</span>
        </div>
        ` : ''}
        <div class="stat-breakdown-item total">
          <span>Total Drop Chance:</span>
          <span class="stat-breakdown-value">${(baseChance * totalMultiplier).toFixed(0)}%</span>
        </div>
      `;
    }
    
    contentElement.innerHTML = tooltipContent;
    tooltip.style.display = 'block';
    tooltip.classList.add('visible');
    updateStatsTooltipPosition(event, document);
  }
}

export function hideStatsTooltip() {
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

export function updateStatsTooltipPosition(event, document) {
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

export function updateCharacterTooltip(game,tooltipElement, item) {
  const rarityData = items.ITEM_RARITIES[item.rarity] || items.ITEM_RARITIES.common;
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
    if (item.maxHp) statsLines.push(`<div class="tooltip-stat-line"><span>Max HP:</span><span>${item.maxHp}</span></div>`);
    if (item.baseAttackInterval) statsLines.push(`<div class="tooltip-stat-line"><span>Attack Speed:</span><span>${(item.baseAttackInterval/1000).toFixed(1)}s</span></div>`);
    if (item.attackSpeed) statsLines.push(`<div class="tooltip-stat-line"><span>Attack Speed:</span><span>${item.attackSpeed}%</span></div>`);
    if (item.critChance) statsLines.push(`<div class="tooltip-stat-line"><span>Critical Chance:</span><span>${item.critChance}%</span></div>`);
    if (item.critDamage) statsLines.push(`<div class="tooltip-stat-line"><span>Critical Damage:</span><span>${item.critDamage}%</span></div>`);
    if (item.dodge) statsLines.push(`<div class="tooltip-stat-line"><span>Dodge:</span><span>${item.dodge}%</span></div>`);
    if (item.blockChance) statsLines.push(`<div class="tooltip-stat-line"><span>Block Chance:</span><span>${item.blockChance}%</span></div>`);
    
    tooltipElement.innerHTML = `
      <div class="tooltip-name" style="color: ${rarityColor};">
        ${items.formatItemNameWithRarity(item)}
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
  const { baseStats, affixStats } = items.separateItemStats(item);
  
  // Ensure baseStats and affixStats are defined
  if (!baseStats || !affixStats) {
    console.error('Error separating item stats:', item);
    
    // For legacy items that can't be separated, show all stats as base stats
    const baseStatsHtml = [];
    if (item.attack) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Attack:</span><span>${item.attack}</span></div>`);
    if (item.maxHp) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Max HP:</span><span>${item.maxHp}</span></div>`);
    if (item.baseAttackInterval) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Base Attack Speed:</span><span>${(item.baseAttackInterval/1000).toFixed(1)}s</span></div>`);
    if (item.attackSpeed) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Attack Speed:</span><span>${item.attackSpeed}%</span></div>`);
    if (item.critChance) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Critical Chance:</span><span>${item.critChance}%</span></div>`);
    if (item.critDamage) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Critical Damage:</span><span>${item.critDamage}%</span></div>`);
    if (item.dodge) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Dodge:</span><span>${item.dodge}%</span></div>`);
    if (item.blockChance) baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Block Chance:</span><span>${item.blockChance}%</span></div>`);
    
    tooltipElement.innerHTML = `
      <div class="tooltip-name" style="color: ${rarityColor};">
        ${items.formatItemNameWithRarity(item)}
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
  
  if (['helmet', 'body', 'legs', 'boots', 'offhand'].includes(item.type) || baseStats.maxHp > 0) {
    baseStatsHtml.push(`<div class="tooltip-stat-line stat-base"><span>Max HP:</span><span>${baseStats.maxHp}</span></div>`);
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
  
  if (affixStats.maxHp > 0) {
    affixStatsHtml.push(`<div class="tooltip-stat-line stat-neutral"><span>Max HP:</span><span>${affixStats.maxHp}</span></div>`);
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
      ${items.formatItemNameWithRarity(item)}
    </div>
    <div class="tooltip-stats">
      ${statsContent}
    </div>
    <div class="tooltip-rarity" style="color: ${rarityColor};">
      ${rarityData.name}
    </div>
  `;
}