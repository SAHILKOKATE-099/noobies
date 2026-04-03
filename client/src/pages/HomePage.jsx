import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingTest } from '../hooks/useTypingTest'
import { useAuth } from '../hooks/AuthContext'
import { api, authHeader } from '../utils/api'
import { enableVoiceEngine, playAnnoyingVoiceByLevel, primeVoiceEngine } from '../utils/voiceFeedback'
import ModeSelector from '../components/ModeSelector'
import TestArea from '../components/TestArea'
import StatsPanel from '../components/StatsPanel'
import MultiplayerMode from '../components/MultiplayerMode'

export default function HomePage() {
  const [activeMode, setActiveMode] = useState('practice')
  const [modeType, setModeType] = useState('time')
  const [modeValue, setModeValue] = useState(60)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const { user, token } = useAuth()

  const {
    input,
    charStates,
    status,
    accuracy,
    wpm,
    typedChars,
    wrongChars,
    progress,
    elapsedMs,
    targetText,
    onType,
    restart,
    currentIndex,
  } = useTypingTest({ modeType, modeValue })

  useEffect(() => {
    setSaveMessage('')
    setHasSubmitted(false)
    setIsSubmitting(false)
  }, [modeType, modeValue])

  const handleSubmitScore = async () => {
    if (status !== 'finished' || !user || !token || hasSubmitted || isSubmitting) return

    setIsSubmitting(true)
    setSaveMessage('')

    try {
      await api.post(
        '/save-score',
        {
          wpm: Number(wpm.toFixed(0)),
          accuracy: Number(accuracy.toFixed(2)),
          time_taken:
            modeType === 'time' ? modeValue : Math.max(1, Math.round((Number(elapsedMs) || 0) / 1000)),
        },
        authHeader(token),
      )
      setSaveMessage('Score submitted and saved to leaderboard.')
      setHasSubmitted(true)
    } catch {
      setSaveMessage('Failed to submit score. Check backend connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const annoyanceLevelForFailure = ({ completionRatio, accuracyValue, wpmValue, reason }) => {
    if (reason === 'restart') {
      if (completionRatio < 0.15) return 4
      if (completionRatio < 0.35) return 3
      return 2
    }

    if (completionRatio < 0.2 || wpmValue < 10) return 4
    if (completionRatio < 0.35 || accuracyValue < 75) return 3
    if (completionRatio < 0.55 || accuracyValue < 85) return 2
    return 1
  }

  useEffect(() => {
    if (status !== 'finished' || !user || !token || hasSubmitted || isSubmitting) return
    handleSubmitScore()
  }, [status, user, token, hasSubmitted, isSubmitting])

  useEffect(() => {
    if (status !== 'finished' || modeType !== 'time') return

    const completionRatio = targetText.length ? typedChars / targetText.length : 0
    if (completionRatio < 0.35) {
      const level = annoyanceLevelForFailure({
        completionRatio,
        accuracyValue: accuracy,
        wpmValue: wpm,
        reason: 'timeout',
      })
      playAnnoyingVoiceByLevel(level, { reason: 'timeout' })
      setSaveMessage('Test failed: paragraph not completed. Try again.')
    }
  }, [status, modeType, targetText.length, typedChars, accuracy, wpm])

  const handleRestart = () => {
    if (status === 'running' && progress < 100) {
      const completionRatio = targetText.length ? typedChars / targetText.length : 0
      const level = annoyanceLevelForFailure({
        completionRatio,
        accuracyValue: accuracy,
        wpmValue: wpm,
        reason: 'restart',
      })
      playAnnoyingVoiceByLevel(level, { reason: 'restart' })
      setSaveMessage('Restarted early. That counts as a failed attempt.')
    } else {
      setSaveMessage('')
    }
    setHasSubmitted(false)
    setIsSubmitting(false)
    restart()
  }

  const handleType = (value) => {
    // Prime speech synthesis from a real user gesture so voice lines can play reliably.
    primeVoiceEngine()
    onType(value)
  }

  const handleEnableVoice = () => {
    const ok = enableVoiceEngine()
    setVoiceEnabled(ok)
    if (ok) {
      setSaveMessage('Voice enabled. You will hear feedback on failed attempts.')
    } else {
      setSaveMessage('Voice is unavailable in this browser/session.')
    }
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <ModeSelector
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        modeType={modeType}
        modeValue={modeValue}
        setModeType={setModeType}
        setModeValue={setModeValue}
      />
      {activeMode === 'practice' ? (
        <>
          <StatsPanel wpm={wpm} accuracy={accuracy} typedChars={typedChars} wrongChars={wrongChars} />
          <button
            type="button"
            onClick={handleEnableVoice}
            className="rounded-xl border border-white/35 px-4 py-2 text-sm text-[var(--text-primary)]"
          >
            {voiceEnabled ? 'Voice Enabled' : 'Enable Voice'}
          </button>
          <TestArea
            charStates={charStates}
            input={input}
            onType={handleType}
            currentIndex={currentIndex}
            progress={progress}
            onRestart={handleRestart}
          />
          {status === 'finished' && !user ? (
            <p className="text-sm text-[var(--text-muted)]">
              Login to auto-save scores in leaderboard and view dashboard analytics.
            </p>
          ) : null}
          {status === 'finished' && user ? (
            <button
              type="button"
              onClick={handleSubmitScore}
              disabled={hasSubmitted || isSubmitting}
              className="rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasSubmitted ? 'Score Submitted' : isSubmitting ? 'Submitting...' : 'Submit Score'}
            </button>
          ) : null}
          {saveMessage ? <p className="text-sm text-[var(--accent)]">{saveMessage}</p> : null}
        </>
      ) : (
        <MultiplayerMode user={user} token={token} />
      )}
    </motion.main>
  )
}
