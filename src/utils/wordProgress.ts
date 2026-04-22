export const LEARNED_SCORE = 3
export const REPEAT_SCORE_AFTER_DECAY = 2
export const COMPLETED_SUCCESS_COUNT = 3
export const LEARNED_SCORE_DECAY_DAYS = 3

function padDayPart(value: number) {
  return String(value).padStart(2, '0')
}

function parseDayKey(dayKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey)

  if (match === null) {
    return null
  }

  const [, year, month, day] = match

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  }
}

export function getCurrentDayKey(now: Date = new Date()) {
  return [
    now.getFullYear(),
    padDayPart(now.getMonth() + 1),
    padDayPart(now.getDate()),
  ].join('-')
}

export function getDaysBetweenDayKeys(fromDayKey: string, toDayKey: string) {
  const fromDate = parseDayKey(fromDayKey)
  const toDate = parseDayKey(toDayKey)

  if (fromDate === null || toDate === null) {
    return null
  }

  const fromTimestamp = Date.UTC(fromDate.year, fromDate.month - 1, fromDate.day)
  const toTimestamp = Date.UTC(toDate.year, toDate.month - 1, toDate.day)

  return Math.floor((toTimestamp - fromTimestamp) / (1000 * 60 * 60 * 24))
}

export function shouldDecayLearnedWord(successDateDay: string, currentDayKey: string) {
  const elapsedDays = getDaysBetweenDayKeys(successDateDay, currentDayKey)

  return elapsedDays !== null && elapsedDays >= LEARNED_SCORE_DECAY_DAYS
}
