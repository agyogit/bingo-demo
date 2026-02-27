import { GameState } from '../types'
import { CATEGORIES } from '../data/categories'

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}

export function buildShareText(game: GameState): string {
  const category = CATEGORIES.find(c => c.id === game.category)
  const duration =
    game.startedAt && game.completedAt
      ? formatDuration(game.completedAt - game.startedAt)
      : 'unknown'
  const filled = (game.filledCount - 1) // subtract free space

  return [
    `🎯 BINGO! I won Meeting Bingo!`,
    `Category: ${category?.name ?? game.category}`,
    `Time: ${duration} | Winning word: "${game.winningWord}"`,
    `${filled}/24 squares filled`,
    ``,
    `Play at: https://bingo-demo-three.vercel.app`,
  ].join('\n')
}

export async function shareResult(game: GameState): Promise<'shared' | 'copied' | 'fallback'> {
  const text = buildShareText(game)

  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch {
      // user cancelled or share failed, fall through
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    // clipboard blocked
  }

  window.prompt('Copy your result:', text)
  return 'fallback'
}
