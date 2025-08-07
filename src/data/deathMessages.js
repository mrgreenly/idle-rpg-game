// Death Messages for End Run Button
// These messages change randomly each time the character dies

export const DEATH_MESSAGES = [
  "Jump off a bridge",
  "Lay facedown in a puddle", 
  "Starve yourself",
  "Walk into a dragon's lair unarmed",
  "Challenge a mountain troll to arm wrestling",
  "Try to pet a wild bear",
  "Swim with sharks while bleeding",
  "Eat mysterious mushrooms",
  "Sleep in a haunted cemetery",
  "Juggle flaming torches blindfolded",
  "Use a cursed sword as a toothpick",
  "Tickle a sleeping giant",
  "Dance on thin ice",
  "Hug a cactus enthusiastically",
  "Take a nap in quicksand",
  "Play catch with a grenade",
  "Use a lightning rod during a storm",
  "Tell a vampire they have bad breath",
  "Ask a kraken for directions",
  "Wear meat clothing to a wolf den",
  "Try to ride a wild griffin",
  "Drink from the fountain of eternal poison",
  "Challenge death to a game of chess",
  "Use your head to test helmet durability",
  "Go cave diving without oxygen",
  "Practice sword swallowing with a real sword",
  "Take a selfie with a basilisk",
  "Use a nuclear reactor as a nightlight",
  "Go bungee jumping with a rope that's too long",
  "Try to milk a wild minotaur"
];

// Function to get a random death message
export function getRandomDeathMessage() {
  return DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
}
