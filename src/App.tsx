import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import { LanguageDirectionSelect } from '@/components/trainer/LanguageDirectionSelect'
import { ScoreGroupCard } from '@/components/trainer/ScoreGroupCard'
import {
  CONTROL_CLASS_NAME,
  SCORE_GROUP_ORDER,
  SCORE_GROUP_SECTIONS,
  WORDS_PER_BLOCK,
} from '@/constants/trainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  decayExpiredLearnedWords,
  decreaseWordScore,
  increaseWordScore,
  selectCurrentBlockWordIds,
  selectProgressByKey,
  setCurrentBlockWordIds,
} from '@/features/words/wordsSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  getWordExamples,
  getRandomWord,
  getRandomWords,
  getWordTranslation,
  isCorrectTranslation,
  words,
} from '@/lib/dictionary'
import {
  DEFAULT_LANGUAGE_DIRECTION,
  getLanguageDirectionKey,
  getNextLanguageDirection,
  getWordScoreKey,
  type LanguageCode,
  type LanguageDirection,
} from '@/lib/languages'
import type { ExpandedScoreGroups, ScoreGroupKey } from '@/types/trainer'
import {
  createCollapsedScoreGroups,
  createEmptyScoreGroups,
  getAvailableWords,
  getScoreGroupKey,
  type WordEntry,
} from '@/utils/trainer'
import { getCurrentDayKey } from '@/utils/wordProgress'

import './App.css'

function App() {
  const dispatch = useAppDispatch()
  const progressByKey = useAppSelector(selectProgressByKey)
  const [currentDirection, setCurrentDirection] = useState<LanguageDirection>(
    DEFAULT_LANGUAGE_DIRECTION
  )
  const currentDirectionKey = getLanguageDirectionKey(currentDirection)
  const currentBlockWordIds = useAppSelector((state) =>
    selectCurrentBlockWordIds(state, currentDirectionKey)
  )
  const [currentWord, setCurrentWord] = useState<(typeof words)[number] | null>(
    null
  )
  const [answer, setAnswer] = useState('')
  const [hasChecked, setHasChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const nextWordButtonRef = useRef<HTMLButtonElement | null>(null)
  const [expandedScoreGroups, setExpandedScoreGroups] =
    useState<ExpandedScoreGroups>(createCollapsedScoreGroups)
  const wordsById = useMemo(
    () => new Map(words.map((word) => [word.id, word] as const)),
    []
  )
  const currentBlockWords = useMemo(
    () =>
      currentBlockWordIds
        .map((wordId) => wordsById.get(wordId) ?? null)
        .filter((word): word is (typeof words)[number] => word !== null),
    [currentBlockWordIds, wordsById]
  )
  const incompleteBlockWords = useMemo(
    () => getAvailableWords(currentBlockWords, currentDirection, progressByKey),
    [currentBlockWords, currentDirection, progressByKey]
  )
  const availableWords = useMemo(
    () => getAvailableWords(words, currentDirection, progressByKey),
    [currentDirection, progressByKey]
  )
  const hasCurrentBlock = currentBlockWords.length > 0
  const isCurrentBlockComplete =
    hasCurrentBlock && incompleteBlockWords.length === 0
  const hasMoreWordsForNextBlock = availableWords.length > 0
  const completedWordsCount =
    currentBlockWords.length - incompleteBlockWords.length
  const shouldShowCompletionScreen =
    isCurrentBlockComplete && !(hasChecked && currentWord !== null)

  const resetRoundState = () => {
    setAnswer('')
    setHasChecked(false)
    setIsCorrect(null)
  }

  const getNextBlockWords = useCallback(
    (direction: LanguageDirection) => {
      return getRandomWords(
        getAvailableWords(words, direction, progressByKey),
        WORDS_PER_BLOCK
      )
    },
    [progressByKey]
  )

  const setBlockWordIds = useCallback(
    (direction: LanguageDirection, nextBlockWords: WordEntry[]) => {
      dispatch(
        setCurrentBlockWordIds({
          directionKey: getLanguageDirectionKey(direction),
          wordIds: nextBlockWords.map((word) => word.id),
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (currentBlockWords.length === 0) {
      if (availableWords.length > 0) {
        setBlockWordIds(currentDirection, getNextBlockWords(currentDirection))
      }
    }
  }, [
    availableWords.length,
    currentBlockWords.length,
    currentDirection,
    getNextBlockWords,
    setBlockWordIds,
  ])

  useEffect(() => {
    if (!hasChecked) {
      return
    }

    nextWordButtonRef.current?.focus()
  }, [hasChecked])

  useEffect(() => {
    const syncLearnedWords = () => {
      dispatch(decayExpiredLearnedWords({ currentDayKey: getCurrentDayKey() }))
    }

    syncLearnedWords()

    const intervalId = window.setInterval(syncLearnedWords, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [dispatch])

  const resolvedCurrentWord = useMemo(() => {
    if (hasChecked && currentWord !== null) {
      return currentWord
    }

    if (incompleteBlockWords.length === 0) {
      return null
    }

    if (
      currentWord !== null &&
      incompleteBlockWords.some((word) => word.id === currentWord.id)
    ) {
      return currentWord
    }

    return getRandomWord(incompleteBlockWords)
  }, [currentWord, hasChecked, incompleteBlockWords])

  useEffect(() => {
    if (hasChecked || resolvedCurrentWord === null) {
      return
    }

    answerInputRef.current?.focus()
  }, [hasChecked, resolvedCurrentWord])

  const startNextBlock = () => {
    const nextBlockWords = getNextBlockWords(currentDirection)

    setBlockWordIds(currentDirection, nextBlockWords)
    setCurrentWord(getRandomWord(nextBlockWords))
    resetRoundState()
  }

  const handleNextWord = () => {
    const skippedWithoutAnswer =
      currentScoreKey !== null && !hasChecked && answer.trim().length === 0

    if (skippedWithoutAnswer) {
      dispatch(decreaseWordScore(currentScoreKey))
    }

    const nextWord = getRandomWord(
      incompleteBlockWords,
      resolvedCurrentWord?.id
    )

    setCurrentWord(nextWord)

    resetRoundState()
  }

  const handleDirectionChange =
    (side: keyof LanguageDirection) => (nextLanguage: LanguageCode | null) => {
      if (nextLanguage === null) {
        return
      }

      const nextDirection = getNextLanguageDirection(
        currentDirection,
        side,
        nextLanguage
      )

      setCurrentDirection(nextDirection)
      setCurrentWord(null)
      resetRoundState()
    }

  const currentScoreKey =
    resolvedCurrentWord === null
      ? null
      : getWordScoreKey(resolvedCurrentWord.id, currentDirection)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      resolvedCurrentWord === null ||
      currentScoreKey === null ||
      hasChecked
    ) {
      return
    }

    setCurrentWord(resolvedCurrentWord)

    const correct = isCorrectTranslation(
      resolvedCurrentWord,
      answer,
      currentDirection.target
    )

    setHasChecked(true)
    setIsCorrect(correct)

    if (correct) {
      dispatch(
        increaseWordScore({
          key: currentScoreKey,
          currentDayKey: getCurrentDayKey(),
        })
      )
      return
    }

    dispatch(decreaseWordScore(currentScoreKey))
  }

  const currentScore =
    currentScoreKey === null ? 0 : (progressByKey[currentScoreKey]?.score ?? 0)
  const promptPlaceholder =
    currentDirection.target === 'de'
      ? 'Введите слово вместе с артиклем'
      : 'Введите перевод'
  const promptWord =
    resolvedCurrentWord === null
      ? null
      : getWordTranslation(resolvedCurrentWord, currentDirection.source)
  const correctAnswer =
    resolvedCurrentWord === null
      ? null
      : getWordTranslation(resolvedCurrentWord, currentDirection.target)
  const examples =
    resolvedCurrentWord === null ? [] : getWordExamples(resolvedCurrentWord)

  const scoreMarkers = useMemo(() => {
    if (currentScore === 0) {
      return []
    }

    return Array.from({ length: Math.abs(currentScore) }, (_, index) => ({
      id: `${currentScoreKey ?? 'word'}-${index}`,
      positive: currentScore > 0,
    }))
  }, [currentScore, currentScoreKey])

  const scoreGroups = useMemo(() => {
    return currentBlockWords.reduce((groups, word) => {
      const progress = progressByKey[getWordScoreKey(word.id, currentDirection)]
      const scoreGroupKey = getScoreGroupKey(progress)

      if (scoreGroupKey !== null) {
        groups[scoreGroupKey].push(word)
      }

      return groups
    }, createEmptyScoreGroups())
  }, [currentBlockWords, currentDirection, progressByKey])
  const scoreStats = useMemo(
    () =>
      SCORE_GROUP_ORDER.reduce(
        (stats, key) => {
          stats[key] = scoreGroups[key].length
          return stats
        },
        {
          positiveInProgress: 0,
          positiveLearned: 0,
          completed: 0,
          negativeInProgress: 0,
          negativeComplete: 0,
        }
      ),
    [scoreGroups]
  )

  const handleScoreGroupToggle = (scoreGroup: ScoreGroupKey) => {
    setExpandedScoreGroups((currentGroups) => ({
      ...currentGroups,
      [scoreGroup]: !currentGroups[scoreGroup],
    }))
  }

  const handleScoreGroupKeyDown =
    (scoreGroup: ScoreGroupKey) => (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      event.preventDefault()
      handleScoreGroupToggle(scoreGroup)
    }

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1 className="eyebrow h1 app-title">
          <span>German A1 trainer</span>
          <span className="app-title-meta">
            {hasCurrentBlock
              ? `${completedWordsCount}/${currentBlockWords.length} in block`
              : `${words.length} words`}
          </span>
        </h1>
      </header>

      <section className="trainer-card">
        <div className="mode-controls">
          <LanguageDirectionSelect
            value={currentDirection.source}
            ariaLabel="Source language"
            itemPrefix="source"
            onValueChange={handleDirectionChange('source')}
          />
          <span className="mode-arrow" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
          <LanguageDirectionSelect
            value={currentDirection.target}
            ariaLabel="Target language"
            itemPrefix="target"
            onValueChange={handleDirectionChange('target')}
          />
        </div>
        <div className="stats-card">
          {SCORE_GROUP_SECTIONS.map((section) => (
            <div key={section.title} className="stats-group">
              <p className="stats-title">{section.title}</p>
              <div className="stats-grid">
                {section.items.map((item) => (
                  <ScoreGroupCard
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    tone={item.tone}
                    emphasis={item.emphasis}
                    value={scoreStats[item.key]}
                    expanded={expandedScoreGroups[item.key]}
                    items={scoreGroups[item.key]}
                    direction={currentDirection}
                    onToggle={() => handleScoreGroupToggle(item.key)}
                    onKeyDown={handleScoreGroupKeyDown(item.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {shouldShowCompletionScreen ? (
          <div className="word-card block-complete-card">
            <div className="block-complete-content">
              <h2 className="h2 block-complete-title">Блок завершен</h2>
              <p className="subtitle">
                Вы угадали все {currentBlockWords.length} слов этого блока на 3
                балла.
              </p>
              {hasMoreWordsForNextBlock ? (
                <Button
                  type="button"
                  size="lg"
                  className={CONTROL_CLASS_NAME}
                  onClick={startNextBlock}
                >
                  Перейти к следующему блоку
                </Button>
              ) : (
                <p className="subtitle">
                  Новых слов больше не осталось. Все слова для этого режима
                  выучены.
                </p>
              )}
            </div>
          </div>
        ) : resolvedCurrentWord !== null ? (
          <div className="word-card">
            <div className="word-header">
              <span className="letter-badge">
                {resolvedCurrentWord.letter.toUpperCase()}
              </span>
            </div>

            <div className="word-main-row">
              <h2 className="h2 word-main">{promptWord}</h2>
              {scoreMarkers.length > 0 ? (
                <div
                  className="score-icons"
                  data-tone={currentScore > 0 ? 'positive' : 'negative'}
                >
                  {scoreMarkers.map((marker) => (
                    <span key={marker.id} className="score-icon">
                      {marker.positive ? <Check size={16} /> : <X size={16} />}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <form className="answer-form" onSubmit={handleSubmit}>
              {!hasChecked ? (
                <Input
                  id="translation"
                  ref={answerInputRef}
                  className={CONTROL_CLASS_NAME}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={promptPlaceholder}
                  autoComplete="off"
                />
              ) : null}

              <div className="controls">
                <Button
                  type="submit"
                  size="lg"
                  className={CONTROL_CLASS_NAME}
                  disabled={hasChecked}
                >
                  Проверить
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className={CONTROL_CLASS_NAME}
                  ref={nextWordButtonRef}
                  onClick={handleNextWord}
                >
                  Следующее слово
                </Button>
              </div>
            </form>

            {hasChecked ? (
              <div
                className="result-banner"
                data-tone={isCorrect ? 'positive' : 'negative'}
              >
                <strong>{isCorrect ? 'Правильно' : 'Неправильно'}</strong>
                {!isCorrect ? (
                  <span>Правильный вариант: {correctAnswer}</span>
                ) : null}
                {examples.length > 0 ? (
                  <div className="result-banner-examples">
                    <strong>Пример</strong>
                    <div className="example-list">
                      {examples.map((example) => (
                        <p key={example} className="example-item">
                          {example}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="word-card empty-state">
            <p>
              {hasMoreWordsForNextBlock
                ? 'Подготавливаю новый блок слов.'
                : 'Словарь пустой, слово не найдено.'}
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
