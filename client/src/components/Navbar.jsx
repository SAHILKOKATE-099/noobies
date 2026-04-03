import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/AuthContext'

const baseLinks = [
  { to: '/', label: 'Home' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/auth', label: 'Login' },
]

const themeOptions = [
  { value: 'mystery', label: 'Mysterious Night' },
  { value: 'angel', label: 'Angel Light' },
  { value: 'aurora', label: 'Aurora Pulse' },
]

export default function Navbar({ theme, onThemeChange, user }) {
  const location = useLocation()
  const { logout, isLoggedIn, isAdmin } = useAuth()
  const links = [
    ...baseLinks.slice(0, 2),
    ...(isLoggedIn ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(!isLoggedIn ? [baseLinks[2]] : []),
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass sticky top-3 z-10 mb-5 rounded-2xl px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Noobies</h1>
          <p className="text-xs text-[var(--text-muted)]">{user?.username || 'Guest'}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-3 py-1.5 ${
                location.pathname === item.to
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="theme-select">
            Theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(event) => onThemeChange(event.target.value)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
          >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/35 px-3 py-1.5 text-xs text-[var(--text-primary)]"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </motion.header>
  )
}
