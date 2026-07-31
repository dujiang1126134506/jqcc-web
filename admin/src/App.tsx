import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import SeasonPage from './pages/SeasonPage'
import TeamPage from './pages/TeamPage'
import PlayerPage from './pages/PlayerPage'
import ScorePage from './pages/ScorePage'
import ImportPage from './pages/ImportPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="seasons" element={<SeasonPage />} />
        <Route path="teams" element={<TeamPage />} />
        <Route path="players" element={<PlayerPage />} />
        <Route path="scores" element={<ScorePage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
