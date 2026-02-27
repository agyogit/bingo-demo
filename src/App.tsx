import { useState } from 'react'
import { CategoryId, GameState, WinningLine } from './types'
import { LandingPage } from './components/LandingPage'
import { CategorySelect } from './components/CategorySelect'
import { GameBoard } from './components/GameBoard'
import { WinScreen } from './components/WinScreen'
import { useLocalStorage } from './hooks/useLocalStorage'

type Screen = 'landing' | 'category' | 'game' | 'win'

const EMPTY_GAME: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
}

export default function App() {
  const [savedGame, setSavedGame] = useLocalStorage<GameState>('meeting-bingo-game', EMPTY_GAME)

  // Determine initial screen from persisted state
  const [screen, setScreen] = useState<Screen>(() => {
    if (savedGame.status === 'playing') return 'game'
    if (savedGame.status === 'won') return 'win'
    return 'landing'
  })

  const [winGame, setWinGame] = useState<GameState>(
    savedGame.status === 'won' ? savedGame : EMPTY_GAME,
  )

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSavedGame({ ...EMPTY_GAME, status: 'playing', category: categoryId })
    setScreen('game')
  }

  const handleWin = (line: WinningLine, word: string) => {
    const next: GameState = {
      ...savedGame,
      status: 'won',
      completedAt: Date.now(),
      winningLine: line,
      winningWord: word,
    }
    setWinGame(next)
    setSavedGame(next)
    setScreen('win')
  }

  const handlePlayAgain = () => {
    setScreen('category')
  }

  const handleHome = () => {
    setSavedGame(EMPTY_GAME)
    setScreen('landing')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {screen === 'landing' && <LandingPage onStart={() => setScreen('category')} />}

      {screen === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={() => setScreen('landing')} />
      )}

      {screen === 'game' && (
        <GameBoard
          savedGame={savedGame}
          onWin={handleWin}
          onNewGame={handleHome}
          persistGame={setSavedGame}
        />
      )}

      {screen === 'win' && (
        <WinScreen game={winGame} onPlayAgain={handlePlayAgain} onHome={handleHome} />
      )}
    </div>
  )
}
