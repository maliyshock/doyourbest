export type ScoreGroupKey =
  | 'positiveInProgress'
  | 'positiveComplete'
  | 'negativeInProgress'
  | 'negativeComplete'

export type ScoreTone = 'positive' | 'negative'

export type ScoresByKey = Record<string, number | undefined>

export type ExpandedScoreGroups = Record<ScoreGroupKey, boolean>

export type ScoreGroupConfig = {
  key: ScoreGroupKey
  label: string
  tone: ScoreTone
  emphasis?: 'strong'
}

export type ScoreGroupSection = {
  title: string
  items: ScoreGroupConfig[]
}
