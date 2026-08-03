import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AdminLayout from './layouts/AdminLayout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const SeasonPage = lazy(() => import('./pages/SeasonPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const ScorePage = lazy(() => import('./pages/ScorePage'))
const ImportPage = lazy(() => import('./pages/ImportPage'))

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
    <Spin size="large" />
  </div>
)

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
