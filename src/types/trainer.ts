export type ScoreGroupKey =
  | 'positiveInProgress'
  | 'positiveLearned'
  | 'completed'
  | 'negativeInProgress'
  | 'negativeComplete'

export type ScoreTone = 'positive' | 'negative'

export type ExpandedScoreGroups = Record<ScoreGroupKey, boolean>

export type ScoreGroupConfig = {
  key: ScoreGroupKey
  emoji?: string
  label: string
  description?: string
  tone: ScoreTone
  emphasis?: 'strong'
}

export type ScoreGroupSection = {
  title: string
  items: ScoreGroupConfig[]
}
