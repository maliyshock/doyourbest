import dictionaryData from '@/dictionary/a1.json'
import type { LanguageCode } from '@/lib/languages'

type RawDictionaryTranslation = {
  en: string[]
  ru: string[]
  de: string[]
  example: string[]
}

type DictionaryTranslation = Record<LanguageCode, string[]>

type DictionarySection = Record<string, RawDictionaryTranslation>
type DictionarySource = Record<string, DictionarySection>

export type DictionaryWord = {
  id: string
  letter: string
  key: string
  en: string[]
  ru: string[]
  de: string[]
  example: string[]
}

const dictionary = dictionaryData as DictionarySource

function normalizeTranslation(
  translation: RawDictionaryTranslation
): DictionaryTranslation {
  return {
    en: translation.en,
    ru: translation.ru,
    de: translation.de,
  }
}

export const words: DictionaryWord[] = Object.entries(dictionary).flatMap(
  ([letter, section]) =>
    Object.entries(section).map(([key, translation]) => ({
      id: `${letter}-${key}`,
      letter,
      key,
      ...normalizeTranslation(translation),
      example: translation.example,
    }))
)

function getShuffledWords(candidateWords: DictionaryWord[]) {
  const shuffledWords = [...candidateWords]

  for (let index = shuffledWords.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledWords[index], shuffledWords[randomIndex]] = [
      shuffledWords[randomIndex],
      shuffledWords[index],
    ]
  }

  return shuffledWords
}

export function getRandomWord(
  candidateWords: DictionaryWord[] = words,
  excludeId?: string
) {
  if (candidateWords.length === 0) {
    return null
  }

  if (candidateWords.length === 1 || excludeId === undefined) {
    return candidateWords[Math.floor(Math.random() * candidateWords.length)]
  }

  const availableWords = candidateWords.filter((word) => word.id !== excludeId)

  if (availableWords.length === 0) {
    return candidateWords[0]
  }

  return availableWords[Math.floor(Math.random() * availableWords.length)]
}

export function getRandomWords(
  candidateWords: DictionaryWord[] = words,
  limit = candidateWords.length
) {
  if (limit <= 0 || candidateWords.length === 0) {
    return []
  }

  return getShuffledWords(candidateWords).slice(0, limit)
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
}

export function getWordTranslation(
  word: DictionaryWord,
  language: LanguageCode
) {
  return word[language].join(' / ')
}

export function getWordExamples(word: DictionaryWord) {
  return word.example
}

export function isCorrectTranslation(
  word: DictionaryWord,
  answer: string,
  language: LanguageCode
) {
  const normalizedAnswer = normalizeAnswer(answer)

  if (normalizedAnswer.length === 0) {
    return false
  }

  return word[language].some(
    (translation) => normalizeAnswer(translation) === normalizedAnswer
  )
}
