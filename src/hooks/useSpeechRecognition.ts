import { useState, useEffect, useCallback, useRef } from 'react'

// Minimal types for the Web Speech API (not in TS lib by default)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionAPI: new () => ISpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export interface SpeechRecognitionControls {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  startListening: (onResult?: (transcript: string) => void) => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(): SpeechRecognitionControls {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const onResultRef = useRef<((t: string) => void) | null>(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        setTranscript(prev => prev + final)
        onResultRef.current?.(final)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return // non-fatal, just silence
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone access and try again.'
          : `Speech recognition error: ${event.error}`,
      )
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onend = () => {
      // Auto-restart to handle Chrome's ~60s timeout
      if (isListeningRef.current) {
        try { recognition.start() } catch { /* already starting */ }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    return () => { recognition.stop() }
  }, [])

  const startListening = useCallback((onResult?: (t: string) => void) => {
    if (!recognitionRef.current) return
    onResultRef.current = onResult ?? null
    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setIsListening(true)
    isListeningRef.current = true
    try { recognitionRef.current.start() } catch { /* already running */ }
  }, [])

  const stopListening = useCallback(() => {
    isListeningRef.current = false
    setIsListening(false)
    onResultRef.current = null
    recognitionRef.current?.stop()
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isSupported: !!SpeechRecognitionAPI,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
