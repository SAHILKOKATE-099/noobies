import { motion } from 'framer-motion'

function StatCard({ label, value, hint }) {
  return (
    <motion.div
      layout
      className="glass-card rounded-2xl px-4 py-3"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
    </motion.div>
  )
}

export default function StatsPanel({ wpm, accuracy, typedChars, incorrectChars, status }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="WPM" value={wpm.toFixed(0)} hint="Live speed" />
      <StatCard label="Accuracy" value={`${accuracy.toFixed(1)}%`} hint="Precision" />
      <StatCard label="Typed" value={typedChars} hint="Characters" />
      <StatCard
        label="Errors"
        value={incorrectChars}
        hint={status === 'finished' ? 'Final mistakes' : 'Keep it clean'}
      />
    </section>
  )
}
