export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const computeAccuracy = (correctChars, typedChars) => {
  if (!typedChars) return 100
  return clamp((correctChars / typedChars) * 100, 0, 100)
}

export const computeWpm = (correctChars, elapsedMs) => {
  if (!elapsedMs || elapsedMs <= 0) return 0
  const words = correctChars / 5
  const minutes = elapsedMs / 60000
  return Math.max(0, words / minutes)
}

export const formatModeLabel = (modeType, modeValue) => {
  return modeType === 'time' ? `${modeValue}s` : `${modeValue} words`
}

export const formatDate = (isoDate) => {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.valueOf())) return '-'

  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
