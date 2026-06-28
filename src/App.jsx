import { BrowserRouter, Routes, Route } from 'react-router'
import Landing from './pages/Landing'
import Lobby from './pages/Lobby'
import Faceoff from './pages/Faceoff'
import Stage from './pages/Stage'
import RoundWinner from './pages/RoundWinner'
import Champion from './pages/Champion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lobby/:duelId" element={<Lobby />} />
        <Route path="/duel/:duelId/round/:roundNum" element={<Faceoff />} />
        <Route path="/duel/:duelId/round/:roundNum/stage" element={<Stage />} />
        <Route path="/duel/:duelId/round/:roundNum/winner" element={<RoundWinner />} />
        <Route path="/duel/:duelId/champion" element={<Champion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
