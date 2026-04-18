import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { User } from '../models/User.js'
import { localDb } from '../utils/localDb.js'

const tokenForUser = (user) =>
  jwt.sign(
    {
      id: String(user.id),
      email: user.email,
      username: user.username,
      isAdmin: Boolean(user.isAdmin),
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

const cleanUser = (user) => ({
  id: String(user.id),
  username: user.username,
  email: user.email,
  isAdmin: Boolean(user.isAdmin),
})

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Verify your email for Typing Website',
    html: `
      <p>Hi,</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export const signup = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed', errors: errors.array() })
  }

  const username = String(req.body.username || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  try {
    const existingEmail = await User.findOne({ email }).lean()
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const existingUsername = await User.findOne({
      username: { $regex: `^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    }).lean()
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      isAdmin: false,
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Still create user, but log error
    }

    // Keep local JSON user store in sync for local-db workflows.
    const localByEmail = await localDb.findUserByEmail(email)
    const localByUsername = await localDb.findUserByUsername(username)
    if (!localByEmail && !localByUsername) {
      await localDb.createUser({
        username,
        email,
        password: user.password,
      })
    }

    // Do not return JWT token until email is verified
    return res.status(201).json({ message: 'User created. Please check your email to verify your account.' })
  } catch (error) {
    console.error('signup error:', error)
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return res.status(409).json({ message: 'Username already taken' })
    }
    return res.status(500).json({ message: 'Server error while signing up' })
  }
}

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed', errors: errors.array() })
  }

  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' })
    }

    const payload = cleanUser(user)
    const token = tokenForUser(payload)
    return res.json({ token, user: payload, storage: 'mongodb' })
  } catch (error) {
    console.error('login error:', error)
    return res.status(500).json({ message: 'Server error while logging in' })
  }
}

export const verifyEmail = async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' })
  }

  try {
    const user = await User.findOne({ verificationToken: token })
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' })
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    user.emailVerified = true
    user.verificationToken = undefined // Clear token
    await user.save()

    return res.json({ message: 'Email verified successfully. You can now log in.' })
  } catch (error) {
    console.error('verifyEmail error:', error)
    return res.status(500).json({ message: 'Server error while verifying email' })
  }
}

export const adminLogin = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email: String(email).toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'This account does not have admin access' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    const payload = cleanUser(user)
    const token = tokenForUser(payload)
    return res.json({ token, user: payload, storage: 'mongodb' })
  } catch (error) {
    console.error('adminLogin error:', error)
    return res.status(500).json({ message: 'Server error while logging in admin' })
  }
}
