const stores = new Map()

export const getClientIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown'

const getBucket = (bucketId) => {
  if (!stores.has(bucketId)) {
    stores.set(bucketId, new Map())
  }

  return stores.get(bucketId)
}

const pruneExpiredEntries = (bucket, windowMs, now) => {
  for (const [key, entry] of bucket.entries()) {
    if (now - entry.windowStartedAt >= windowMs) {
      bucket.delete(key)
    }
  }
}

export const createRateLimiter = ({
  windowMs,
  max,
  message,
  keyGenerator = (req) => getClientIp(req),
}) => {
  const bucketId = Symbol('rate-limit-bucket')

  return (req, res, next) => {
    const bucket = getBucket(bucketId)
    const now = Date.now()

    if (bucket.size > 1000) {
      pruneExpiredEntries(bucket, windowMs, now)
    }

    const key = String(keyGenerator(req) || getClientIp(req))
    const current = bucket.get(key)

    if (!current || now - current.windowStartedAt >= windowMs) {
      bucket.set(key, { count: 1, windowStartedAt: now })
    } else {
      current.count += 1
    }

    const entry = bucket.get(key)
    const resetInSeconds = Math.max(1, Math.ceil((entry.windowStartedAt + windowMs - now) / 1000))
    const remaining = Math.max(0, max - entry.count)

    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    res.setHeader('X-RateLimit-Reset', String(resetInSeconds))

    if (entry.count > max) {
      res.setHeader('Retry-After', String(resetInSeconds))
      return res.status(429).json({ message })
    }

    return next()
  }
}
