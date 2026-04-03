import { motion } from 'framer-motion'

export default function Navbar({ theme, onToggleTheme, soundEnabled, onToggleSound, userName }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
          TypeFlow Arena
        </h1>
        <p className="text-xs text-[var(--text-muted)] sm:text-sm">Welcome, {userName}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          className="rounded-full border border-white/30 px-3 py-1.5 text-xs text-[var(--text-primary)] transition hover:bg-white/15 sm:text-sm"
        >
          {soundEnabled ? 'Sound: On' : 'Sound: Off'}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-white/30 px-3 py-1.5 text-xs text-[var(--text-primary)] transition hover:bg-white/15 sm:text-sm"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </motion.header>
  )
}
