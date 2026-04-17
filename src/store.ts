import { configureStore } from '@reduxjs/toolkit'

import type { WordsState } from '@/features/words/wordsSlice'
import wordsReducer from '@/features/words/wordsSlice'
import { words } from '@/lib/dictionary'
import { DEFAULT_LANGUAGE_DIRECTION, getWordScoreKey } from '@/lib/languages'

const WORDS_STORAGE_KEY = 'doyourbest.words'

const wordIdsByLegacyKey = words.reduce<Record<string, string[]>>(
  (result, word) => {
    result[word.key] ??= []
    result[word.key].push(word.id)
    return result
  },
  {}
)

function normalizeWordsState(value: unknown): WordsState | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const { scoresByKey, currentBlockWordIdsByDirection } = value as {
    scoresByKey?: unknown
    currentBlockWordIdsByDirection?: unknown
  }

  if (typeof scoresByKey !== 'object' || scoresByKey === null) {
    return undefined
  }

  const migratedEntries = Object.entries(scoresByKey).map(([key, score]) => {
    if (typeof score !== 'number') {
      return null
    }

    const [directionKey, wordKey] = key.includes(':')
      ? (key.split(/:(.+)/, 2) as [string, string])
      : [getWordScoreKey('', DEFAULT_LANGUAGE_DIRECTION).split(':')[0], key]
    const knownWordIds = wordIdsByLegacyKey[wordKey]

    if (knownWordIds !== undefined) {
      return knownWordIds.map(
        (wordId) => [`${directionKey}:${wordId}`, score] as const
      )
    }

    const nextKey = key.includes('->')
      ? key
      : getWordScoreKey(wordKey, DEFAULT_LANGUAGE_DIRECTION)

    return [[nextKey, score] as const]
  })

  if (migratedEntries.some((entry) => entry === null)) {
    return undefined
  }

  const validEntries = migratedEntries
    .flat()
    .filter((entry): entry is readonly [string, number] => entry !== null)

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
    scoresByKey: Object.fromEntries(validEntries),
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
