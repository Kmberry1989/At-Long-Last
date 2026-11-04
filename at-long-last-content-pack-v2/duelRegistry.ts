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
  prompts?: string[];
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
    name: 'Star Map',
    tagline: 'Rank what matters most',
    durationSec: 45,
    players: 2,
    mechanics: 'Each player privately ranks five sentimental values, then both rankings compare in the night reveal.',
    howToPlay: [
      'Choose five meaningful values in importance order',
      'Submit privately while your partner plays independently',
      'Compare both rankings in tonight’s reveal'
    ],
    firebaseEvents: ['duel:rankingSubmitted', 'duel:reveal'],
    boardReward: 'Shared hearts for completing the comparison',
    assetsNeeded: ['ranked value cards'],
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
    tagline: 'Weave a sentence together',
    durationSec: 45,
    players: 2,
    mechanics: 'Each player privately adds four words to the same starter; the reveal weaves their words together in alternating order.',
    howToPlay: [
      'Read a shared sentence starter',
      'Add four words on your own',
      'Read your woven sentence in tonight’s reveal'
    ],
    firebaseEvents: ['duel:wordsSubmitted', 'duel:sentenceReveal'],
    boardReward: 'Shared hearts and a sentence in the scrapbook',
    assetsNeeded: ['four-word input', 'woven sentence reveal'],
    skippable: true
  },
  {
    id: 'sync-breath',
    vibe: 'tender',
    intensity: 1,
    name: 'Quiet Moment',
    tagline: 'Choose a quiet reset',
    durationSec: 30,
    players: 2,
    mechanics: 'Choose a short breathing, grounding, or muscle-release pause.',
    howToPlay: [
      'Choose a quiet reset',
      'Follow three easy breaths',
      'Or notice what is around you',
      'Or soften your jaw, shoulders, and hands'
    ],
    firebaseEvents: ['duel:breathPhase'],
    boardReward: 'Calm board effect for rest of session',
    assetsNeeded: ['breathing orb animation'],
    skippable: true
  },
  {
    id: 'gratitude-duel',
    vibe: 'tender',
    intensity: 1,
    name: 'Gratitude Duel',
    tagline: 'A small thing I appreciate',
    durationSec: 45,
    players: 2,
    mechanics: 'Both privately answer one shared appreciation prompt; both responses open in the night reveal.',
    howToPlay: [
      'Read one shared appreciation prompt',
      'Write a small, specific response',
      'Read both responses in tonight’s reveal'
    ],
    prompts: [
      'A little thing you did that made today easier',
      'A way you make home feel warmer',
      'A time you made me laugh when I needed it',
      'Something thoughtful you do without being asked',
      'A quality I admire in you',
      'A way you show up when life gets busy',
      'A small ritual I look forward to with you',
      'A memory of us that still makes me smile',
      'A way you make ordinary plans feel special',
      'Something you helped me learn about myself',
      'A moment you made me feel understood',
      'A way you care for the people around you',
      'A little comfort you bring to a hard day',
      'Something about your humor I love',
      'A brave thing I have watched you do',
      'A detail you remember that means a lot to me',
      'A way we make a good team',
      'Something I appreciate about how you listen',
      'A kindness you showed me recently',
      'Something about our life together I feel lucky to have',
      'A way you make me feel welcome',
      'A strength you bring to our relationship',
      'A small adventure I loved sharing with you',
      'Something you do that feels unmistakably like you',
    ],
    firebaseEvents: ['duel:thanksAdded'],
    boardReward: 'Shared hearts and both notes in the scrapbook',
    assetsNeeded: ['shared prompt card', 'private response field'],
    skippable: true
  },

  // PLAYFUL DUELS
  {
    id: 'doodle-duel-memory',
    vibe: 'playful',
    intensity: 1,
    name: 'Keepsake Sketch',
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
    mechanics: 'Each player privately sends three simple direction cues, then draws their partner using the cues received.',
    howToPlay: [
      'Choose three drawing cues for your partner',
      'Draw from the three cues your partner sends',
      'Compare both portraits in tonight’s reveal'
    ],
    firebaseEvents: ['duel:guidanceSubmitted', 'duel:drawingComplete'],
    boardReward: 'Both portraits become board decorations',
    assetsNeeded: ['direction cue cards', 'drawing canvas'],
    skippable: true
  },
  {
    id: 'wavelength-slider',
    vibe: 'playful',
    intensity: 1,
    name: 'Wavelength Slider (Archived)',
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
    name: 'Heartflash',
    tagline: 'One flash. One quick tap.',
    durationSec: 30,
    players: 2,
    mechanics: 'A heart or spark flashes after a short wait. Tap the matching symbol as quickly as you can.',
    howToPlay: [
      'Wait for the flash, then tap the matching symbol.',
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
    mechanics: 'Legacy voice-note idea folded into the Kiss Courier recording prompt.',
    howToPlay: [
      'This standalone game is archived',
      'Its movie-trailer voice prompt now accompanies the Kiss Courier note'
    ],
    firebaseEvents: ['kiss:voicePrompt'],
    boardReward: 'Voice note stays with the sent kiss',
    assetsNeeded: ['device microphone recording'],
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
    mechanics: 'Legacy standalone check-in; its closeness prompt is now part of Wavelength.',
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
    mechanics: 'Legacy portrait prompt mode merged into Keepsake Sketch.',
    howToPlay: [
      'This standalone game is archived',
      'Partner portrait prompts now appear in Keepsake Sketch'
    ],
    firebaseEvents: ['duel:slowStroke', 'duel:complete'],
    boardReward: 'Art becomes permanent frame on home tile',
    assetsNeeded: ['drawing canvas', 'soft brush'],
    skippable: true
  }
];
