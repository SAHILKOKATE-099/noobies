const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173',
]

const WEAK_SECRET_MARKERS = [
  'replace_with_secure_secret',
  'changeme',
  'change-me',
  'default',
  'secret',
  'password',
]

export const getAllowedOrigins = () => {
  const envOrigins = String(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])]
}

const isLocalDevOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export const isOriginAllowed = (origin, allowedOrigins) =>
  allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin))

export const assertSecurityConfig = () => {
  const jwtSecret = String(process.env.JWT_SECRET || '').trim()
  const normalizedSecret = jwtSecret.toLowerCase()

  const weakSecret =
    !jwtSecret ||
    jwtSecret.length < 32 ||
    WEAK_SECRET_MARKERS.some((marker) => normalizedSecret.includes(marker))

  if (weakSecret) {
    throw new Error('JWT_SECRET must be set to a strong random value with at least 32 characters.')
  }
}
