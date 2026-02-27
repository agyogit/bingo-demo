function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"').trim()
}

const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration'],
  'mvp': ['minimum viable product'],
  'roi': ['return on investment'],
  'api': ['a.p.i.'],
  'devops': ['dev ops', 'dev-ops'],
}

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalized = normalizeText(transcript)
  const detected: string[] = []

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue
    const normWord = normalizeText(word)

    if (normWord.includes(' ')) {
      if (normalized.includes(normWord)) detected.push(word)
    } else {
      const regex = new RegExp(`\\b${escapeRegex(normWord)}\\b`, 'i')
      if (regex.test(normalized)) detected.push(word)
    }
  }

  return detected
}

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled)
  const normalized = normalizeText(transcript)

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue
    if (detected.includes(word)) continue

    const aliases = WORD_ALIASES[word.toLowerCase()]
    if (aliases?.some(alias => normalized.includes(alias))) {
      detected.push(word)
    }
  }

  return detected
}
