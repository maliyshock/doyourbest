import type { WordProgress } from '@/features/words/wordsSlice'
import { words } from '@/lib/dictionary'
import { getWordScoreKey, type LanguageDirection } from '@/lib/languages'
import type { ExpandedScoreGroups, ScoreGroupKey } from '@/types/trainer'
import { LEARNED_SCORE } from '@/utils/wordProgress'

export type WordEntry = (typeof words)[number]

export type ScoreGroups = Record<ScoreGroupKey, WordEntry[]>

export function createEmptyScoreGroups(): ScoreGroups {
  return {
    positiveInProgress: [],
    positiveLearned: [],
    completed: [],
    negativeInProgress: [],
    negativeComplete: [],
  }
}

export function createCollapsedScoreGroups(): ExpandedScoreGroups {
  return {
    positiveInProgress: false,
    positiveLearned: false,
    completed: false,
    negativeInProgress: false,
    negativeComplete: false,
  }
}

export function getScoreGroupKey(progress: WordProgress | undefined): ScoreGroupKey | null {
  if (progress === undefined) {
    return null
  }

  if (progress.status === 'completed') {
    return 'completed'
  }

  const score = progress.score

  if (score > 0 && score < 3) {
    return 'positiveInProgress'
  }

  if (score === LEARNED_SCORE) {
    return 'positiveLearned'
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
  progressByKey: Record<string, WordProgress | undefined>
) {
  return candidateWords.filter((word) => {
    const progress = progressByKey[getWordScoreKey(word.id, direction)]

    if (progress === undefined) {
      return true
    }

    return progress.status !== 'completed' && progress.score < LEARNED_SCORE
  })
}
