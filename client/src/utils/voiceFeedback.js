const ANNOYANCE_PROFILES = {
  1: {
    rate: 1.02,
    pitch: 0.9,
    repeat: 1,
    lines: [
      'Weak finish. That was disappointing.',
      'You can do better, but you did not.',
      'Slow and careless. Great combination.',
    ],
  },
  2: {
    rate: 1.16,
    pitch: 1.04,
    repeat: 2,
    lines: [
      'That attempt was bad. Really bad.',
      'You bailed out early and called it effort.',
      'The keyboard deserved a serious attempt.',
    ],
  },
  3: {
    rate: 1.3,
    pitch: 1.2,
    repeat: 3,
    lines: [
      'Catastrophic typing. Completely unserious.',
      'You got crushed by a paragraph.',
      'If frustration had a scoreboard, you are leading.',
    ],
  },
  4: {
    rate: 1.45,
    pitch: 1.35,
    repeat: 4,
    lines: [
      'This was a typing disaster. Own it.',
      'You rage quit a sentence.',
      'That was not a test. That was surrender.',
    ],
  },
}

let hasPrimedSpeech = false

const getSpeech = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    return null
  }
  return window.speechSynthesis
}

const pickVoice = (voices) => {
  if (!voices?.length) return null
  return (
    voices.find((voice) => /en-in/i.test(voice.lang)) ||
    voices.find((voice) => /en-/i.test(voice.lang)) ||
    voices[0]
  )
}

const speakLine = (line, settings) => {
  const speech = getSpeech()
  if (!speech) return

  const utterance = new window.SpeechSynthesisUtterance(line)
  utterance.rate = settings.rate
  utterance.pitch = settings.pitch
  utterance.volume = 1

  const voice = pickVoice(speech.getVoices())
  if (voice) {
    utterance.voice = voice
  }

  speech.cancel()
  speech.speak(utterance)
}

export const primeVoiceEngine = () => {
  const speech = getSpeech()
  if (!speech || hasPrimedSpeech) return

  hasPrimedSpeech = true
  const warmup = new window.SpeechSynthesisUtterance(' ')
  warmup.volume = 0
  warmup.rate = 1
  warmup.pitch = 1

  const voice = pickVoice(speech.getVoices())
  if (voice) {
    warmup.voice = voice
  }

  speech.speak(warmup)
  speech.cancel()
}

export const enableVoiceEngine = () => {
  const speech = getSpeech()
  if (!speech) return false
  primeVoiceEngine()
  return true
}

export const playDemotivationVoice = () => {
  const speech = getSpeech()
  if (!speech) {
    return
  }

  const profile = ANNOYANCE_PROFILES[1]
  const line = profile.lines[Math.floor(Math.random() * profile.lines.length)]
  const voices = speech.getVoices()

  if (voices.length) {
    speakLine(line, profile)
    return
  }

  // On some Chrome builds voices are loaded lazily.
  const onVoicesReady = () => {
    speech.removeEventListener('voiceschanged', onVoicesReady)
    speakLine(line, profile)
  }
  speech.addEventListener('voiceschanged', onVoicesReady)

  setTimeout(() => {
    speech.removeEventListener('voiceschanged', onVoicesReady)
    speakLine(line, profile)
  }, 350)
}

export const playAnnoyingVoiceByLevel = (level = 1, context = {}) => {
  const speech = getSpeech()
  if (!speech) return

  const safeLevel = Math.min(4, Math.max(1, Number(level) || 1))
  const profile = ANNOYANCE_PROFILES[safeLevel]
  const base = profile.lines[Math.floor(Math.random() * profile.lines.length)]
  const tail =
    context.reason === 'restart'
      ? 'You restarted mid run. That counts as failure.'
      : context.reason === 'timeout'
        ? 'Timer ended and you did not finish. Again.'
        : 'Try again with actual focus.'

  const queue = Array.from({ length: profile.repeat }, (_, index) =>
    index === 0 ? `${base} ${tail}` : base,
  )

  speech.cancel()
  queue.forEach((line, index) => {
    const delay = index * 320
    setTimeout(() => {
      speakLine(line, profile)
    }, delay)
  })
}
