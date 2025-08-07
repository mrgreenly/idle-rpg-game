# Copilot Instructions for Idle RPG Game

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an idle RPG game built with vanilla JavaScript and Vite. The game features:

## Core Game Mechanics
- Automatic combat system where both player and enemies attack at intervals
- Equipment system with multiple slots: weapon, helmet, body armor, legs, accessories
- Multiple zones for exploration and combat
- Town zone with shops for spending gold
- Save/load game state functionality

## Code Structure Guidelines
- Use ES6 modules for organizing game components
- Implement a game state manager for centralized state handling
- Create separate classes for Player, Enemy, Equipment, Zone, and Combat systems
- Use event-driven architecture for game updates and UI refresh
- Implement proper error handling and validation

## UI/UX Considerations
- Create a clean, responsive interface that works on desktop and mobile
- Use CSS Grid/Flexbox for layout management
- Implement smooth animations for combat and UI transitions
- Ensure accessibility with proper ARIA labels and keyboard navigation

## Performance Guidelines
- Use requestAnimationFrame for smooth game loops
- Implement efficient update cycles to minimize CPU usage
- Use local storage for save game functionality
- Optimize DOM manipulation by batching updates
