interface TranscriptPanelProps {
  transcript: string
  interimTranscript: string
  detectedWords: string[]
  isListening: boolean
}

export function TranscriptPanel({
  transcript,
  interimTranscript,
  detectedWords,
  isListening,
}: TranscriptPanelProps) {
  const displayTranscript = transcript.slice(-100)

  return (
    <div className="bg-gray-100 rounded-lg p-3 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span className="text-sm font-medium text-gray-600">
          {isListening ? '🎤 Listening...' : '🎤 Paused'}
        </span>
      </div>

      <div className="text-sm min-h-[2.5rem] mb-2">
        <span className="text-gray-700">
          {displayTranscript || (isListening ? '' : '')}
        </span>
        <span className="text-gray-400 italic">{interimTranscript}</span>
        {!displayTranscript && !interimTranscript && (
          <span className="text-gray-400 italic">Waiting for speech...</span>
        )}
      </div>

      {detectedWords.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-400">Detected:</span>
          {detectedWords.slice(-5).map((word, i) => (
            <span
              key={i}
              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
            >
              ✨ {word}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
