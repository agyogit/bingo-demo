import { BingoSquare as BingoSquareType } from '../types'

interface Props {
  square: BingoSquareType
  isWinningSquare: boolean
  onClick: () => void
}

export function BingoSquare({ square, isWinningSquare, onClick }: Props) {
  const { word, isFilled, isFreeSpace } = square

  let classes =
    'aspect-square flex items-center justify-center text-center p-1 border-2 rounded-lg ' +
    'transition-all duration-200 text-xs sm:text-sm font-medium leading-tight break-words ' +
    'select-none '

  if (isFreeSpace) {
    classes += 'bg-amber-100 border-amber-300 text-amber-700 cursor-default'
  } else if (isWinningSquare) {
    classes += 'bg-green-500 border-green-600 text-white ring-2 ring-green-300 ring-offset-1'
  } else if (isFilled) {
    classes += 'bg-blue-500 border-blue-600 text-white cursor-pointer hover:bg-blue-600'
  } else {
    classes += 'bg-white border-gray-200 text-gray-700 cursor-pointer hover:border-blue-300 hover:scale-105 active:scale-95'
  }

  return (
    <button
      onClick={isFreeSpace ? undefined : onClick}
      disabled={isFreeSpace}
      className={classes}
    >
      <span className={isFilled && !isFreeSpace ? 'line-through opacity-90' : ''}>
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  )
}
