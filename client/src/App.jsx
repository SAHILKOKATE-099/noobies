import { Navigate, Route, Routes } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const { theme, setTheme } = useTheme()
  const { user, isAdmin } = useAuth()

  return (
    <div className="page-shell mx-auto min-h-screen max-w-6xl px-3 py-4 sm:px-6">
      <Navbar theme={theme} onThemeChange={setTheme} user={user} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/auth" replace />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
