export default function StatsPanel({ wpm, accuracy, typedChars, wrongChars }) {
  const cards = [
    { label: 'WPM', value: wpm.toFixed(0) },
    { label: 'Accuracy', value: `${accuracy.toFixed(1)}%` },
    { label: 'Typed', value: typedChars },
    { label: 'Errors', value: wrongChars },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{card.value}</p>
        </div>
      ))}
    </section>
  )
}
