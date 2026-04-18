import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AuthPanel({
  firebaseEnabled,
  user,
  guestName,
  onGuestNameChange,
  onSignIn,
  onSignUp,
  onSignOut,
  authLoading,
  authError,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-4"
    >
      <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">User</h2>

      {firebaseEnabled ? (
        <>
          {user ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-muted)]">Signed in as {user.name}</p>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full rounded-xl border border-white/30 px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-white/20"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 pr-10 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => onSignIn(email, password)}
                  className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Login
                </button>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => onSignUp(email, password)}
                  className="flex-1 rounded-xl bg-[var(--accent-2)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)]">Firebase not configured. Running as local guest.</p>
          <input
            type="text"
            value={guestName}
            onChange={(event) => onGuestNameChange(event.target.value)}
            placeholder="Display name"
            className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
        </div>
      )}

      {authError ? <p className="mt-2 text-xs text-[var(--danger)]">{authError}</p> : null}
    </motion.section>
  )
}
