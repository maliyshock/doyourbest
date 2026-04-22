import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import {
  COMPLETED_SUCCESS_COUNT,
  LEARNED_SCORE,
  REPEAT_SCORE_AFTER_DECAY,
  shouldDecayLearnedWord,
} from '@/utils/wordProgress'

export type WordProgressStatus = 'learning' | 'completed'

export type WordProgress = {
  score: number
  successCount: number
  successDateDay: string | null
  status: WordProgressStatus
}

export type WordsState = {
  progressByKey: Record<string, WordProgress>
  activeLearnedKeys: Record<string, true>
  currentBlockWordIdsByDirection: Record<string, string[]>
}

const DEFAULT_WORD_PROGRESS: WordProgress = {
  score: 0,
  successCount: 0,
  successDateDay: null,
  status: 'learning',
}

const initialState: WordsState = {
  progressByKey: {},
  activeLearnedKeys: {},
  currentBlockWordIdsByDirection: {},
}

function clampScore(value: number) {
  return Math.max(-3, Math.min(3, value))
}

function getWordProgress(state: WordsState, key: string) {
  const currentProgress = state.progressByKey[key]

  if (currentProgress !== undefined) {
    return currentProgress
  }

  const nextProgress = { ...DEFAULT_WORD_PROGRESS }
  state.progressByKey[key] = nextProgress

  return nextProgress
}

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    increaseWordScore: (
      state,
      action: PayloadAction<{ key: string; currentDayKey: string }>,
    ) => {
      const progress = getWordProgress(state, action.payload.key)

      if (progress.status === 'completed') {
        return
      }

      const previousScore = progress.score
      const nextScore = clampScore(previousScore + 1)
      progress.score = nextScore

      if (previousScore < LEARNED_SCORE && nextScore === LEARNED_SCORE) {
        progress.successCount += 1

        if (progress.successCount >= COMPLETED_SUCCESS_COUNT) {
          progress.status = 'completed'
          progress.successDateDay = null
          delete state.activeLearnedKeys[action.payload.key]
          return
        }

        progress.successDateDay = action.payload.currentDayKey
        state.activeLearnedKeys[action.payload.key] = true
      }
    },
    decreaseWordScore: (state, action: PayloadAction<string>) => {
      const progress = getWordProgress(state, action.payload)

      if (progress.status === 'completed') {
        return
      }

      const previousScore = progress.score
      const nextScore = clampScore(previousScore - 1)
      progress.score = nextScore

      if (previousScore === LEARNED_SCORE && nextScore < LEARNED_SCORE) {
        progress.successDateDay = null
        delete state.activeLearnedKeys[action.payload]
      }
    },
    decayExpiredLearnedWords: (
      state,
      action: PayloadAction<{ currentDayKey: string }>,
    ) => {
      for (const key of Object.keys(state.activeLearnedKeys)) {
        const progress = state.progressByKey[key]

        if (progress === undefined || progress.status === 'completed') {
          delete state.activeLearnedKeys[key]
          continue
        }

        if (progress.score !== LEARNED_SCORE || progress.successDateDay === null) {
          delete state.activeLearnedKeys[key]
          continue
        }

        if (!shouldDecayLearnedWord(progress.successDateDay, action.payload.currentDayKey)) {
          continue
        }

        progress.score = REPEAT_SCORE_AFTER_DECAY
        progress.successDateDay = null
        delete state.activeLearnedKeys[key]
      }
    },
    setCurrentBlockWordIds: (
      state,
      action: PayloadAction<{ directionKey: string; wordIds: string[] }>,
    ) => {
      state.currentBlockWordIdsByDirection[action.payload.directionKey] = action.payload.wordIds
    },
  },
})

export const {
  increaseWordScore,
  decreaseWordScore,
  decayExpiredLearnedWords,
  setCurrentBlockWordIds,
} = wordsSlice.actions

export const selectWordsState = (state: RootState) => state.words
export const selectProgressByKey = (state: RootState) => state.words.progressByKey
export const selectCurrentBlockWordIds = (state: RootState, directionKey: string) =>
  state.words.currentBlockWordIdsByDirection[directionKey] ?? []

export default wordsSlice.reducer
