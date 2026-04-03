import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/AuthContext'
import { api, authHeader } from '../utils/api'

export default function AdminPage() {
  const { user, token, isAdmin, isLoggedIn, login, logout } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchScores = async (activeToken) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data } = await api.get('/admin/scores', authHeader(activeToken))
      setRows(data)
      setMessage(`Loaded ${data.length} saved scores from database`)
    } catch (requestError) {
      setRows([])
      setError(requestError.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin && token) {
      fetchScores(token)
    } else {
      setRows([])
      setMessage('')
    }
  }, [isAdmin, token])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const { data } = await api.post('/admin/login', form)
      login(data.token, data.user)
      setForm({ email: '', password: '' })
      fetchScores(data.token)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin login failed')
    }
  }

  if (!isAdmin) {
    return (
      <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-md rounded-2xl p-6">
        <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">Admin Login</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Sign in with an admin account to view all saved scores.
        </p>
        {isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--danger)]">
              {user?.username || 'Current user'} is not an admin account.
            </p>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/35 px-4 py-2 text-sm text-[var(--text-primary)]"
            >
              Logout and use admin account
            </button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="Admin email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="input"
            />
            <input
              type="password"
              required
              placeholder="Admin password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="input"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 font-semibold text-white"
            >
              Login as Admin
            </button>
          </form>
        )}
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </motion.main>
    )
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Dashboard</h2>
        <button
          type="button"
          onClick={() => fetchScores(token)}
          disabled={loading}
          className="rounded-lg border border-white/35 px-3 py-1.5 text-sm text-[var(--text-primary)] disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {message ? <p className="mb-3 text-sm text-[var(--accent)]">{message}</p> : null}
      {error ? <p className="mb-3 text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/20 text-[var(--text-muted)]">
              <th className="py-2">User</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">WPM</th>
              <th className="py-2">Accuracy</th>
              <th className="py-2">Time</th>
              <th className="py-2">Saved At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.email}-${index}`} className="border-b border-white/10 text-[var(--text-primary)]">
                <td className="py-2">{row.username}</td>
                <td className="py-2">{row.email}</td>
                <td className="py-2">{row.is_admin ? 'Admin' : 'User'}</td>
                <td className="py-2">{row.wpm}</td>
                <td className="py-2">{Number(row.accuracy).toFixed(1)}%</td>
                <td className="py-2">{row.time_taken}s</td>
                <td className="py-2">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.main>
  )
}
