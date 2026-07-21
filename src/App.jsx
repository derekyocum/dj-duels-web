import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DuelLayout from './components/DuelLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Lobby from './pages/Lobby'
import Faceoff from './pages/Faceoff'
import Stage from './pages/Stage'
import Champion from './pages/Champion'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* All in-duel pages share ONE socket via DuelLayout — see DuelLayout.jsx */}
          <Route element={<DuelLayout />}>
            <Route path="/lobby/:duelId" element={<Lobby />} />
            <Route path="/duel/:duelId/round/:roundNum" element={<Faceoff />} />
            <Route path="/duel/:duelId/round/:roundNum/stage" element={<Stage />} />
            <Route path="/duel/:duelId/champion" element={<Champion />} />
          </Route>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
