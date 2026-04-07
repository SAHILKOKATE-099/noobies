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

const scoreRouter = Router()

scoreRouter.post(
  '/save-score',
  authMiddleware,
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
  [body('winnerName').trim().isLength({ min: 1 }).withMessage('winnerName is required')],
  awardRacePoint,
)
scoreRouter.post(
  '/send-report-email',
  authMiddleware,
  [body('email').optional().isEmail().withMessage('Email is invalid')],
  emailUserReport,
)
scoreRouter.get('/user-report-pdf', authMiddleware, downloadUserReportPdf)

export default scoreRouter
