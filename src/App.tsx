import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell.tsx'
import { DayPage } from '@/pages/day-page.tsx'
import { SettingsPage } from '@/pages/settings-page.tsx'
import { TrendsPage } from '@/pages/trends-page.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DayPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
