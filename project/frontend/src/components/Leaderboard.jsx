import { motion } from 'framer-motion'
import { formatDate } from '../utils/stats'

export default function Leaderboard({ rows }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Leaderboard</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Top 10</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/20 text-[var(--text-muted)]">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">WPM</th>
              <th className="px-2 py-2">Accuracy</th>
              <th className="px-2 py-2">Mode</th>
              <th className="px-2 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, index) => (
              <tr key={row.id ?? `${row.name}-${index}`} className="border-b border-white/10 text-[var(--text-primary)]">
                <td className="px-2 py-2">{index + 1}</td>
                <td className="px-2 py-2 font-semibold">{row.name}</td>
                <td className="px-2 py-2">{row.wpm.toFixed(0)}</td>
                <td className="px-2 py-2">{row.accuracy.toFixed(1)}%</td>
                <td className="px-2 py-2">{row.mode}</td>
                <td className="px-2 py-2 text-xs text-[var(--text-muted)]">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}
