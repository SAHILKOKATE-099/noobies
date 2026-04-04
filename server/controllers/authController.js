import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import { User } from '../models/User.js'

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
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
    })

    const payload = cleanUser(user)
    const token = tokenForUser(payload)
    return res.status(201).json({ token, user: payload, storage: 'mongodb' })
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

    const payload = cleanUser(user)
    const token = tokenForUser(payload)
    return res.json({ token, user: payload, storage: 'mongodb' })
  } catch (error) {
    console.error('login error:', error)
    return res.status(500).json({ message: 'Server error while logging in' })
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
