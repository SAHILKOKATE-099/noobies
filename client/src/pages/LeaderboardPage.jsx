import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import LeaderboardTable from '../components/LeaderboardTable'
import { api } from '../utils/api'

export default function LeaderboardPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await api.get('/leaderboard')
        setRows(data)
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchBoard()
  }, [])

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {loading ? <p className="text-sm text-[var(--text-muted)]">Loading leaderboard...</p> : <LeaderboardTable rows={rows} />}
    </motion.main>
  )
}
