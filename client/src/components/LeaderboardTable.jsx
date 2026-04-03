export default function LeaderboardTable({ rows }) {
  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Global Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/20 text-[var(--text-muted)]">
              <th className="py-2">#</th>
              <th className="py-2">User</th>
              <th className="py-2">WPM</th>
              <th className="py-2">Accuracy</th>
              <th className="py-2">Time</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.username}-${index}`} className="border-b border-white/10 text-[var(--text-primary)]">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{row.username}</td>
                <td className="py-2">{row.wpm}</td>
                <td className="py-2">{Number(row.accuracy).toFixed(1)}%</td>
                <td className="py-2">{row.time_taken}s</td>
                <td className="py-2">{new Date(row.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
