import fs from 'node:fs/promises'
import path from 'node:path'

const LOCAL_DB_PATH = path.resolve(process.cwd(), 'data/local-db.json')

const defaultShape = { users: [], results: [], race_points: [] }

const readLocalDb = async () => {
  try {
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8')
    const parsed = JSON.parse(content)
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      results: Array.isArray(parsed.results) ? parsed.results : [],
      race_points: Array.isArray(parsed.race_points) ? parsed.race_points : [],
    }
  } catch {
    return defaultShape
  }
}

const writeLocalDb = async (data) => {
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export const localDb = {
  async findUserByEmail(email) {
    const db = await readLocalDb()
    return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
  },

  async findUserByUsername(username) {
    const db = await readLocalDb()
    return (
      db.users.find((user) => user.username.toLowerCase() === String(username).toLowerCase()) || null
    )
  },

  async createUser({ username, email, password }) {
    const db = await readLocalDb()
    const nextId = db.users.length ? Math.max(...db.users.map((user) => user.id)) + 1 : 1

    const user = {
      id: nextId,
      username,
      email,
      password,
      created_at: new Date().toISOString(),
    }

    db.users.push(user)
    await writeLocalDb(db)
    return user
  },

  async insertResult({ user_id, wpm, accuracy, time_taken }) {
    const db = await readLocalDb()
    const nextId = db.results.length ? Math.max(...db.results.map((result) => result.id)) + 1 : 1

    const result = {
      id: nextId,
      user_id,
      wpm,
      accuracy,
      time_taken,
      created_at: new Date().toISOString(),
    }

    db.results.push(result)
    await writeLocalDb(db)
    return result
  },

  async getUserResults(userId) {
    const db = await readLocalDb()
    return db.results
      .filter((row) => row.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async getLeaderboard() {
    const db = await readLocalDb()
    const usersById = new Map(db.users.map((user) => [user.id, user]))

    const bestByUser = new Map()

    for (const row of db.results) {
      const prev = bestByUser.get(row.user_id)
      if (!prev || row.wpm > prev.wpm || (row.wpm === prev.wpm && row.accuracy > prev.accuracy)) {
        bestByUser.set(row.user_id, row)
      }
    }

    return [...bestByUser.values()]
      .map((row) => ({
        ...row,
        username: usersById.get(row.user_id)?.username || 'Unknown',
      }))
      .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
      .slice(0, 10)
  },

  async addRacePoint(winnerName) {
    const db = await readLocalDb()
    const safeName = String(winnerName || '').trim()
    if (!safeName) {
      throw new Error('winnerName is required')
    }

    const existing = db.race_points.find(
      (entry) => entry.name.toLowerCase() === safeName.toLowerCase(),
    )

    if (existing) {
      existing.points = Number(existing.points || 0) + 1
      existing.updated_at = new Date().toISOString()
    } else {
      db.race_points.push({
        name: safeName,
        points: 1,
        updated_at: new Date().toISOString(),
      })
    }

    await writeLocalDb(db)
    return db.race_points
      .map((entry) => ({
        name: entry.name,
        points: Number(entry.points || 0),
        updated_at: entry.updated_at,
      }))
      .sort((a, b) => b.points - a.points || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 20)
  },

  async getRaceLeaderboard() {
    const db = await readLocalDb()
    return db.race_points
      .map((entry) => ({
        name: entry.name,
        points: Number(entry.points || 0),
        updated_at: entry.updated_at,
      }))
      .sort((a, b) => b.points - a.points || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 20)
  },
}
