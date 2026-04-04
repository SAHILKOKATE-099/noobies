import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { api, getApiBase, setApiBase } from '../utils/api'

export default function AuthPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showApiConfig, setShowApiConfig] = useState(true)
  const [apiBaseInput, setApiBaseInput] = useState(getApiBase())
  const { login } = useAuth()
  const navigate = useNavigate()

  const getClientError = () => {
    const username = form.username.trim()
    const email = form.email.trim()
    const password = form.password

    if (!email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email'
    if (!password) return 'Password is required'

    if (isSignup) {
      if (username.length < 3 || username.length > 50) return 'Username must be 3 to 50 characters'
      if (password.length < 6) return 'Password must be at least 6 characters'
      if (password !== form.confirmPassword) return 'Passwords do not match'
    }

    return ''
  }

  const getRequestError = (requestError) => {
    const messageFromResponse = requestError.response?.data?.message
    const errors = requestError.response?.data?.errors
    if (messageFromResponse) return messageFromResponse
    if (Array.isArray(errors) && errors.length > 0) return errors[0]?.msg || 'Validation failed'
    if (requestError.code === 'ERR_NETWORK') {
      setShowApiConfig(true)
      return 'Cannot reach server. Start backend or set VITE_API_URL for deployed frontend.'
    }
    return 'Authentication failed'
  }

  const switchMode = (nextIsSignup) => {
    setIsSignup(nextIsSignup)
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const clientError = getClientError()
    if (clientError) {
      setError(clientError)
      return
    }

    setLoading(true)

    try {
      const endpoint = isSignup ? '/signup' : '/login'
      const payload = isSignup
        ? {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          }

      const { data } = await api.post(endpoint, payload)

      if (data.token) {
        login(data.token, data.user)
      }

      navigate('/')
    } catch (requestError) {
      setError(getRequestError(requestError))
    } finally {
      setLoading(false)
    }
  }

  const saveApiUrl = () => {
    const ok = setApiBase(apiBaseInput)
    if (!ok) {
      setError('Enter a valid backend URL')
      return
    }
    setError('')
  }

  return (
    <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-md rounded-2xl p-6">
      <div className="mb-5 grid grid-cols-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => switchMode(false)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            !isSignup ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => switchMode(true)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            isSignup ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'
          }`}
        >
          Create Account
        </button>
      </div>

      <h2 className="mb-1 text-2xl font-bold text-[var(--text-primary)]">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        {isSignup ? 'Create your account to save scores and track progress.' : 'Login to continue your typing journey.'}
      </p>

      <form className="space-y-3" onSubmit={submit}>
        {isSignup ? (
          <input
            type="text"
            required
            minLength={3}
            maxLength={50}
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
          minLength={6}
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="input"
        />

        {isSignup ? (
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            className="input"
          />
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => switchMode(!isSignup)}
        className="mt-3 text-sm text-[var(--text-muted)]"
      >
        {isSignup ? 'Already have an account? Login' : 'New user? Create account'}
      </button>

      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
      {showApiConfig ? (
        <div className="mt-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-xs text-[var(--text-muted)]">Backend API URL (example: https://your-api-domain.com/api)</p>
          <input
            type="text"
            placeholder="https://your-api-domain.com/api"
            value={apiBaseInput}
            onChange={(event) => setApiBaseInput(event.target.value)}
            className="input"
          />
          <button
            type="button"
            onClick={saveApiUrl}
            className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
          >
            Save API URL
          </button>
        </div>
      ) : null}
    </motion.main>
  )
}
