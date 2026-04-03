import { useEffect, useMemo, useRef, useState } from 'react'
import { api, authHeader } from '../utils/api'

const BOT_NAMES = [
  'Rapid Raven',
  'Neon Striker',
  'Echo Sprint',
  'Ghost Keys',
  'Turbo Fox',
  'Volt Rider',
  'Circuit Hawk',
  'Pixel Ronin',
]

const randomBots = (count = 4) => [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, count)

const createPlayers = (username) =>
  [username || 'You', ...randomBots()].map((name, index) => ({
    id: `${name}-${index}`,
    name,
    progress: 0,
    speed: index === 0 ? 1.35 + Math.random() * 0.5 : 1.1 + Math.random() * 0.8,
    winner: false,
  }))

export default function MultiplayerMode({ user, token }) {
  const [players, setPlayers] = useState(() => createPlayers(user?.username))
  const [status, setStatus] = useState('idle')
  const [winnerName, setWinnerName] = useState('')
  const [message, setMessage] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingBoard, setLoadingBoard] = useState(true)
  const raceRef = useRef(null)

  const raceTitle = useMemo(() => {
    if (status === 'running') return 'Race in progress...'
    if (status === 'finished') return `Winner: ${winnerName}`
    return 'Multiplayer Race (5 Players)'
  }, [status, winnerName])

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingBoard(true)
      try {
        const { data } = await api.get('/race-leaderboard')
        setLeaderboard(Array.isArray(data) ? data : [])
      } catch {
        setLeaderboard([])
      } finally {
        setLoadingBoard(false)
      }
    }

    loadLeaderboard()
  }, [])

  useEffect(
    () => () => {
      if (raceRef.current) clearInterval(raceRef.current)
    },
    [],
  )

  const saveWinnerPoint = async (name) => {
    if (!token) {
      setMessage('Login to save winner points globally.')
      return
    }

    try {
      const { data } = await api.post('/race-point', { winnerName: name }, authHeader(token))
      setLeaderboard(Array.isArray(data?.leaderboard) ? data.leaderboard : [])
      setMessage(`${name} got +1 point.`)
    } catch {
      setMessage('Race finished, but saving points failed.')
    }
  }

  const startRace = () => {
    if (status === 'running') return
    if (raceRef.current) clearInterval(raceRef.current)

    setStatus('running')
    setWinnerName('')
    setMessage('')
    setPlayers((prev) => prev.map((p) => ({ ...p, progress: 0, winner: false })))

    raceRef.current = setInterval(() => {
      setPlayers((prevPlayers) => {
        let winner = null

        const next = prevPlayers.map((player) => {
          const boost = 0.45 + Math.random() * 0.85
          const progress = Math.min(100, player.progress + player.speed * boost)
          if (!winner && progress >= 100) winner = player.name
          return { ...player, progress }
        })

        if (winner) {
          clearInterval(raceRef.current)
          raceRef.current = null
          setStatus('finished')
          setWinnerName(winner)
          saveWinnerPoint(winner)
          return next.map((player) => ({ ...player, winner: player.name === winner }))
        }

        return next
      })
    }, 100)
  }

  const resetRace = () => {
    if (raceRef.current) {
      clearInterval(raceRef.current)
      raceRef.current = null
    }
    setPlayers(createPlayers(user?.username))
    setStatus('idle')
    setWinnerName('')
    setMessage('')
  }

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{raceTitle}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          You race against 4 players. Winner gets 1 global point.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startRace}
            disabled={status === 'running'}
            className="rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'running' ? 'Race Running...' : 'Start Race'}
          </button>
          <button
            type="button"
            onClick={resetRace}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
          >
            Reset Players
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-[var(--accent)]">{message}</p> : null}
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Track</h3>
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={player.winner ? 'font-bold text-[var(--ok)]' : 'text-[var(--text-primary)]'}>
                  {player.name}
                </span>
                <span className="text-[var(--text-muted)]">{Math.round(player.progress)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/15">
                <div
                  className={`h-full rounded-full transition-all ${
                    player.winner
                      ? 'bg-[linear-gradient(90deg,var(--ok),var(--accent))]'
                      : 'bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]'
                  }`}
                  style={{ width: `${player.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">Global Race Leaderboard</h3>
        {loadingBoard ? <p className="text-sm text-[var(--text-muted)]">Loading...</p> : null}
        {!loadingBoard && leaderboard.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No race points yet.</p>
        ) : null}
        {!loadingBoard && leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/20 text-[var(--text-muted)]">
                  <th className="py-2">#</th>
                  <th className="py-2">Player</th>
                  <th className="py-2">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-b border-white/10 text-[var(--text-primary)]">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2 font-semibold">{row.name}</td>
                    <td className="py-2">{Number(row.points || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
