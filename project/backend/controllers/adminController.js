import { Result } from '../models/Result.js'

export const getAdminScores = async (_req, res) => {
  try {
    const rows = await Result.find({})
      .populate({ path: 'user_id', select: 'username email isAdmin' })
      .sort({ created_at: -1 })
      .limit(200)
      .lean()

    const response = rows
      .filter((row) => row.user_id)
      .map((row) => ({
        id: String(row._id),
        username: row.user_id.username,
        email: row.user_id.email,
        is_admin: row.user_id.isAdmin,
        wpm: Number(row.wpm),
        accuracy: Number(row.accuracy),
        time_taken: Number(row.time_taken),
        created_at: row.created_at,
      }))

    return res.json(response)
  } catch (error) {
    console.error('getAdminScores error:', error)
    return res.status(500).json({
      message: 'Failed to fetch scores from MongoDB. Check connection and retry.',
    })
  }
}
