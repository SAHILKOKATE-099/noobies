import axios from 'axios'

const API_BASE_KEY = 'typing-api-base'

const ensureApiPath = (value) => {
  const trimmed = String(value || '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

export const getApiBase = () => {
  const envBase = ensureApiPath(import.meta.env.VITE_API_URL)
  if (envBase) return envBase

  const storedBase = ensureApiPath(localStorage.getItem(API_BASE_KEY))
  if (storedBase) return storedBase

  return 'http://localhost:5000/api'
}

export const api = axios.create({
  baseURL: getApiBase(),
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
