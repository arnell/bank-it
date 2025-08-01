import './App.css'
import { GameProvider } from './context/GameContext'
import { useGame } from './hooks/useGame'
import SetupScreen from './components/SetupScreen'
import GameScreen from './components/GameScreen'
import EndGameScreen from './components/EndGameScreen'

// Main App component that uses the GameProvider
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

// Inner component that uses the game context
function AppContent() {
  const { gameState } = useGame()
  
  // Render the appropriate screen based on game state
  return (
    <div className="app-container">
      {!gameState.isGameStarted && <SetupScreen />}
      {gameState.isGameStarted && !gameState.isGameOver && <GameScreen />}
      {gameState.isGameOver && <EndGameScreen />}
    </div>
  )
}

export default App
