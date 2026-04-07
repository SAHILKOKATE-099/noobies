import { validationResult } from 'express-validator'
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'
import { Result } from '../models/Result.js'
import { localDb } from '../utils/localDb.js'

const mapResultRow = (row) => ({
  id: String(row._id),
  wpm: Number(row.wpm),
  accuracy: Number(row.accuracy),
  time_taken: Number(row.time_taken),
  created_at: row.created_at,
})

const fetchUserHistoryRows = async (userId) => {
  const rows = await Result.find({ user_id: userId }).sort({ created_at: -1 }).lean()
  return rows.map(mapResultRow)
}

const buildSummary = (rows) => {
  if (!rows.length) {
    return {
      bestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      tests: 0,
    }
  }

  const totalWpm = rows.reduce((sum, row) => sum + Number(row.wpm || 0), 0)
  const totalAccuracy = rows.reduce((sum, row) => sum + Number(row.accuracy || 0), 0)

  return {
    bestWpm: Math.max(...rows.map((row) => Number(row.wpm || 0))),
    avgWpm: totalWpm / rows.length,
    avgAccuracy: totalAccuracy / rows.length,
    tests: rows.length,
  }
}

const buildPdfBuffer = ({ user, rows, summary }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'A4' })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(22).text('Noobies Typing Report')
    doc.moveDown(0.4)
    doc.fontSize(11).fillColor('#475569').text(`User: ${user.username || user.email || 'Unknown'}`)
    doc.text(`Email: ${user.email || 'N/A'}`)
    doc.text(`Generated: ${new Date().toLocaleString()}`)

    doc.moveDown(1)
    doc.fillColor('#111827').fontSize(14).text('Summary')
    doc.moveDown(0.4)
    doc.fontSize(11).text(`Tests: ${summary.tests}`)
    doc.text(`Best WPM: ${summary.bestWpm.toFixed(0)}`)
    doc.text(`Average WPM: ${summary.avgWpm.toFixed(1)}`)
    doc.text(`Average Accuracy: ${summary.avgAccuracy.toFixed(1)}%`)

    doc.moveDown(1)
    doc.fontSize(14).text('Recent Sessions')
    doc.moveDown(0.4)
    doc.fontSize(10).fillColor('#0f172a')

    rows.slice(0, 15).forEach((row, index) => {
      const createdAt = row.created_at ? new Date(row.created_at).toLocaleString() : '-'
      const line = `${index + 1}. WPM ${Number(row.wpm || 0).toFixed(0)} | Accuracy ${Number(
        row.accuracy || 0,
      ).toFixed(1)}% | Time ${Number(row.time_taken || 0)}s | ${createdAt}`
      doc.text(line)
    })

    doc.end()
  })

export const saveScore = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }

  const { wpm, accuracy, time_taken } = req.body

  try {
    await Result.create({
      user_id: req.user.id,
      wpm,
      accuracy,
      time_taken,
    })

    return res.status(201).json({ message: 'Score saved', storage: 'mongodb' })
  } catch (error) {
    console.error('saveScore error:', error)
    return res.status(500).json({ message: 'Failed to save score' })
  }
}

export const getLeaderboard = async (_req, res) => {
  try {
    const rows = await Result.find({})
      .populate({ path: 'user_id', select: 'username' })
      .sort({ wpm: -1, accuracy: -1, created_at: -1 })
      .lean()

    const seen = new Set()
    const top = []

    for (const row of rows) {
      const user = row.user_id
      if (!user?._id || seen.has(String(user._id))) {
        continue
      }

      seen.add(String(user._id))
      top.push({
        id: String(row._id),
        username: user.username,
        wpm: Number(row.wpm),
        accuracy: Number(row.accuracy),
        time_taken: Number(row.time_taken),
        created_at: row.created_at,
      })

      if (top.length >= 10) {
        break
      }
    }

    return res.json(top)
  } catch (error) {
    console.error('getLeaderboard error:', error)
    return res.status(500).json({ message: 'Failed to fetch leaderboard' })
  }
}

export const getUserHistory = async (req, res) => {
  try {
    const rows = await fetchUserHistoryRows(req.user.id)
    return res.json(rows)
  } catch (error) {
    console.error('getUserHistory error:', error)
    return res.status(500).json({ message: 'Failed to fetch user history' })
  }
}

export const emailUserReport = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'

  if (!smtpUser || !smtpPass) {
    return res.status(503).json({
      message:
        'Email service is not configured. Set SMTP_USER and SMTP_PASS in server environment.',
    })
  }

  const recipientEmail = req.body.email || req.user.email

  if (!recipientEmail) {
    return res.status(400).json({ message: 'No recipient email available for this account' })
  }

  try {
    const rows = await fetchUserHistoryRows(req.user.id)
    const summary = buildSummary(rows)
    const pdfBuffer = await buildPdfBuffer({
      user: req.user,
      rows,
      summary,
    })

    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transport.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: recipientEmail,
      subject: 'Your Noobies Typing Report',
      text: 'Attached is your latest typing report PDF from Noobies.',
      attachments: [
        {
          filename: `noobies-report-${req.user.username || 'user'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    return res.json({ message: `Noobies report sent to ${recipientEmail}` })
  } catch (error) {
    console.error('emailUserReport error:', error)
    return res.status(500).json({ message: 'Failed to generate or send email report' })
  }
}

export const downloadUserReportPdf = async (req, res) => {
  try {
    const rows = await fetchUserHistoryRows(req.user.id)
    const summary = buildSummary(rows)
    const pdfBuffer = await buildPdfBuffer({
      user: req.user,
      rows,
      summary,
    })

    const fileName = `noobies-report-${req.user.username || 'user'}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    return res.send(pdfBuffer)
  } catch (error) {
    console.error('downloadUserReportPdf error:', error)
    return res.status(500).json({ message: 'Failed to generate PDF report' })
  }
}

export const getRaceLeaderboard = async (_req, res) => {
  try {
    const rows = await localDb.getRaceLeaderboard()
    return res.json(rows)
  } catch (error) {
    console.error('getRaceLeaderboard error:', error)
    return res.status(500).json({ message: 'Failed to fetch race leaderboard' })
  }
}

export const awardRacePoint = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }

  const winnerName = String(req.body.winnerName || '').trim()
  if (!winnerName) {
    return res.status(400).json({ message: 'winnerName is required' })
  }

  try {
    const rows = await localDb.addRacePoint(winnerName)
    return res.status(201).json({ winnerName, leaderboard: rows })
  } catch (error) {
    console.error('awardRacePoint error:', error)
    return res.status(500).json({ message: 'Failed to award race point' })
  }
}
