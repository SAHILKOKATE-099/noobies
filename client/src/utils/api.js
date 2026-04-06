import axios from 'axios'

const API_BASE_KEY = 'typing-api-base'
const DEPLOYED_API_FALLBACK = 'https://noobies-api.onrender.com/api'
const KNOWN_BAD_API_BASES = new Set([
  'https://exs-d78icbeuk2gs73dpblog.onrender.com/api',
  'https://noobies-api-jrus.onrender.com/api',
])

const ensureApiPath = (value) => {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

export const getApiBase = () => {
  const envBase = ensureApiPath(import.meta.env.VITE_API_URL)
  if (envBase) return envBase

  const storedBase = ensureApiPath(localStorage.getItem(API_BASE_KEY))
  if (storedBase && !KNOWN_BAD_API_BASES.has(storedBase)) return storedBase
  if (storedBase && KNOWN_BAD_API_BASES.has(storedBase)) {
    localStorage.removeItem(API_BASE_KEY)
  }

  // If running locally, hit the local Express server
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api'
  }

  // Any deployed environment (Vercel, GitHub Pages, custom domain) → use Render backend
  return DEPLOYED_API_FALLBACK
}

export const api = axios.create({
  baseURL: getApiBase(),
  timeout: 15000,
})

export const setApiBase = (value) => {
  const normalized = ensureApiPath(value)
  if (!normalized) return false
  localStorage.setItem(API_BASE_KEY, normalized)
  api.defaults.baseURL = normalized
  return true
}

export const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
