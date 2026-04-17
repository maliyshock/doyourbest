export const LANGUAGES = ['ru', 'en', 'de'] as const

export const MAIN_LANGUAGE = 'de'

export const DEFAULT_LANGUAGE_DIRECTION = {
  source: MAIN_LANGUAGE,
  target: 'ru',
} as const satisfies LanguageDirection

export type LanguageCode = (typeof LANGUAGES)[number]

export type LanguageDirection = {
  source: LanguageCode
  target: LanguageCode
}

type DirectionSide = keyof LanguageDirection

export function isValidLanguageDirection(direction: LanguageDirection) {
  return (
    direction.source !== direction.target &&
    (direction.source === MAIN_LANGUAGE || direction.target === MAIN_LANGUAGE)
  )
}

export function getNextLanguageDirection(
  currentDirection: LanguageDirection,
  side: DirectionSide,
  nextLanguage: LanguageCode
) {
  const nextDirection: LanguageDirection = {
    ...currentDirection,
    [side]: nextLanguage,
  }

  if (isValidLanguageDirection(nextDirection)) {
    return nextDirection
  }

  const oppositeSide: DirectionSide = side === 'source' ? 'target' : 'source'

  return {
    ...nextDirection,
    [oppositeSide]: currentDirection[side],
  }
}

export function getLanguageDirectionKey(direction: LanguageDirection) {
  return `${direction.source}->${direction.target}`
}

export function getWordScoreKey(wordId: string, direction: LanguageDirection) {
  return `${getLanguageDirectionKey(direction)}:${wordId}`
}
