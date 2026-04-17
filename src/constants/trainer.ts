import type { ScoreGroupKey, ScoreGroupSection } from '@/types/trainer'

export const CONTROL_CLASS_NAME = 'h-13 rounded-xl px-5 text-lg'
export const WORDS_PER_BLOCK = 30

export const SCORE_GROUP_ORDER: ScoreGroupKey[] = [
  'positiveInProgress',
  'positiveComplete',
  'negativeInProgress',
  'negativeComplete',
]

export const SCORE_GROUP_SECTIONS: ScoreGroupSection[] = [
  {
    title: 'Положительные в текущем блоке',
    items: [
      { key: 'positiveInProgress', label: 'В процессе', tone: 'positive' },
      { key: 'positiveComplete', label: 'Выучено слов', tone: 'positive', emphasis: 'strong' },
    ],
  },
  {
    title: 'Отрицательные в текущем блоке',
    items: [
      { key: 'negativeInProgress', label: 'Были ошибки', tone: 'negative' },
      { key: 'negativeComplete', label: 'Ну ты чо', tone: 'negative', emphasis: 'strong' },
    ],
  },
]
