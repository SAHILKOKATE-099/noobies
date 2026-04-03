import { Router } from 'express'
import { body } from 'express-validator'
import { adminLogin, login, signup } from '../controllers/authController.js'

const authRouter = Router()

authRouter.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  signup,
)

authRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email is invalid'),
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
