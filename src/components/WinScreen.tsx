import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { GameState } from '../types'
import { BingoCard } from './BingoCard'
import { Button } from './ui/Button'
import { CATEGORIES } from '../data/categories'
import { shareResult } from '../lib/shareUtils'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'

interface WinScreenProps {
  game: GameState
  onPlayAgain: () => void
  onHome: () => void
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  return minutes <= 1 ? '1 minute' : `${minutes} minutes`
}

export function WinScreen({ game, onPlayAgain, onHome }: WinScreenProps) {
  const { toasts, addToast, dismissToast } = useToast()
  const category = CATEGORIES.find(c => c.id === game.category)
  const duration =
    game.startedAt && game.completedAt
      ? formatDuration(game.completedAt - game.startedAt)
      : null

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.3 },
    })
  }, [])

  const handleShare = async () => {
    const result = await shareResult(game)
    if (result === 'shared') addToast('✅ Shared!', 'success')
    else if (result === 'copied') addToast('✅ Copied to clipboard!', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-sm w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-bounce-in">
          🎉 BINGO! 🎉
        </h1>
        <p className="text-gray-500 mb-6">You won!</p>

        {game.card && (
          <div className="mb-6">
            <BingoCard
              card={game.card}
              winningLine={game.winningLine}
              onSquareClick={() => {}}
            />
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 text-left space-y-2">
          {duration && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">⏱ Time to BINGO</span>
              <span className="font-medium text-gray-900">{duration}</span>
            </div>
          )}
          {game.winningWord && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">🏆 Winning word</span>
              <span className="font-medium text-gray-900">"{game.winningWord}"</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">📊 Squares filled</span>
            <span className="font-medium text-gray-900">{Math.max(0, game.filledCount - 1)}/24</span>
          </div>
          {category && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">📂 Category</span>
              <span className="font-medium text-gray-900">{category.icon} {category.name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleShare} className="flex-1">
            📤 Share
          </Button>
          <Button onClick={onPlayAgain} className="flex-1">
            🔄 Play Again
          </Button>
        </div>

        <button
          onClick={onHome}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
