import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { api } from '../utils/api'

export default function AuthPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const endpoint = isSignup ? '/signup' : '/login'
      const payload = isSignup
        ? form
        : {
            email: form.email,
            password: form.password,
          }

      const { data } = await api.post(endpoint, payload)

      if (data.token) {
        login(data.token, data.user)
      }

      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Authentication failed')
    }
  }

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-md rounded-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
        {isSignup ? 'Create Account' : 'Login'}
      </h2>

      <form className="space-y-3" onSubmit={submit}>
        {isSignup ? (
          <input
            type="text"
            required
            placeholder="Username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            className="input"
          />
        ) : null}

        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="input"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="input"
        />

        <button type="submit" className="w-full rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 font-semibold text-white">
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsSignup((prev) => !prev)}
        className="mt-3 text-sm text-[var(--text-muted)]"
      >
        {isSignup ? 'Already have an account? Login' : 'New user? Create account'}
      </button>

      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
    </motion.main>
  )
}
