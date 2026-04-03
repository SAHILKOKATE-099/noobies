import { useEffect, useMemo, useState } from 'react'
import { textForMode } from '../utils/texts'

const calcAccuracy = (correct, typed) => (typed ? (correct / typed) * 100 : 100)
const calcWpm = (correct, elapsedMs) => {
  if (!elapsedMs) return 0
  return (correct / 5) / (elapsedMs / 60000)
}

export const useTypingTest = ({ modeType, modeValue }) => {
  const [targetText, setTargetText] = useState(() => textForMode(modeType, modeValue))
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    // Timer drives live WPM/progress and auto-finishes time mode tests.
    const timer = setInterval(() => {
      if (status !== 'running' || !startTime) return
      const nextElapsed = Date.now() - startTime
      setElapsedMs(nextElapsed)

      if (modeType === 'time' && nextElapsed >= modeValue * 1000) {
        setStatus('finished')
        setEndTime(Date.now())
      }
    }, 100)

    return () => clearInterval(timer)
  }, [modeType, modeValue, startTime, status])

  useEffect(() => {
    setTargetText(textForMode(modeType, modeValue))
    setInput('')
    setStatus('idle')
    setStartTime(null)
    setEndTime(null)
    setElapsedMs(0)
  }, [modeType, modeValue])

  const charStates = useMemo(() => {
    // Build per-character status for live highlighting in the UI.
    return [...targetText].map((char, index) => {
      if (index >= input.length) return { char, state: 'pending' }
      return { char, state: input[index] === char ? 'correct' : 'wrong' }
    })
  }, [input, targetText])

  const correctChars = charStates.filter((char) => char.state === 'correct').length
  const typedChars = input.length
  const wrongChars = typedChars - correctChars
  const effectiveElapsed = status === 'finished' && endTime && startTime ? endTime - startTime : elapsedMs
  const accuracy = calcAccuracy(correctChars, typedChars)
  const wpm = calcWpm(correctChars, effectiveElapsed)

  const progress =
    modeType === 'time'
      ? Math.min(100, (effectiveElapsed / (modeValue * 1000)) * 100)
      : Math.min(100, (typedChars / targetText.length) * 100)

  const onType = (value) => {
    if (status === 'finished') return

    if (status === 'idle' && value.length) {
      const now = Date.now()
      setStartTime(now)
      setStatus('running')
    }

    setInput(value)

    if ((modeType === 'words' || modeType === 'paragraph') && value.length >= targetText.length) {
      setStatus('finished')
      setEndTime(Date.now())
    }
  }

  const restart = () => {
    setTargetText(textForMode(modeType, modeValue))
    setInput('')
    setStatus('idle')
    setStartTime(null)
    setEndTime(null)
    setElapsedMs(0)
  }

  return {
    targetText,
    input,
    status,
    charStates,
    correctChars,
    typedChars,
    wrongChars,
    accuracy,
    wpm,
    progress,
    elapsedMs: effectiveElapsed,
    currentIndex: input.length,
    onType,
    restart,
  }
}
