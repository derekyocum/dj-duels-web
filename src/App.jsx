import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DuelLayout from './components/DuelLayout'
import LoungeLayout from './components/LoungeLayout'
import Landing from './pages/Landing'
import Lounge from './pages/Lounge'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Privacy from './pages/Privacy'
import Support from './pages/Support'
import Lobby from './pages/Lobby'
import Faceoff from './pages/Faceoff'
import Stage from './pages/Stage'
import Champion from './pages/Champion'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Leaderboard from './pages/Leaderboard'
import Matchmaking from './pages/Matchmaking'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* All in-duel pages share ONE socket via DuelLayout — see DuelLayout.jsx */}
          <Route element={<DuelLayout />}>
            <Route path="/lobby/:duelId" element={<Lobby />} />
            <Route path="/duel/:duelId/round/:roundNum" element={<Faceoff />} />
            <Route path="/duel/:duelId/round/:roundNum/stage" element={<Stage />} />
            <Route path="/duel/:duelId/champion" element={<Champion />} />
          </Route>
          {/* Same one-socket-above-the-page arrangement as DuelLayout */}
          <Route element={<LoungeLayout />}>
            <Route path="/lounge/:loungeId" element={<Lounge />} />
          </Route>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
