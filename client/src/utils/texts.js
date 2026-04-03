const WORDS = [
  'react', 'typing', 'practice', 'modern', 'minimal', 'javascript', 'keyboard', 'focus',
  'accuracy', 'speed', 'window', 'layout', 'gradient', 'component', 'database', 'express',
  'mysql', 'leaderboard', 'dashboard', 'performance', 'challenge', 'cursor', 'result',
  'network', 'design', 'interface', 'responsive', 'smooth', 'animation', 'project',
]

const PARAGRAPH_TEXT =
  'Typing fast means nothing without control. Keep your eyes steady, trust your rhythm, and commit to accuracy before speed. Every deliberate keystroke builds confidence, and every finished paragraph proves your discipline under pressure.'

export const randomText = (wordCount = 90) => {
  const output = []
  for (let i = 0; i < wordCount; i += 1) {
    output.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  }
  return output.join(' ')
}

export const textForMode = (modeType, modeValue) => {
  if (modeType === 'paragraph') return PARAGRAPH_TEXT
  if (modeType === 'words') return randomText(modeValue)

  const map = { 30: 55, 60: 95, 120: 180 }
  return randomText(map[modeValue] || 90)
}
