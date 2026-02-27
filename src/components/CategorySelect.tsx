import { CategoryId } from '../types'
import { CATEGORIES } from '../data/categories'
import { Button } from './ui/Button'

interface CategorySelectProps {
  onSelect: (categoryId: CategoryId) => void
  onBack: () => void
}

export function CategorySelect({ onSelect, onBack }: CategorySelectProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Choose Your Buzzword Pack
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 text-left
                hover:border-blue-400 hover:shadow-md transition-all duration-150
                active:scale-95 group"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h2 className="font-semibold text-gray-900 mb-1">{cat.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
              <p className="text-xs text-gray-400 italic">
                {cat.words.slice(0, 4).join(', ')}...
              </p>
              <div className="mt-4">
                <span className="text-sm font-medium text-blue-500 group-hover:text-blue-600">
                  Select →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
