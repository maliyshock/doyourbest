import { ArrowRight } from 'lucide-react'

import { getWordTranslation } from '@/lib/dictionary'
import type { LanguageDirection } from '@/lib/languages'
import type { WordEntry } from '@/utils/trainer'

type ScoreGroupWordsProps = {
  items: WordEntry[]
  direction: LanguageDirection
}

export function ScoreGroupWords({ items, direction }: ScoreGroupWordsProps) {
  if (items.length === 0) {
    return <p className="stats-words-empty">No words in this category yet.</p>
  }

  return (
    <div className="stats-words-list">
      {items.map((word) => (
        <div key={word.id} className="stats-word-row">
          <span className="stats-word-source">{getWordTranslation(word, direction.source)}</span>
          <span className="stats-word-arrow" aria-hidden="true">
            <ArrowRight size={16} />
          </span>
          <span className="stats-word-target">{getWordTranslation(word, direction.target)}</span>
        </div>
      ))}
    </div>
  )
}
