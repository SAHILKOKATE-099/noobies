import { Router } from 'express'
import { body } from 'express-validator'
import { adminLogin, login, signup } from '../controllers/authController.js'

const authRouter = Router()

authRouter.post(
  '/signup',
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
  '/login',
  [
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
)

authRouter.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  adminLogin,
)

export default authRouter
