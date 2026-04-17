import { words } from '@/lib/dictionary'
import { getWordScoreKey, type LanguageDirection } from '@/lib/languages'
import type {
  ExpandedScoreGroups,
  ScoreGroupKey,
  ScoresByKey,
} from '@/types/trainer'

export type WordEntry = (typeof words)[number]

export type ScoreGroups = Record<ScoreGroupKey, WordEntry[]>

export function createEmptyScoreGroups(): ScoreGroups {
  return {
    positiveInProgress: [],
    positiveComplete: [],
    negativeInProgress: [],
    negativeComplete: [],
  }
}

export function createCollapsedScoreGroups(): ExpandedScoreGroups {
  return {
    positiveInProgress: false,
    positiveComplete: false,
    negativeInProgress: false,
    negativeComplete: false,
  }
}

export function getScoreGroupKey(score: number): ScoreGroupKey | null {
  if (score > 0 && score < 3) {
    return 'positiveInProgress'
  }

  if (score === 3) {
    return 'positiveComplete'
  }

  if (score < 0 && score > -3) {
    return 'negativeInProgress'
  }

  if (score === -3) {
    return 'negativeComplete'
  }

  return null
}

export function getAvailableWords(
  candidateWords: WordEntry[],
  direction: LanguageDirection,
  scoresByKey: ScoresByKey
) {
  return candidateWords.filter(
    (word) => (scoresByKey[getWordScoreKey(word.id, direction)] ?? 0) < 3
  )
}
