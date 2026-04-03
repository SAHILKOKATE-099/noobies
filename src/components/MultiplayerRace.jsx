import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { onValue, ref, set, update } from 'firebase/database'
import { realtimeDb } from '../utils/firebase'

const randomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export default function MultiplayerRace({ user, progress, wpm, finished }) {
  const [joinCode, setJoinCode] = useState('')
  const [activeRoom, setActiveRoom] = useState('')
  const [roomData, setRoomData] = useState(null)

  const userId = user?.id || 'guest-user'
  const userName = user?.name || 'Guest'

  useEffect(() => {
    if (!realtimeDb || !activeRoom) return undefined

    const roomRef = ref(realtimeDb, `races/${activeRoom}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      setRoomData(snapshot.val())
    })

    return () => unsubscribe()
  }, [activeRoom])

  useEffect(() => {
    if (!realtimeDb || !activeRoom) return

    const playerRef = ref(realtimeDb, `races/${activeRoom}/players/${userId}`)
    update(playerRef, {
      name: userName,
      progress: Number(progress.toFixed(2)),
      wpm: Number(wpm.toFixed(0)),
      finished,
      updatedAt: Date.now(),
    })
  }, [activeRoom, finished, progress, userId, userName, wpm])

  const createRoom = async () => {
    if (!realtimeDb) return

    const code = randomCode()
    const roomRef = ref(realtimeDb, `races/${code}`)

    await set(roomRef, {
      createdAt: Date.now(),
      players: {
        [userId]: {
          name: userName,
          progress: 0,
          wpm: 0,
          finished: false,
          updatedAt: Date.now(),
        },
      },
    })

    setActiveRoom(code)
    setJoinCode(code)
  }

  const joinRoom = async () => {
    if (!realtimeDb || !joinCode.trim()) return

    const code = joinCode.trim().toUpperCase()
    const playerRef = ref(realtimeDb, `races/${code}/players/${userId}`)

    await update(playerRef, {
      name: userName,
      progress: 0,
      wpm: 0,
      finished: false,
      updatedAt: Date.now(),
    })

    setActiveRoom(code)
  }

  const players = useMemo(() => {
    if (!roomData?.players) return []

    return Object.entries(roomData.players)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.progress - a.progress)
  }, [roomData])

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-4"
    >
      <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">Multiplayer Race (Bonus)</h2>

      {!realtimeDb ? (
        <p className="text-xs text-[var(--text-muted)]">
          Add `VITE_FIREBASE_DATABASE_URL` to enable real-time racing.
        </p>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={createRoom}
              className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"
            >
              Create Room
            </button>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="ROOM"
              className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <button
              type="button"
              onClick={joinRoom}
              className="rounded-xl bg-[var(--accent-2)] px-3 py-2 text-xs font-semibold text-white"
            >
              Join
            </button>
          </div>

          <p className="mb-2 text-xs text-[var(--text-muted)]">
            Active room: {activeRoom || 'None'}
          </p>

          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="rounded-xl border border-white/20 bg-white/10 p-2">
                <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-primary)]">
                  <span>{player.name}</span>
                  <span>{player.wpm} WPM</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                    style={{ width: `${Math.min(player.progress || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.section>
  )
}
