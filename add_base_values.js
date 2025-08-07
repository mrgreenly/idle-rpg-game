const fs = require('fs');

// Read the items.js file
let content = fs.readFileSync('./src/data/items.js', 'utf8');

// Add baseValue to items that don't have it
// Handle items with handType (weapons)
content = content.replace(
  /(\{\s*[\s\S]*?)(handType: '[12]h')\s*(\})/g, 
  (match, p1, p2, p3) => {
    if (match.includes('baseValue:')) {
      return match; // Already has baseValue
    }
    
    // Extract attack and maxHp values
    const attackMatch = match.match(/attack:\s*(\d+)/);
    const maxHpMatch = match.match(/maxHp:\s*(\d+)/);
    
    const attack = attackMatch ? parseInt(attackMatch[1]) : 0;
    const maxHp = maxHpMatch ? parseInt(maxHpMatch[1]) : 0;
    
    // Calculate base value using a reasonable formula
    const baseValue = Math.max(Math.floor(attack * 2.5 + maxHp * 0.5), 10);
    
    return p1 + p2 + ',\n      baseValue: ' + baseValue + p3;
  }
);

// Handle items without handType (armor, accessories)
content = content.replace(
  /(\{\s*[\s\S]*?blockChance:\s*\d+)\s*(\})/g, 
  (match, p1, p2) => {
    if (match.includes('baseValue:') || match.includes('handType:')) {
      return match; // Already has baseValue or is a weapon
    }
    
    // Extract attack and maxHp values
    const attackMatch = match.match(/attack:\s*(\d+)/);
    const maxHpMatch = match.match(/maxHp:\s*(\d+)/);
    
    const attack = attackMatch ? parseInt(attackMatch[1]) : 0;
    const maxHp = maxHpMatch ? parseInt(maxHpMatch[1]) : 0;
    
    // Calculate base value for armor/accessories
    const baseValue = Math.max(Math.floor(attack * 2.5 + maxHp * 0.3), 5);
    
    return p1 + ',\n      baseValue: ' + baseValue + p2;
  }
);

fs.writeFileSync('./src/data/items.js', content);
console.log('Successfully added baseValue to all items!');
