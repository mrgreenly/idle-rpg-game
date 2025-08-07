# ⚔️ Idle RPG Adventure

An immersive idle RPG game built with vanilla JavaScript and Vite where both you and enemies attack automatically at set intervals.

## 🎮 Game Features

### Core Gameplay
- **Automatic Combat System**: Both player and enemies attack every 2 seconds in turn-based combat
- **Progressive Leveling**: Gain XP and level up to increase your stats
- **Real-time Health Bars**: Visual HP tracking for both player and enemies

### Equipment System
- **5 Equipment Slots**: 
  - ⚔️ Weapon (increases attack)
  - ⛑️ Helmet (increases defense)
  - 🥼 Body Armor (increases defense)
  - 👖 Leg Armor (increases defense)
  - 💍 Accessory (increases both attack and defense)
- **Equipment Management**: Click equipment slots to unequip items back to inventory
- **Item Drops**: 20% chance for enemies to drop equipment when defeated

### Multiple Zones
- **🏘️ Town**: Safe zone with shops and gradual healing
- **🌲 Dark Forest**: Starting area with Slimes, Goblins, and Wolves
- **🕳️ Mysterious Cave**: Mid-tier zone with Orcs, Skeletons, and Spiders
- **⛰️ Snowy Mountains**: High-level area with Yetis, Dragons, and Giants

### Shop System
- **Town Shopping**: Purchase weapons, armor, and accessories with gold
- **Progressive Gear**: Equipment ranging from basic Iron items to legendary Dragon gear
- **Gold Economy**: Earn gold by defeating enemies and spend it on better equipment

### Save System
- **Local Storage**: Your progress is automatically saved
- **Save/Load**: Manual save and load functionality
- **Reset Option**: Start fresh with a complete game reset

## 🎯 How to Play

1. **Start Fighting**: The game automatically spawns enemies in your current zone
2. **Watch Combat**: You and enemies take turns attacking every 2 seconds
3. **Level Up**: Gain XP to increase your level and unlock higher stats
4. **Collect Loot**: Defeated enemies drop gold and occasionally equipment
5. **Upgrade Equipment**: Visit the town to buy better gear or equip found items
6. **Explore Zones**: Move to harder areas for better rewards and stronger enemies
7. **Strategic Progression**: Balance when to fight and when to upgrade equipment

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation
1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
To run the game in development mode:
```bash
npm run dev
```
This will start a local development server, typically at `http://localhost:5173`

### Building for Production
To build the game for production:
```bash
npm run build
```
The built files will be in the `dist` directory.

To preview the production build:
```bash
npm run preview
```

## 🎲 Game Mechanics

### Combat
- **Turn-based**: Alternating attacks between player and enemy
- **Damage Calculation**: `Attack - Defense + Random(0-4)` with minimum 1 damage
- **Critical Hits**: Random damage variance adds excitement to combat

### Character Progression
- **Base Stats**: Start with 10 Attack and 5 Defense
- **Equipment Bonuses**: Each piece of equipment adds to your total stats
- **Level Benefits**: Each level increases max HP by 10 and fully heals you

### Death and Consequences
- **Player Death**: Lose 20% of current gold but survive with 1 HP
- **Safe Retreat**: Automatically return to town when defeated
- **No Permanent Loss**: Character progression is never completely lost

### Zone Progression
- **Difficulty Scaling**: Each zone has progressively stronger enemies
- **Reward Scaling**: Higher zones offer more gold and XP
- **Strategic Choice**: Players must decide when they're ready for harder content

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Damage animations and level-up effects
- **Real-time Updates**: All stats and bars update in real-time
- **Intuitive Interface**: Clear equipment management and inventory system

## 🔧 Technical Details

- **Framework**: Vanilla JavaScript with ES6 modules
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Pure CSS with CSS Grid and Flexbox
- **Storage**: Local Storage for game save data
- **Performance**: Optimized game loop using requestAnimationFrame

## 📱 Browser Compatibility

This game works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Local Storage
- RequestAnimationFrame

Tested on Chrome, Firefox, Safari, and Edge.

---

**Have fun adventuring! ⚔️🛡️**
