const WORD_BANK = [
  'react', 'hook', 'signal', 'component', 'motion', 'cursor', 'design', 'module',
  'latency', 'velocity', 'syntax', 'compiler', 'browser', 'network', 'feature',
  'leaderboard', 'practice', 'keyboard', 'challenge', 'focus', 'rhythm', 'stream',
  'future', 'debug', 'window', 'thread', 'pattern', 'context', 'engine', 'tailwind',
  'gradient', 'minimal', 'glass', 'shadow', 'layout', 'token', 'timing', 'accuracy',
  'momentum', 'quality', 'build', 'iterate', 'deploy', 'dashboard', 'profile',
  'ranking', 'function', 'object', 'closure', 'render', 'smooth', 'adaptive',
  'precise', 'creative', 'clarity', 'progress', 'testing', 'strategy', 'offline',
  'online', 'firebase', 'history', 'personal', 'results', 'analytics', 'flow',
]

export const pickRandomText = (wordCount = 80) => {
  const words = []

  for (let i = 0; i < wordCount; i += 1) {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
    words.push(randomWord)
  }

  return words.join(' ')
}

export const resolveText = ({ modeType, modeValue, customText }) => {
  if (customText?.trim()) {
    return customText.trim().replace(/\s+/g, ' ')
  }

  const lookup = {
    30: 55,
    60: 95,
    120: 180,
    25: 25,
    50: 50,
    100: 100,
  }

  const words = lookup[modeValue] ?? (modeType === 'words' ? modeValue : 90)
  return pickRandomText(words)
}
