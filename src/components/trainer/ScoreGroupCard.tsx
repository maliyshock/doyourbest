import type { KeyboardEvent } from 'react'

import type { LanguageDirection } from '@/lib/languages'
import type { ScoreTone } from '@/types/trainer'
import type { WordEntry } from '@/utils/trainer'

import { ScoreGroupWords } from './ScoreGroupWords'

type ScoreGroupCardProps = {
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
      data-tone={tone}
      data-emphasis={emphasis}
      data-active={expanded}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    >
      <span className="stat-value">{value}</span>
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
