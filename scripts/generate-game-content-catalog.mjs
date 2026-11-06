import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sections = [
  {
    title: 'Activities and duels',
    source: 'src/features/session/contentPackData.js',
    values: await import('../src/features/session/contentPackData.js'),
    exports: ['activityDefinitions', 'duelDefinitions'],
  },
  {
    title: 'Night questions and vault prompts',
    source: 'src/features/session/nightQuestionBank.js',
    values: await import('../src/features/session/nightQuestionBank.js'),
    exports: ['NIGHT_CHOICE_QUESTIONS', 'EXTRA_VAULT_PROMPTS'],
  },
  {
    title: 'Connection games',
    source: 'src/features/session/connectionGameData.js',
    values: await import('../src/features/session/connectionGameData.js'),
    exports: ['MIND_MELD_PROMPTS', 'PREDICTION_BOX_PROMPTS', 'VAULT_PROMPTS'],
  },
  {
    title: 'Sealed activities',
    source: 'src/features/session/sealedActivityData.js',
    values: await import('../src/features/session/sealedActivityData.js'),
    exports: ['MIND_MELD_PROMPTS', 'MUTUAL_YES_PROMPTS', 'SEALED_ACTIVITY_DEFINITIONS'],
  },
  {
    title: 'Wave two prompts and puzzles',
    source: 'src/features/session/waveTwoGameData.js',
    values: await import('../src/features/session/waveTwoGameData.js'),
    exports: ['VIBE_CHECK_PROMPTS', 'TEMPO_TAP_ROUNDS', 'WORD_WEAVER_PUZZLES', 'WAVE_TWO_ACTIVITY_DEFINITIONS'],
  },
  {
    title: 'Wave three prompts and layouts',
    source: 'src/features/session/waveThreeGameData.js',
    values: await import('../src/features/session/waveThreeGameData.js'),
    exports: ['DUAL_AXIS_MAZES', 'BLIND_CANVAS_PROMPTS', 'HARMONIC_LOCK_ROUNDS', 'WAVE_THREE_ACTIVITY_DEFINITIONS'],
  },
  {
    title: 'Wave four prompts',
    source: 'src/features/session/waveFourGameData.js',
    values: await import('../src/features/session/waveFourGameData.js'),
    exports: ['BLUFF_BIDDING_TOPICS', 'PHOTO_FLASHBACK_PROMPTS', 'WAVE_FOUR_ACTIVITY_DEFINITIONS'],
  },
  {
    title: 'Expanded and themed prompt pools',
    source: 'src/features/session/moreNightPrompts.js',
    values: await import('../src/features/session/moreNightPrompts.js'),
    exports: ['MORE_NIGHT_PROMPTS', 'EXTRA_CANVAS_PROMPTS', 'EXTRA_PHOTO_PROMPTS', 'EXTRA_BLUFF_TOPICS'],
  },
  {
    title: 'Authored activity prompt variations',
    source: 'src/features/session/activityPromptExpansion.js',
    values: await import('../src/features/session/activityPromptExpansion.js'),
    exports: ['ACTIVITY_PROMPT_EXPANSION'],
  },
  {
    title: 'Original and expanded activity prompts',
    source: 'src/features/session/expandedPromptData.js',
    values: await import('../src/features/session/expandedPromptData.js'),
    exports: ['ACTIVITY_PROMPT_VARIANTS'],
  },
  {
    title: 'Wavelength duel',
    source: 'src/features/session/wavelengthDuelData.js',
    values: await import('../src/features/session/wavelengthDuelData.js'),
    exports: ['WAVELENGTH_PROMPT_COUNT', 'WAVELENGTH_MATCHES_TOTAL', 'WAVELENGTH_PROMPTS', 'WAVELENGTH_DUEL_DEFINITION'],
  },
  {
    title: 'Letterpress shared sentence starters',
    source: 'src/features/session/letterpressData.js',
    values: await import('../src/features/session/letterpressData.js'),
    exports: ['LETTERPRESS_PROMPTS'],
  },
  {
    title: 'Board spaces and keepsakes',
    source: 'src/features/session/boardConfig.js',
    values: await import('../src/features/session/boardConfig.js'),
    exports: ['BASE_DUEL_HEART_BONUS', 'KEEPSAKES', 'BOARD_SPACES'],
  },
  {
    title: 'Night setup and vibe choices',
    source: 'src/features/session/sessionPresets.js and sessionLogic.js',
    values: {
      ...await import('../src/features/session/sessionPresets.js'),
      ...await import('../src/features/session/sessionLogic.js'),
    },
    exports: ['SESSION_PRESETS', 'DEFAULT_SESSION_PRESET', 'SESSION_PRESET_OPTIONS', 'MOOD_OPTIONS'],
  },
  {
    title: 'Board themes and scene decorations',
    source: 'src/board/boardThemes.js',
    values: await import('../src/board/boardThemes.js'),
    exports: ['BOARD_THEME_SETS'],
  },
  {
    title: 'Player pieces and visual styles',
    source: 'src/features/couple/playerAvatar.js',
    values: await import('../src/features/couple/playerAvatar.js'),
    exports: ['PLAYER_PIECE_CATEGORIES', 'PLAYER_PIECES', 'PLAYER_THEMES'],
  },
  {
    title: 'Portrait frames',
    source: 'src/features/couple/portraitFrames.js',
    values: await import('../src/features/couple/portraitFrames.js'),
    exports: ['PORTRAIT_FRAMES'],
  },
  {
    title: 'Pinky Swear promise draw deck and progression',
    source: 'src/features/couple/progressService.js',
    values: await import('../src/features/couple/progressService.js'),
    exports: ['KOUPON_DECK', 'BASE_THEME_CARDS', 'UNLOCKABLE_THEMES', 'TROPHIES', 'COMPANION_STAGES', 'FLOWER_STAGES', 'MILESTONE_NIGHTS'],
  },
  {
    title: 'Our Bloom flower collection',
    source: 'src/flower/flowerSpecies.js',
    values: await import('../src/flower/flowerSpecies.js'),
    exports: ['FLOWER_SPECIES', 'FLOWER_DAYS_TO_BLOOM'],
  },
]

function countEntries(value) {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  return null
}

function formatValue(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``
}

const lines = [
  '# At Long Last — Game Content Catalog',
  '',
  `Generated from the current game data on ${new Date().toISOString().slice(0, 10)}.`,
  '',
  'This is the complete catalog of authored, data-driven game content and player-facing choice pools: prompts, drawing ideas, Pinky Swear promises, activities, duels, board themes, keepsakes, progression rewards, and visual selections. It includes the stable IDs and the stored copy/options so each entry can be traced back to its source.',
  '',
  'It does not list transient runtime variables (such as a player’s current position), account data, or freeform answers entered by players. Those values are created or supplied while the game runs and are not a finite authored catalog.',
  '',
  'Regenerate after changing these data tables with `node scripts/generate-game-content-catalog.mjs`.',
  '',
  '## Contents',
]

sections.forEach((section, sectionIndex) => {
  lines.push(`${sectionIndex + 1}. [${section.title}](#${section.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replaceAll(' ', '-')})`)
})

for (const section of sections) {
  lines.push('', `## ${section.title}`, '', `Source: \`${section.source}\`.`, '')
  for (const name of section.exports) {
    const value = section.values[name]
    if (value === undefined) throw new Error(`Missing export ${name} from ${section.source}`)
    const count = countEntries(value)
    lines.push(`### \`${name}\`${count === null ? '' : ` (${count} entries)`}`, '', formatValue(value), '')
  }
}

const destination = path.join(root, 'docs', 'GAME_CONTENT_CATALOG.md')
await fs.mkdir(path.dirname(destination), { recursive: true })
while (lines.at(-1) === '') lines.pop()
await fs.writeFile(destination, `${lines.join('\n')}\n`)
console.log(`Wrote ${destination}`)
