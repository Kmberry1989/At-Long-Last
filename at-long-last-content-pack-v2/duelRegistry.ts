/**
 * At Long Last - Duel Registry
 * Drop this into src/features/session/duelRegistry.ts
 * 15 microgames across tender / playful / spicy
 * Each designed for 30-90 sec, remote-friendly, no complex physics
 */

export type Vibe = 'tender' | 'playful' | 'spicy';

export interface Duel {
  id: string;
  vibe: Vibe;
  intensity: 1 | 2 | 3;
  name: string;
  tagline: string;
  durationSec: number;
  players: 2;
  mechanics: string;
  howToPlay: string[];
  firebaseEvents: string[]; // what to sync
  boardReward: string;
  assetsNeeded: string[];
  skippable: boolean;
}

export const DUELS: Duel[] = [
  // TENDER DUELS
  {
    id: 'constellation-home',
    vibe: 'tender',
    intensity: 1,
    name: 'Constellation',
    tagline: 'Where is home?',
    durationSec: 60,
    players: 2,
    mechanics: 'Both place 5 dots where home feels. Overlap creates a star.',
    howToPlay: [
      'Blank sky appears',
      'Each taps 5 places that feel like home',
      'Reveal together, overlapping dots become bright stars',
      'Star stays on your board as permanent tile'
    ],
    firebaseEvents: ['duel:dotPlaced', 'duel:reveal'],
    boardReward: 'New permanent star tile on board',
    assetsNeeded: ['canvas', 'particle:star'],
    skippable: true
  },
  {
    id: 'heartbeat-hold-tender',
    vibe: 'tender',
    intensity: 1,
    name: 'Heartbeat Hold',
    tagline: 'Stay with me',
    durationSec: 45,
    players: 2,
    mechanics: 'Both hold button, board pulses. Release ends it. Sync bonus.',
    howToPlay: [
      'Hold when ready',
      'Board pulses with combined rhythm',
      'Let go whenever you want, game ends when one lets go',
      'No winner, just how long you stayed'
    ],
    firebaseEvents: ['duel:holdStart', 'duel:holdEnd', 'duel:pulse'],
    boardReward: 'Both move forward 2 if you beat your record',
    assetsNeeded: ['haptics', 'pulse animation'],
    skippable: true
  },
  {
    id: 'letterpress-one-word',
    vibe: 'tender',
    intensity: 2,
    name: 'Letterpress',
    tagline: 'One word at a time',
    durationSec: 90,
    players: 2,
    mechanics: 'Co-type one sentence alternating words. Cant see next word coming.',
    howToPlay: [
      'Prompt: "What I love about us is..."',
      'Player A types word 1, Player B word 2, etc',
      'No deleting',
      'Read final sentence aloud'
    ],
    firebaseEvents: ['duel:wordAdded', 'duel:sentenceComplete'],
    boardReward: 'Saves to journalEntries',
    assetsNeeded: ['text input', 'typewriter effect'],
    skippable: true
  },
  {
    id: 'sync-breath',
    vibe: 'tender',
    intensity: 1,
    name: 'Sync Breath',
    tagline: 'Breathe with me',
    durationSec: 60,
    players: 2,
    mechanics: 'Circle expands/contracts. Tap to inhale/exhale together.',
    howToPlay: [
      'Circle grows = inhale',
      'Circle shrinks = exhale',
      'Try to stay in sync 4 breaths',
      'Board glows if synced'
    ],
    firebaseEvents: ['duel:breathPhase'],
    boardReward: 'Calm board effect for rest of session',
    assetsNeeded: ['breathing circle animation'],
    skippable: true
  },
  {
    id: 'gratitude-duel',
    vibe: 'tender',
    intensity: 1,
    name: 'Gratitude Duel',
    tagline: 'Thank you war',
    durationSec: 60,
    players: 2,
    mechanics: 'Rapid fire thank yous, cannot repeat.',
    howToPlay: [
      '30 seconds each, alternating',
      'Thank your partner for something specific',
      'No repeats, no "thanks for being you" generic',
      'Most specific list wins but both save to journal'
    ],
    firebaseEvents: ['duel:thanksAdded'],
    boardReward: 'Both get 1 gratitude leaf on home tile',
    assetsNeeded: ['timer', 'list UI'],
    skippable: true
  },

  // PLAYFUL DUELS
  {
    id: 'doodle-duel-memory',
    vibe: 'playful',
    intensity: 1,
    name: 'Doodle Duel',
    tagline: 'Draw it bad',
    durationSec: 60,
    players: 2,
    mechanics: 'Same prompt, 60 sec draw, reveal simultaneously.',
    howToPlay: [
      'Prompt appears: "draw our couch from memory"',
      '60 sec, thick brush, no eraser - more time to add details',
      'Auto-reveal at same time',
      'Vote: which is more accurate / more cursed'
    ],
    firebaseEvents: ['duel:drawingStroke', 'duel:drawingComplete', 'duel:vote'],
    boardReward: 'Winner moves 3, loser moves 2 but gets funny sticker',
    assetsNeeded: ['drawing canvas', 'brush'],
    skippable: true
  },
  {
    id: 'portrait-panic-directed',
    vibe: 'playful',
    intensity: 2,
    name: 'Portrait Panic',
    tagline: 'You draw, I direct',
    durationSec: 60,
    players: 2,
    mechanics: 'One draws partner but brush is controlled by partner voice directions.',
    howToPlay: [
      'Player A draws Player B',
      'Player B can only say "left, right, bigger, smaller"',
      '30 sec then swap',
      'Compare masterpieces'
    ],
    firebaseEvents: ['duel:stroke', 'duel:voiceState'],
    boardReward: 'Both portraits become board decorations',
    assetsNeeded: ['shared canvas', 'voice'],
    skippable: true
  },
  {
    id: 'wavelength-slider',
    vibe: 'playful',
    intensity: 1,
    name: 'Wavelength',
    tagline: 'How well do you know my brain?',
    durationSec: 60,
    players: 2,
    mechanics: 'Hidden slider guess closeness game.',
    howToPlay: [
      'Prompt: "How chaotic was your day?" or "How much do you want pizza right now?"',
      'Both place marker on slider secretly',
      'Reveal distance',
      'Closer = more points'
    ],
    firebaseEvents: ['duel:sliderPlaced', 'duel:reveal'],
    boardReward: 'Perfect match = warp forward 4',
    assetsNeeded: ['slider UI'],
    skippable: true
  },
  {
    id: 'emoji-court',
    vibe: 'playful',
    intensity: 1,
    name: 'Emoji Court',
    tagline: 'You are on trial',
    durationSec: 90,
    players: 2,
    mechanics: 'Silly trial, prosecution only emoji, defense only words.',
    howToPlay: [
      'Accusation: "You stole the blankets"',
      'Player A prosecutes with 5 emoji only',
      'Player B defends in 10 words',
      'Judge (board) decides: guilty of being cute'
    ],
    firebaseEvents: ['duel:emojiSet', 'duel:defense'],
    boardReward: 'Loser does a dare from winner',
    assetsNeeded: ['emoji picker'],
    skippable: true
  },
  {
    id: 'reaction-heart',
    vibe: 'playful',
    intensity: 1,
    name: 'Reaction Heart',
    tagline: 'Fastest love wins',
    durationSec: 30,
    players: 2,
    mechanics: 'Heart appears random, tap first.',
    howToPlay: [
      'Wait for it...',
      'Heart pops random time 2-8 sec',
      'First tap wins round, best of 3',
      'Loser sends voice compliment'
    ],
    firebaseEvents: ['duel:heartSpawn', 'duel:tap'],
    boardReward: 'Winner moves 2',
    assetsNeeded: ['tap feedback', 'haptics'],
    skippable: true
  },

  // SPICY DUELS - tasteful, romantic
  {
    id: 'kiss-courier',
    vibe: 'spicy',
    intensity: 1,
    name: 'Kiss Courier',
    tagline: 'Catch this',
    durationSec: 30,
    players: 2,
    mechanics: 'Blow kiss becomes particle across Three.js board, partner catches.',
    howToPlay: [
      'Player A blows kiss on camera or tap',
      'Kiss becomes particle stream flying across board',
      'Player B moves piece to catch',
      'Catch = board glows warm'
    ],
    firebaseEvents: ['duel:kissSent', 'duel:kissCaught'],
    boardReward: 'Home tile glows for rest of session',
    assetsNeeded: ['particle system', 'camera optional'],
    skippable: true
  },
  {
    id: 'fever-dream-date',
    vibe: 'spicy',
    intensity: 2,
    name: 'Fever Dream Date',
    tagline: 'Most romantic date wins',
    durationSec: 90,
    players: 2,
    mechanics: 'Both build dream date in 45 sec, then merge.',
    howToPlay: [
      '45 sec to type dream date with no budget',
      'Reveal both',
      'Pick one detail from each to create final date',
      'Save final date to journal'
    ],
    firebaseEvents: ['duel:dateDraft', 'duel:merge'],
    boardReward: 'Date saved to journalEntries with reminder',
    assetsNeeded: ['text area', 'merge UI'],
    skippable: true
  },
  {
    id: 'voice-note-trailer',
    vibe: 'spicy',
    intensity: 2,
    name: 'Trailer Voice',
    tagline: 'Say it like you mean it',
    durationSec: 45,
    players: 2,
    mechanics: 'Loser of last duel sends 7 sec voice note with prompt.',
    howToPlay: [
      'Prompt: "Say one thing you love about me like movie trailer"',
      'Record 7 sec',
      'Other has to guess if you smiled while recording',
      'Both save'
    ],
    firebaseEvents: ['duel:audioRecorded', 'duel:guess'],
    boardReward: 'Audio saved to tile',
    assetsNeeded: ['audio recorder', 'playback'],
    skippable: true
  },
  {
    id: 'temperature-check',
    vibe: 'spicy',
    intensity: 1,
    name: 'Temperature Check',
    tagline: 'How close do you feel?',
    durationSec: 30,
    players: 2,
    mechanics: 'Both privately rate closeness 1-10, closeness bonus.',
    howToPlay: [
      'How close do you feel to me right now 1-10?',
      'Both answer privately',
      'If within 1 point, big reward',
      'If far, gentle tender prompt appears, no shame'
    ],
    firebaseEvents: ['duel:tempRating', 'duel:reveal'],
    boardReward: 'Close = warp 4, Far = unlock tender tile',
    assetsNeeded: ['private slider'],
    skippable: true
  },
  {
    id: 'slow-draw-portrait-romantic',
    vibe: 'spicy',
    intensity: 2,
    name: 'Slow Draw',
    tagline: 'Draw me like you see me',
    durationSec: 75,
    players: 2,
    mechanics: '60 sec to draw partner from memory focusing on favorite detail.',
    howToPlay: [
      'Prompt: "Draw the detail you love most"',
      '60 sec slow draw, thin brush',
      'Reveal and explain why that detail',
      'Both drawings become paired art on board'
    ],
    firebaseEvents: ['duel:slowStroke', 'duel:complete'],
    boardReward: 'Art becomes permanent frame on home tile',
    assetsNeeded: ['drawing canvas', 'soft brush'],
    skippable: true
  }
];
