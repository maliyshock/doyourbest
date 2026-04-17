import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export type WordsState = {
  scoresByKey: Record<string, number>
  currentBlockWordIdsByDirection: Record<string, string[]>
}

const initialState: WordsState = {
  scoresByKey: {},
  currentBlockWordIdsByDirection: {},
}

function clampScore(value: number) {
  return Math.max(-3, Math.min(3, value))
}

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    setWordScore: (
      state,
      action: PayloadAction<{ key: string; value: number }>,
    ) => {
      state.scoresByKey[action.payload.key] = clampScore(action.payload.value)
    },
    increaseWordScore: (state, action: PayloadAction<string>) => {
      const currentValue = state.scoresByKey[action.payload] ?? 0
      state.scoresByKey[action.payload] = clampScore(currentValue + 1)
    },
    decreaseWordScore: (state, action: PayloadAction<string>) => {
      const currentValue = state.scoresByKey[action.payload] ?? 0
      state.scoresByKey[action.payload] = clampScore(currentValue - 1)
    },
    setCurrentBlockWordIds: (
      state,
      action: PayloadAction<{ directionKey: string; wordIds: string[] }>,
    ) => {
      state.currentBlockWordIdsByDirection[action.payload.directionKey] = action.payload.wordIds
    },
  },
})

export const { setWordScore, increaseWordScore, decreaseWordScore, setCurrentBlockWordIds } =
  wordsSlice.actions

export const selectWordsState = (state: RootState) => state.words
export const selectScoresByKey = (state: RootState) => state.words.scoresByKey
export const selectCurrentBlockWordIds = (state: RootState, directionKey: string) =>
  state.words.currentBlockWordIdsByDirection[directionKey] ?? []

export default wordsSlice.reducer
