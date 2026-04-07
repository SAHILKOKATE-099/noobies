import { useEffect, useMemo, useRef, useState } from 'react'
import { resolveText } from '../utils/sampleTexts'
import { computeAccuracy, computeWpm } from '../utils/stats'

const STATUS = {
  idle: 'idle',
  running: 'running',
  finished: 'finished',
}

export const useTypingTest = ({ modeType, modeValue, customText }) => {
  const [targetText, setTargetText] = useState(() =>
    resolveText({ modeType, modeValue, customText }),
  )
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(STATUS.idle)
  const [startedAt, setStartedAt] = useState(null)
  const [endedAt, setEndedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const intervalRef = useRef(null)

  const resetSession = (nextText) => {
    setTargetText(nextText)
    setInput('')
    setStatus(STATUS.idle)
    setStartedAt(null)
    setEndedAt(null)
    setElapsedMs(0)
  }

  useEffect(() => {
    const next = resolveText({ modeType, modeValue, customText })
    resetSession(next)
  }, [modeType, modeValue, customText])

  useEffect(() => {
    if (status !== STATUS.running || !startedAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return undefined
    }

    intervalRef.current = window.setInterval(() => {
      const currentElapsed = Date.now() - startedAt
      setElapsedMs(currentElapsed)

      if (modeType === 'time' && currentElapsed >= modeValue * 1000) {
        setStatus(STATUS.finished)
        setEndedAt(Date.now())
      }
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [modeType, modeValue, startedAt, status])

  const effectiveElapsedMs = useMemo(() => {
    if (!startedAt) return 0
    if (status === STATUS.finished && endedAt) {
      return endedAt - startedAt
    }
    return elapsedMs
  }, [elapsedMs, endedAt, startedAt, status])

  const charStates = useMemo(() => {
    const targetChars = [...targetText]

    return targetChars.map((char, index) => {
      if (index >= input.length) {
        return { char, state: 'pending' }
      }

      return {
        char,
        state: input[index] === char ? 'correct' : 'incorrect',
      }
    })
  }, [input, targetText])

  const typedChars = input.length
  const correctChars = charStates.filter((char) => char.state === 'correct').length
  const incorrectChars = typedChars - correctChars
  const accuracy = computeAccuracy(correctChars, typedChars)
  const wpm = computeWpm(correctChars, effectiveElapsedMs)

  const progress =
    modeType === 'time'
      ? Math.min(100, (effectiveElapsedMs / (modeValue * 1000)) * 100)
      : Math.min(100, (typedChars / Math.max(targetText.length, 1)) * 100)

  const finishTest = () => {
    if (status === STATUS.finished) return
    const now = Date.now()
    setStatus(STATUS.finished)
    setEndedAt(now)
    if (!startedAt) {
      setStartedAt(now)
    }
  }

  const handleInputChange = (nextValue) => {
    if (status === STATUS.finished) return

    if (status === STATUS.idle && nextValue.length > 0) {
      const now = Date.now()
      setStatus(STATUS.running)
      setStartedAt(now)
    }

    setInput(nextValue)

    if (modeType === 'words' && nextValue.length >= targetText.length) {
      finishTest()
    }
  }

  useEffect(() => {
    if (modeType !== 'time' || status !== STATUS.running) return
    if (effectiveElapsedMs < modeValue * 1000) return
    finishTest()
  }, [effectiveElapsedMs, modeType, modeValue, status])

  const restart = () => {
    const nextText = resolveText({ modeType, modeValue, customText })
    resetSession(nextText)
  }

  return {
    input,
    targetText,
    charStates,
    status,
    typedChars,
    correctChars,
    incorrectChars,
    accuracy,
    wpm,
    progress,
    startedAt,
    endedAt,
    effectiveElapsedMs,
    currentIndex: input.length,
    handleInputChange,
    finishTest,
    restart,
  }
}
