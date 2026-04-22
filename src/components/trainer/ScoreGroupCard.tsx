import type { KeyboardEvent } from 'react'

import type { LanguageDirection } from '@/lib/languages'
import type { ScoreGroupKey, ScoreTone } from '@/types/trainer'
import type { WordEntry } from '@/utils/trainer'

import { ScoreGroupWords } from './ScoreGroupWords'

type ScoreGroupCardProps = {
  groupKey: ScoreGroupKey
  emoji?: string
  label: string
  description?: string
  tone: ScoreTone
  emphasis?: 'strong'
  value: number
  expanded: boolean
  items: WordEntry[]
  direction: LanguageDirection
  onToggle: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

export function ScoreGroupCard({
  groupKey,
  emoji,
  label,
  description,
  tone,
  emphasis,
  value,
  expanded,
  items,
  direction,
  onToggle,
  onKeyDown,
}: ScoreGroupCardProps) {
  return (
    <div
      className="stat-item"
      data-group-key={groupKey}
      data-tone={tone}
      data-emphasis={emphasis}
      data-active={expanded}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    >
      <div className="stat-value-row">
        {emoji !== undefined ? (
          <span className="stat-value-emoji" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
        <span className="stat-value">{value}</span>
      </div>
      <span className="stat-label">{label}</span>
      {description !== undefined ? (
        <span className="stat-label-description">{description}</span>
      ) : null}
      <div className="stat-item-words" data-expanded={expanded} aria-hidden={!expanded}>
        <div className="stat-item-words-inner">
          <ScoreGroupWords items={items} direction={direction} />
        </div>
      </div>
    </div>
  )
}
