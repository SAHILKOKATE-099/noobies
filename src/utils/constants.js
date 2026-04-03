export const TIME_OPTIONS = [30, 60, 120]
export const WORD_OPTIONS = [25, 50, 100]

export const DEFAULT_MODE = {
  type: 'time',
  value: 60,
}

export const LEADERBOARD_STORAGE_KEY = 'typeflow:leaderboard'
export const USER_HISTORY_PREFIX = 'typeflow:history:'
export const USER_PROFILE_KEY = 'typeflow:guest-profile'

export const DUMMY_LEADERBOARD = [
  {
    id: 'seed-1',
    name: 'Ava',
    wpm: 92,
    accuracy: 98.4,
    mode: '60s',
    createdAt: '2026-02-11T10:12:00.000Z',
  },
  {
    id: 'seed-2',
    name: 'Noah',
    wpm: 88,
    accuracy: 96.9,
    mode: '50 words',
    createdAt: '2026-02-17T09:05:00.000Z',
  },
  {
    id: 'seed-3',
    name: 'Mia',
    wpm: 83,
    accuracy: 97.1,
    mode: '120s',
    createdAt: '2026-03-01T16:30:00.000Z',
  },
]
