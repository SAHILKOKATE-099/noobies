import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/AuthContext'
import { api, authHeader } from '../utils/api'

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return

      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/user-history', authHeader(token))
        setRows(data)
      } catch (requestError) {
        setRows([])
        setError(requestError.response?.data?.message || 'Failed to load your history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [token])

  const summary = useMemo(() => {
    if (!rows.length) {
      return { tests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 }
    }

    const totalWpm = rows.reduce((sum, row) => sum + Number(row.wpm || 0), 0)
    const totalAccuracy = rows.reduce((sum, row) => sum + Number(row.accuracy || 0), 0)

    return {
      tests: rows.length,
      bestWpm: Math.max(...rows.map((row) => Number(row.wpm || 0))),
      avgWpm: totalWpm / rows.length,
      avgAccuracy: totalAccuracy / rows.length,
    }
  }, [rows])

  const handleDownloadPdf = async () => {
    if (!token || pdfLoading) return

    setPdfLoading(true)
    setError('')
    try {
      const response = await api.get('/user-report-pdf', {
        ...authHeader(token),
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `noobies-report-${user?.username || 'user'}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to download PDF report')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <section className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">My Dashboard</h2>
            <p className="text-sm text-[var(--text-muted)]">View your typing history and export your data.</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="rounded-xl border border-white/35 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfLoading ? 'Preparing PDF...' : 'Download My Data (PDF)'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="glass rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Tests</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{summary.tests}</p>
        </article>
        <article className="glass rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Best WPM</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{summary.bestWpm.toFixed(0)}</p>
        </article>
        <article className="glass rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Avg WPM</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{summary.avgWpm.toFixed(1)}</p>
        </article>
        <article className="glass rounded-xl p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Avg Accuracy</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{summary.avgAccuracy.toFixed(1)}%</p>
        </article>
      </section>

      <section className="glass rounded-2xl p-4">
        <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Typing History</h3>
        {loading ? <p className="text-sm text-[var(--text-muted)]">Loading history...</p> : null}
        {!loading && !rows.length ? (
          <p className="text-sm text-[var(--text-muted)]">No history yet. Complete tests to see entries here.</p>
        ) : null}
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/20 text-[var(--text-muted)]">
                  <th className="py-2">WPM</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/10 text-[var(--text-primary)]">
                    <td className="py-2">{Number(row.wpm || 0).toFixed(0)}</td>
                    <td className="py-2">{Number(row.accuracy || 0).toFixed(1)}%</td>
                    <td className="py-2">{Number(row.time_taken || 0)}s</td>
                    <td className="py-2">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </motion.main>
  )
}
