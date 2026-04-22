import { configureStore } from '@reduxjs/toolkit'

import type {
  WordProgress,
  WordProgressStatus,
  WordsState,
} from '@/features/words/wordsSlice'
import wordsReducer from '@/features/words/wordsSlice'

const WORDS_STORAGE_KEY = 'doyourbest.words'

function clampScore(value: number) {
  return Math.max(-3, Math.min(3, value))
}

function isWordProgressStatus(value: unknown): value is WordProgressStatus {
  return value === 'learning' || value === 'completed'
}

function normalizeWordProgress(value: unknown): WordProgress | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const {
    score,
    successCount,
    successDateDay,
    status,
  } = value as Partial<WordProgress>

  if (
    typeof score !== 'number' ||
    typeof successCount !== 'number' ||
    !isWordProgressStatus(status)
  ) {
    return null
  }

  if (successDateDay !== null && typeof successDateDay !== 'string') {
    return null
  }

  return {
    score: clampScore(score),
    successCount: Math.max(0, Math.floor(successCount)),
    successDateDay,
    status,
  }
}

function normalizeWordsState(value: unknown): WordsState | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const {
    progressByKey,
    activeLearnedKeys,
    currentBlockWordIdsByDirection,
  } = value as {
    progressByKey?: unknown
    activeLearnedKeys?: unknown
    currentBlockWordIdsByDirection?: unknown
  }

  if (typeof progressByKey !== 'object' || progressByKey === null) {
    return undefined
  }

  const normalizedProgressByKey = Object.fromEntries(
    Object.entries(progressByKey).flatMap(([key, progress]) => {
      const normalizedProgress = normalizeWordProgress(progress)

      if (normalizedProgress === null) {
        return []
      }

      return [[key, normalizedProgress] as const]
    })
  )

  const normalizedActiveLearnedKeys =
    typeof activeLearnedKeys === 'object' && activeLearnedKeys !== null
      ? Object.fromEntries(
          Object.entries(activeLearnedKeys).flatMap(([key, isActive]) => {
            if (isActive !== true || normalizedProgressByKey[key] === undefined) {
              return []
            }

            return [[key, true] as const]
          })
        )
      : {}

  const normalizedCurrentBlocks =
    typeof currentBlockWordIdsByDirection === 'object' &&
    currentBlockWordIdsByDirection !== null
      ? Object.fromEntries(
          Object.entries(currentBlockWordIdsByDirection).flatMap(
            ([directionKey, wordIds]) => {
              if (
                !Array.isArray(wordIds) ||
                wordIds.some((wordId) => typeof wordId !== 'string')
              ) {
                return []
              }

              return [[directionKey, wordIds] as const]
            }
          )
        )
      : {}

  return {
    progressByKey: normalizedProgressByKey,
    activeLearnedKeys: normalizedActiveLearnedKeys,
    currentBlockWordIdsByDirection: normalizedCurrentBlocks,
  }
}

function loadWordsState(): WordsState | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const rawState = window.localStorage.getItem(WORDS_STORAGE_KEY)

    if (rawState === null) {
      return undefined
    }

    const parsedState: unknown = JSON.parse(rawState)

    return normalizeWordsState(parsedState)
  } catch {
    return undefined
  }
}

const persistedWordsState = loadWordsState()

export const store = configureStore({
  reducer: {
    words: wordsReducer,
  },
  ...(persistedWordsState
    ? {
        preloadedState: {
          words: persistedWordsState,
        },
      }
    : {}),
})

let previousWordsState = store.getState().words

store.subscribe(() => {
  const nextWordsState = store.getState().words

  if (nextWordsState === previousWordsState || typeof window === 'undefined') {
    return
  }

  previousWordsState = nextWordsState

  try {
    window.localStorage.setItem(
      WORDS_STORAGE_KEY,
      JSON.stringify(nextWordsState)
    )
  } catch {
    // Ignore storage errors so the app continues to work.
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
