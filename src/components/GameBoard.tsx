import { useCallback, useEffect } from 'react'
import { GameState, WinningLine } from '../types'
import { BingoCard } from './BingoCard'
import { TranscriptPanel } from './TranscriptPanel'
import { Button } from './ui/Button'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useGame } from '../hooks/useGame'
import { getClosestToWin } from '../lib/bingoChecker'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'

interface GameBoardProps {
  savedGame: GameState
  onWin: (line: WinningLine, word: string) => void
  onNewGame: () => void
  persistGame: (state: GameState) => void
}

export function GameBoard({ savedGame, onWin, onNewGame, persistGame }: GameBoardProps) {
  const { toasts, addToast, dismissToast } = useToast()

  const handleWin = useCallback(
    (line: WinningLine, word: string) => {
      onWin(line, word)
    },
    [onWin],
  )

  const {
    game,
    detectedWords,
    startGame,
    newCard,
    handleSquareClick,
    handleTranscriptResult,
    setListening,
    restoreGame,
  } = useGame(handleWin, persistGame)

  const speech = useSpeechRecognition()

  // Restore saved game on mount
  useEffect(() => {
    if (savedGame.status === 'playing' && savedGame.card) {
      restoreGame(savedGame)
    } else if (savedGame.category) {
      startGame(savedGame.category)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show toast when words detected
  useEffect(() => {
    if (detectedWords.length > 0) {
      const latest = detectedWords[detectedWords.length - 1]
      addToast(`✨ Detected: "${latest}"`, 'success', 2000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedWords.length])

  // Show error toasts
  useEffect(() => {
    if (speech.error) addToast(speech.error, 'warning')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.error])

  const toggleListening = () => {
    if (speech.isListening) {
      speech.stopListening()
      setListening(false)
    } else {
      speech.startListening(handleTranscriptResult)
      setListening(true)
    }
  }

  const card = game.card
  const filledCount = Math.max(0, game.filledCount - 1) // subtract free space for display
  const closest = card ? getClosestToWin(card) : null
  const oneAway = closest?.needed === 1

  if (!card) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">🎯 Meeting Bingo</span>
          <div className="flex items-center gap-3">
            {speech.isListening && (
              <div className="flex items-center gap-1.5 text-sm text-red-500">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Listening
              </div>
            )}
            <span className="text-sm text-gray-500 font-medium">{filledCount}/24</span>
          </div>
        </div>
      </header>

      <main className="max-w-sm mx-auto px-4 py-4">
        {/* One away banner */}
        {oneAway && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-2 mb-3 text-sm font-medium text-center animate-bounce-in">
            ⚡ One away from BINGO!
          </div>
        )}

        <BingoCard
          card={card}
          winningLine={game.winningLine}
          onSquareClick={handleSquareClick}
        />

        {/* Speech panel */}
        {speech.isSupported ? (
          <TranscriptPanel
            transcript={speech.transcript}
            interimTranscript={speech.interimTranscript}
            detectedWords={detectedWords}
            isListening={speech.isListening}
          />
        ) : (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            Manual mode — tap squares to mark words. (Speech recognition not available in this browser.)
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={newCard} className="flex-1">
            🔄 New Card
          </Button>
          {speech.isSupported && (
            <Button
              variant={speech.isListening ? 'secondary' : 'primary'}
              onClick={toggleListening}
              className="flex-1"
            >
              {speech.isListening ? '⏹ Stop' : '🎤 Listen'}
            </Button>
          )}
          <Button variant="ghost" onClick={onNewGame}>
            ✕
          </Button>
        </div>
      </main>
    </div>
  )
}
