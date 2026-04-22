import type { ScoreGroupKey, ScoreGroupSection } from '@/types/trainer'

export const CONTROL_CLASS_NAME = 'h-13 rounded-xl px-5 text-lg'
export const WORDS_PER_BLOCK = 30

export const SCORE_GROUP_ORDER: ScoreGroupKey[] = [
  'positiveInProgress',
  'positiveLearned',
  'completed',
  'negativeInProgress',
  'negativeComplete',
]

export const SCORE_GROUP_SECTIONS: ScoreGroupSection[] = [
  {
    title: 'Positive overall',
    items: [
      { key: 'positiveInProgress', emoji: '🌱', label: 'In progress', tone: 'positive' },
      { key: 'positiveLearned', emoji: '📘', label: 'Words learned', tone: 'positive', emphasis: 'strong' },
      {
        key: 'completed',
        emoji: '🏆',
        label: 'Completed',
        description: 'Learned at least 3 times',
        tone: 'positive',
        emphasis: 'strong',
      },
    ],
  },
  {
    title: 'Negative overall',
    items: [
      { key: 'negativeInProgress', emoji: '🧠', label: 'With mistakes', tone: 'negative' },
      { key: 'negativeComplete', emoji: '🔁', label: 'Needs practice', tone: 'negative', emphasis: 'strong' },
    ],
  },
]
