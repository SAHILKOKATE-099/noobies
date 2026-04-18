import { Router } from 'express'
import { body } from 'express-validator'
import { adminLogin, login, signup, verifyEmail } from '../controllers/authController.js'
import { createRateLimiter, getClientIp } from '../middleware/rateLimitMiddleware.js'

const authRouter = Router()
const authAttemptKey = (req) => {
  const email = String(req.body?.email || '').trim().toLowerCase() || 'anonymous'
  return `${getClientIp(req)}:${email}`
}
const signupLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many signup attempts. Please wait a few minutes and try again.',
  keyGenerator: authAttemptKey,
})
const loginLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: 'Too many login attempts. Please wait a few minutes and try again.',
  keyGenerator: authAttemptKey,
})
const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many admin login attempts. Please wait and try again.',
  keyGenerator: authAttemptKey,
})

authRouter.post(
  '/signup',
  signupLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be 3 to 50 characters'),
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6 to 128 characters'),
  ],
  signup,
)

authRouter.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token is required'),
  ],
  verifyEmail,
)

authRouter.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
)

authRouter.post(
  '/admin/login',
  adminLoginLimiter,
  [
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  adminLogin,
)

export default authRouter
