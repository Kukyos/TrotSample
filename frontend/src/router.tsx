import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './App'
import { useAuth } from './auth/auth-context'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { CreateTripPage } from './pages/CreateTripPage'
import { BuildItineraryPage } from './pages/BuildItineraryPage'
import { ItineraryViewPage } from './pages/ItineraryViewPage'
import { ExplorePage } from './pages/ExplorePage'
import { CalendarPage } from './pages/CalendarPage'
import { CommunityPage } from './pages/CommunityPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'

export function AppRoutes() {
  const { status, viewer } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage authStatus={status} viewer={viewer} />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:tripId" element={<ItineraryViewPage />} />
          <Route path="/trips/:tripId/build" element={<BuildItineraryPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
