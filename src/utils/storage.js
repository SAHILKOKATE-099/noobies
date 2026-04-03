import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import {
  DUMMY_LEADERBOARD,
  LEADERBOARD_STORAGE_KEY,
  USER_HISTORY_PREFIX,
  USER_PROFILE_KEY,
} from './constants'
import { db } from './firebase'

const safeParse = (value, fallback = []) => {
  if (!value) return fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const sortScores = (scores) => {
  return [...scores].sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm
    return b.accuracy - a.accuracy
  })
}

export const ensureDummyLeaderboardData = () => {
  const existing = safeParse(localStorage.getItem(LEADERBOARD_STORAGE_KEY), null)
  if (existing?.length) return
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(DUMMY_LEADERBOARD))
}

export const getLocalLeaderboard = () => {
  ensureDummyLeaderboardData()
  return sortScores(safeParse(localStorage.getItem(LEADERBOARD_STORAGE_KEY)))
}

export const saveLocalLeaderboard = (scores) => {
  const topScores = sortScores(scores).slice(0, 25)
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(topScores))
  return topScores
}

export const getLeaderboard = async () => {
  const localScores = getLocalLeaderboard()

  if (!db) {
    return localScores
  }

  try {
    const scoreRef = collection(db, 'leaderboard')
    const scoreQuery = query(scoreRef, orderBy('wpm', 'desc'), limit(25))
    const snapshot = await getDocs(scoreQuery)

    if (!snapshot.size) {
      return localScores
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch {
    return localScores
  }
}

export const saveScore = async (scoreEntry) => {
  const localScores = getLocalLeaderboard()
  const mergedLocal = saveLocalLeaderboard([scoreEntry, ...localScores])

  if (!db) {
    return mergedLocal
  }

  try {
    await addDoc(collection(db, 'leaderboard'), {
      ...scoreEntry,
      createdAt: serverTimestamp(),
    })
  } catch {
    return mergedLocal
  }

  return mergedLocal
}

export const getUserHistory = (userId) => {
  if (!userId) return []
  const key = `${USER_HISTORY_PREFIX}${userId}`
  return safeParse(localStorage.getItem(key))
}

export const saveUserHistoryEntry = (userId, scoreEntry) => {
  if (!userId) return []

  const key = `${USER_HISTORY_PREFIX}${userId}`
  const history = getUserHistory(userId)
  const updated = [scoreEntry, ...history].slice(0, 50)
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

export const getGuestProfile = () => {
  return localStorage.getItem(USER_PROFILE_KEY) || 'Guest Typist'
}

export const saveGuestProfile = (name) => {
  localStorage.setItem(USER_PROFILE_KEY, name)
}
