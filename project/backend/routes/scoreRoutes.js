import { Router } from 'express'
import { body } from 'express-validator'
import {
  awardRacePoint,
  downloadUserReportPdf,
  emailUserReport,
  getRaceLeaderboard,
  getLeaderboard,
  getUserHistory,
  saveScore,
} from '../controllers/scoreController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createRateLimiter, getClientIp } from '../middleware/rateLimitMiddleware.js'

const scoreRouter = Router()
const writeKey = (req) => `${getClientIp(req)}:${req.user?.id || 'anonymous'}`
const saveScoreLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Too many score submissions. Please slow down and try again shortly.',
  keyGenerator: writeKey,
})
const racePointLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: 'Too many race updates. Please slow down and try again shortly.',
  keyGenerator: writeKey,
})
const reportEmailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many report email requests. Please try again later.',
  keyGenerator: writeKey,
})
const reportDownloadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many PDF downloads. Please try again later.',
  keyGenerator: writeKey,
})

scoreRouter.post(
  '/save-score',
  authMiddleware,
  saveScoreLimiter,
  [
    body('wpm').isInt({ min: 0 }).withMessage('WPM must be a positive integer'),
    body('accuracy').isFloat({ min: 0, max: 100 }).withMessage('Accuracy must be between 0 and 100'),
    body('time_taken').isInt({ min: 0 }).withMessage('time_taken must be a number'),
  ],
  saveScore,
)

scoreRouter.get('/leaderboard', getLeaderboard)
scoreRouter.get('/user-history', authMiddleware, getUserHistory)
scoreRouter.get('/race-leaderboard', getRaceLeaderboard)
scoreRouter.post(
  '/race-point',
  authMiddleware,
  racePointLimiter,
  [body('winnerName').trim().isLength({ min: 1 }).withMessage('winnerName is required')],
  awardRacePoint,
)
scoreRouter.post(
  '/send-report-email',
  authMiddleware,
  reportEmailLimiter,
  [body('email').optional().isEmail().withMessage('Email is invalid')],
  emailUserReport,
)
scoreRouter.get('/user-report-pdf', authMiddleware, reportDownloadLimiter, downloadUserReportPdf)

export default scoreRouter
