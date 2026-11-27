import { activeActivityDefinitions, activityDefinitions, archivedActivityIds } from './contentPackData.js'
import { createConnectionGameEntry } from './connectionGameRegistry.jsx'
import { createSealedActivityEntry } from './sealedActivityRegistry.jsx'
import { createWaveTwoGameEntry } from './waveTwoGameRegistry.jsx'
import { createWaveThreeGameEntry } from './waveThreeGameRegistry.jsx'
import { createWaveFourGameEntry } from './waveFourGameRegistry.jsx'
import { pickActivityPrompt } from './expandedPromptData.js'
import { getActivityChoiceConfig, getChoiceLabel } from './activityChoiceData.js'
import { ActivityCardModal } from '../../components/ActivityCardModal.jsx'

function buildOpenAt(definition) {
  if (definition.id !== 'postcard-next-year') {
    return null
  }

  const openAt = new Date()
  openAt.setFullYear(openAt.getFullYear() + 1)
  return openAt.toISOString()
}

function createRegistryEntry(definition) {
  return {
    ...definition,
    supportsPrivateFlow: true,
    createInitialState(_players, { activePlayerIndex = 0, random = Math.random, history = [] } = {}) {
      const { mode, options } = getActivityChoiceConfig(definition)
      return {
        activityId: definition.id,
        answerId: null,
        answererIndex: activePlayerIndex,
        answers: {},
        options,
        prompt: pickActivityPrompt(definition, random, history),
        predictionId: null,
        responseMode: mode,
        turnIndex: activePlayerIndex,
      }
    },
    advance(state, { input, playerIndex }) {
      const choiceId = input?.choiceId
      const { mode, options } = getActivityChoiceConfig(definition)
      const activeOptions = state.options || options
      const responseMode = state.responseMode || mode
      if (!activeOptions.some(option => option.id === choiceId)) return { completed: false, state }
      if (responseMode === 'match') {
        if (state.answers?.[String(playerIndex)] || state.turnIndex !== playerIndex) return { completed: false, state }
        const answers = { ...state.answers, [String(playerIndex)]: choiceId }
        const completed = Object.keys(answers).length === 2
        return { completed, state: { ...state, answers, options: activeOptions, responseMode, turnIndex: completed ? -1 : 1 - playerIndex } }
      }
      if (state.turnIndex !== playerIndex) return { completed: false, state }
      if (playerIndex === state.answererIndex) {
        if (state.answerId) return { completed: false, state }
        return { completed: false, state: { ...state, answerId: choiceId, options: activeOptions, responseMode, turnIndex: 1 - playerIndex } }
      }
      if (!state.answerId || state.predictionId) return { completed: false, state }
      const predictionId = choiceId
      const predictionCorrect = predictionId === state.answerId
      const answers = { ...state.answers, [String(state.answererIndex)]: state.answerId, [String(playerIndex)]: predictionId }
      return {
        completed: true,
        state: {
          ...state,
          answers,
          options: activeOptions,
          responseMode,
          predictionCorrect,
          predictionId,
          turnIndex: -1,
        },
      }
    },
    render(props) {
      return <ActivityCardModal {...props} definition={definition} />
    },
    resolve(state, players) {
      const openAt = buildOpenAt(definition)
      const answererIndex = state.answererIndex ?? 0
      const predictorIndex = 1 - answererIndex
      const { mode, options } = getActivityChoiceConfig(definition)
      const activeOptions = state.options || options
      const responseMode = state.responseMode || mode
      const matched = responseMode === 'match' && Boolean(state.answers?.['0']) && Boolean(state.answers?.['1']) && state.answers['0'] === state.answers['1']
      const predictionCorrect = responseMode !== 'match' && Boolean(state.predictionId) && Boolean(state.answerId) && state.predictionId === state.answerId
      const answers = responseMode === 'match'
        ? state.answers || {}
        : { [String(answererIndex)]: state.answerId, [String(predictorIndex)]: state.predictionId }
      const responseLines = Object.entries(answers).map(([index, id]) => `${players[Number(index)]?.displayName || `Player ${Number(index) + 1}`}: ${getChoiceLabel(activeOptions, id)}`)
      const outcome = responseMode === 'match'
        ? matched ? 'They chose the same answer.' : 'They chose different answers.'
        : predictionCorrect ? `${players[predictorIndex]?.displayName || 'Your partner'} predicted correctly.` : `${players[predictorIndex]?.displayName || 'Your partner'} made a different guess.`
      return {
        heartBonus: 2 + (definition.intensity || 1) + (predictionCorrect || matched ? 2 : 0),
        label: definition.label,
        payload: {
          answererIndex,
          answers,
          imageDataUrl: null,
          matched,
          openAt,
          options: activeOptions,
          predictionCorrect,
          prompt: state.prompt,
          responseMode,
        },
        openAt,
        savesToJournal: definition.savesToJournal,
        summary: `${outcome} +${2 + definition.intensity + (predictionCorrect || matched ? 2 : 0)} shared hearts.`,
        text: `${state.prompt || definition.description}\n${responseLines.join('\n')}\n${outcome}`,
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export const activityRegistry = Object.fromEntries(
  activityDefinitions.map((definition) => [
    definition.id,
    createSealedActivityEntry(definition) ||
      createConnectionGameEntry(definition) ||
      createWaveTwoGameEntry(definition) ||
      createWaveThreeGameEntry(definition) ||
      createWaveFourGameEntry(definition) ||
      createRegistryEntry(definition),
  ]),
)

export const activityIds = Object.keys(activityRegistry)
export const activeActivityIds = activeActivityDefinitions.map((definition) => definition.id)
export { archivedActivityIds }

export function pickRandomActivityId(random = Math.random) {
  return activeActivityIds[Math.floor(random() * activeActivityIds.length)]
}
