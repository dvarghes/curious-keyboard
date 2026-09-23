/**
 * Campaign ladder. Fall time is seconds from spawn to ground.
 * Pixel speed is playfield height / fallSeconds so screens match.
 * Semicolon is taught in the tutorial and is not used in these words.
 */

export const LEVELS = [
  {
    id: 1,
    name: 'Home Row Hop',
    minLen: 2,
    maxLen: 4,
    fallSeconds: 7,
    maxInFlight: 2,
    waveSize: 12,
    spawnIntervalMs: 1800,
    targetWpm: 8,
    words: ['as', 'ad', 'add', 'sad', 'fad', 'lad', 'all', 'fall', 'dad', 'ask', 'lass'],
  },
  {
    id: 2,
    name: 'First Reaches',
    minLen: 3,
    maxLen: 4,
    fallSeconds: 6.5,
    maxInFlight: 2,
    waveSize: 14,
    spawnIntervalMs: 1650,
    targetWpm: 12,
    words: ['cat', 'dog', 'run', 'sit', 'red', 'big', 'jump', 'sun', 'hop', 'play', 'mom', 'hat', 'bus', 'top', 'cup', 'map'],
  },
  {
    id: 3,
    name: 'Sight Words',
    minLen: 3,
    maxLen: 5,
    fallSeconds: 6,
    maxInFlight: 3,
    waveSize: 16,
    spawnIntervalMs: 1500,
    targetWpm: 15,
    words: ['the', 'and', 'you', 'can', 'see', 'look', 'come', 'play', 'said', 'they', 'with', 'for', 'this', 'that', 'have', 'down', 'help', 'find', 'make', 'here', 'blue', 'good', 'want', 'from', 'where', 'went', 'your', 'what'],
  },
  {
    id: 4,
    name: 'Longer Steps',
    minLen: 4,
    maxLen: 6,
    fallSeconds: 5.5,
    maxInFlight: 3,
    waveSize: 16,
    spawnIntervalMs: 1350,
    targetWpm: 18,
    words: ['jump', 'play', 'green', 'house', 'water', 'plant', 'apple', 'happy', 'river', 'music', 'tiger', 'puppy', 'candy', 'story', 'train', 'cloud', 'beach', 'robot', 'garden', 'friend', 'snack', 'horse', 'truck', 'tree', 'book', 'frog', 'bird', 'fish', 'moon', 'star', 'farm'],
  },
  {
    id: 5,
    name: 'Pick Up Speed',
    minLen: 5,
    maxLen: 7,
    fallSeconds: 5,
    maxInFlight: 3,
    waveSize: 18,
    spawnIntervalMs: 1200,
    targetWpm: 22,
    words: ['puppy', 'water', 'power', 'world', 'place', 'window', 'purple', 'winter', 'pencil', 'whale', 'planet', 'sweet', 'paint', 'party', 'flower', 'wizard', 'popcorn', 'weather', 'pumpkin', 'rainbow', 'spider', 'prince', 'picnic', 'wallet', 'pocket'],
  },
  {
    id: 6,
    name: 'Rain Band',
    minLen: 5,
    maxLen: 8,
    fallSeconds: 4.5,
    maxInFlight: 4,
    waveSize: 18,
    spawnIntervalMs: 1050,
    targetWpm: 26,
    words: ['please', 'friend', 'school', 'bright', 'morning', 'garden', 'animal', 'because', 'another', 'picture', 'family', 'summer', 'yellow', 'orange', 'cookie', 'button', 'market', 'banana', 'monkey', 'turtle', 'rabbit', 'kitten', 'teacher', 'library', 'blanket', 'sandwich', 'backpack', 'birthday', 'sunlight', 'snowman'],
  },
  {
    id: 7,
    name: 'Storm',
    minLen: 6,
    maxLen: 9,
    fallSeconds: 4,
    maxInFlight: 4,
    waveSize: 20,
    spawnIntervalMs: 900,
    targetWpm: 30,
    words: ['morning', 'picture', 'because', 'another', 'family', 'mountain', 'rainbow', 'dinosaur', 'birthday', 'elephant', 'adventure', 'together', 'wonderful', 'chocolate', 'celebrate', 'classroom', 'sunflower', 'butterfly', 'pineapple', 'vacation', 'treasure', 'princess', 'airplane', 'sandwich', 'backpack', 'hamburger'],
  },
  {
    id: 8,
    name: 'Expert Sky',
    minLen: 7,
    maxLen: 10,
    fallSeconds: 3.5,
    maxInFlight: 4,
    waveSize: 20,
    spawnIntervalMs: 750,
    targetWpm: 35,
    words: ['adventure', 'beautiful', 'butterfly', 'dinosaur', 'elephant', 'mountain', 'together', 'wonderful', 'chocolate', 'important', 'celebrate', 'discovery', 'friendship', 'classroom', 'playground', 'sunflower', 'waterfall', 'pineapple', 'hamburger', 'astronaut', 'telescope', 'basketball', 'skateboard', 'umbrella', 'kangaroo', 'alligator', 'crocodile', 'snowflake', 'campfire', 'starfish', 'seashell', 'dragonfly', 'peppermint', 'watermelon'],
  },
];

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) || null;
}

export const HOME_PROMPTS = ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', 'f', 'j', ' ', 'd'];

export const REACH_PROMPTS = ['e', 'i', 'r', 'u', 'f', 'g', 'h', 'c', 'n', 'j', 'e', 'd', 'i', 'r', 'u', 'k'];

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
