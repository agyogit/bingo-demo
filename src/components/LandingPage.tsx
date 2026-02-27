import { Button } from './ui/Button'

interface LandingPageProps {
  onStart: () => void
}

const steps = [
  { emoji: '1️⃣', text: 'Pick a buzzword category' },
  { emoji: '2️⃣', text: 'Enable microphone for auto-detection' },
  { emoji: '3️⃣', text: 'Join your meeting and listen' },
  { emoji: '4️⃣', text: 'Watch squares fill automatically!' },
]

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">🎯 Meeting Bingo</h1>
          <p className="text-xl text-gray-600 mb-1">Turn any meeting into a game.</p>
          <p className="text-base text-gray-500">Auto-detects buzzwords using speech recognition!</p>
        </div>

        {/* Privacy badge */}
        <p className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-2 mb-8">
          🔒 Audio processed locally. Never recorded.
        </p>

        {/* CTA */}
        <Button size="lg" onClick={onStart} className="w-full max-w-xs mb-12">
          🎮 New Game
        </Button>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* How it works */}
        <div className="text-left">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 text-center">
            How It Works
          </h2>
          <ul className="space-y-3">
            {steps.map(({ emoji, text }) => (
              <li key={text} className="flex items-center gap-3 text-gray-600">
                <span className="text-xl">{emoji}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
