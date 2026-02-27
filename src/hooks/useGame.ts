import { useCallback, useRef, useState } from 'react'
import { BingoCard, CategoryId, GameState, WinningLine } from '../types'
import { generateCard } from '../lib/cardGenerator'
import { checkForBingo, countFilled } from '../lib/bingoChecker'
import { detectWordsWithAliases } from '../lib/wordDetector'

const INITIAL_STATE: GameState = {
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

export function useGame(
  onWin: (line: WinningLine, word: string) => void,
  persistGame: (state: GameState) => void,
) {
  const [game, setGame] = useState<GameState>(INITIAL_STATE)
  const alreadyFilled = useRef<Set<string>>(new Set(['FREE']))
  const [detectedWords, setDetectedWords] = useState<string[]>([])

  const updateGame = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setGame(prev => {
        const next = updater(prev)
        persistGame(next)
        return next
      })
    },
    [persistGame],
  )

  const startGame = useCallback(
    (categoryId: CategoryId) => {
      const card = generateCard(categoryId)
      alreadyFilled.current = new Set(['free'])
      setDetectedWords([])
      const next: GameState = {
        ...INITIAL_STATE,
        status: 'playing',
        category: categoryId,
        card,
        startedAt: Date.now(),
        filledCount: 1, // free space
      }
      setGame(next)
      persistGame(next)
    },
    [persistGame],
  )

  const newCard = useCallback(() => {
    if (!game.category) return
    startGame(game.category)
  }, [game.category, startGame])

  const fillSquare = useCallback(
    (card: BingoCard, squareId: string, isAuto: boolean, triggerWord?: string): GameState | null => {
      const [row, col] = squareId.split('-').map(Number)
      const square = card.squares[row][col]
      if (square.isFilled || square.isFreeSpace) return null

      const newSquares = card.squares.map(r =>
        r.map(sq =>
          sq.id === squareId
            ? { ...sq, isFilled: true, isAutoFilled: isAuto, filledAt: Date.now() }
            : sq,
        ),
      )
      const newCard: BingoCard = { ...card, squares: newSquares }
      const winningLine = checkForBingo(newCard)
      const filled = countFilled(newCard)

      const next: GameState = {
        status: winningLine ? 'won' : 'playing',
        category: game.category,
        card: newCard,
        isListening: game.isListening,
        startedAt: game.startedAt,
        completedAt: winningLine ? Date.now() : null,
        winningLine: winningLine ?? null,
        winningWord: winningLine ? (triggerWord ?? square.word) : null,
        filledCount: filled,
      }

      if (winningLine) {
        onWin(winningLine, next.winningWord!)
      }

      return next
    },
    [game, onWin],
  )

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      updateGame(prev => {
        if (!prev.card || prev.status !== 'playing') return prev
        const square = prev.card.squares[row][col]
        if (square.isFreeSpace) return prev

        if (square.isFilled) {
          // Toggle off
          alreadyFilled.current.delete(square.word.toLowerCase())
          const newSquares = prev.card.squares.map(r =>
            r.map(sq =>
              sq.id === square.id
                ? { ...sq, isFilled: false, isAutoFilled: false, filledAt: null }
                : sq,
            ),
          )
          return {
            ...prev,
            card: { ...prev.card, squares: newSquares },
            filledCount: countFilled({ ...prev.card, squares: newSquares }),
          }
        }

        alreadyFilled.current.add(square.word.toLowerCase())
        return fillSquare(prev.card, square.id, false) ?? prev
      })
    },
    [updateGame, fillSquare],
  )

  const handleTranscriptResult = useCallback(
    (transcript: string) => {
      setGame(prev => {
        if (!prev.card || prev.status !== 'playing') return prev

        const unfilled = prev.card.words.filter(
          w => !alreadyFilled.current.has(w.toLowerCase()),
        )
        const found = detectWordsWithAliases(transcript, unfilled, alreadyFilled.current)
        if (found.length === 0) return prev

        setDetectedWords(d => [...d, ...found].slice(-10))

        let current = prev
        for (const word of found) {
          alreadyFilled.current.add(word.toLowerCase())
          const square = current.card!.squares.flat().find(
            sq => sq.word.toLowerCase() === word.toLowerCase(),
          )
          if (!square) continue
          const next = fillSquare(current.card!, square.id, true, word)
          if (next) {
            current = next
            persistGame(next)
          }
        }
        return current
      })
    },
    [fillSquare, persistGame],
  )

  const setListening = useCallback(
    (listening: boolean) => {
      updateGame(prev => ({ ...prev, isListening: listening }))
    },
    [updateGame],
  )

  const resetGame = useCallback(() => {
    alreadyFilled.current = new Set(['free'])
    setDetectedWords([])
    const next = INITIAL_STATE
    setGame(next)
    persistGame(next)
  }, [persistGame])

  const restoreGame = useCallback(
    (saved: GameState) => {
      if (saved.card) {
        const filled = new Set(['free'])
        saved.card.squares.flat().forEach(sq => {
          if (sq.isFilled && !sq.isFreeSpace) filled.add(sq.word.toLowerCase())
        })
        alreadyFilled.current = filled
      }
      setGame(saved)
    },
    [],
  )

  return {
    game,
    detectedWords,
    startGame,
    newCard,
    handleSquareClick,
    handleTranscriptResult,
    setListening,
    resetGame,
    restoreGame,
  }
}
