import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Lobby from './pages/Lobby'
import Faceoff from './pages/Faceoff'
import Stage from './pages/Stage'
import RoundWinner from './pages/RoundWinner'
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
          <Route path="/lobby/:duelId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
          <Route path="/duel/:duelId/round/:roundNum" element={<ProtectedRoute><Faceoff /></ProtectedRoute>} />
          <Route path="/duel/:duelId/round/:roundNum/stage" element={<ProtectedRoute><Stage /></ProtectedRoute>} />
          <Route path="/duel/:duelId/round/:roundNum/winner" element={<ProtectedRoute><RoundWinner /></ProtectedRoute>} />
          <Route path="/duel/:duelId/champion" element={<ProtectedRoute><Champion /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
