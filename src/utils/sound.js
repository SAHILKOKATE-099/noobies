export const playKeypressSound = () => {
  const context = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(620, context.currentTime)
  gain.gain.setValueAtTime(0.03, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.06)

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start()
  oscillator.stop(context.currentTime + 0.06)
}
