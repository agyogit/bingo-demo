# Meeting Bingo — Implementation Plan

**Version**: 1.0
**Date**: 2026-02-27
**Based on**: PRD v1.0, Architecture v1.0, UXR v1.0
**Target**: 90-minute MVP

---

## Overview

Meeting Bingo is a fully client-side React app that auto-detects corporate buzzwords via the Web Speech API and fills a 5×5 bingo card in real-time. No backend, no accounts, no cost.

**Stack**: React 18 + TypeScript + Tailwind CSS + Vite + canvas-confetti
**Deploy**: Vercel (free tier)

---

## Phase 1 — Foundation (20 min)

### 1.1 Project Scaffold

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
npx tailwindcss init -p
```

### 1.2 Files to Create

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/data/categories.ts` | 3 buzzword category packs (40+ words each) |
| `tailwind.config.js` | Tailwind + custom animations |
| `vite.config.ts` | Port 3000, sourcemaps |

### 1.3 Key Types (from architecture)

```typescript
// Core types needed before anything else
type CategoryId = 'agile' | 'corporate' | 'tech'
type GameStatus = 'idle' | 'setup' | 'playing' | 'won'

interface BingoSquare { id, word, isFilled, isAutoFilled, isFreeSpace, filledAt, row, col }
interface BingoCard { squares: BingoSquare[][], words: string[] }
interface GameState { status, category, card, isListening, startedAt, completedAt, winningLine, winningWord, filledCount }
interface WinningLine { type: 'row'|'column'|'diagonal', index, squares: string[] }
```

### 1.4 Buzzword Data

Three categories × 40+ words each, already defined in architecture doc:
- `agile` — sprint, backlog, standup, retrospective, velocity, blocker... (47 words)
- `corporate` — synergy, leverage, circle back, paradigm shift... (45 words)
- `tech` — API, cloud, microservices, kubernetes, CI/CD... (46 words)

---

## Phase 2 — Core Game Logic (15 min)

### 2.1 `src/lib/cardGenerator.ts`
- Fisher-Yates shuffle on category words
- Pick 24 words, build 5×5 grid
- Center square `[2][2]` = FREE SPACE (pre-filled)
- Return `BingoCard` with flat `words[]` list for fast detection

### 2.2 `src/lib/bingoChecker.ts`
Check all 12 winning lines after every fill:
- 5 rows, 5 columns, 2 diagonals
- Return first `WinningLine` found, or `null`
- Also export `countFilled()` and `getClosestToWin()` (for "one away" UI hint)

### 2.3 `src/lib/wordDetector.ts`
- Single words → regex with word boundary `\b...\b`
- Multi-word phrases → direct substring match
- `alreadyFilled: Set<string>` prevents re-detection
- WORD_ALIASES map for abbreviations: `ci/cd`, `mvp`, `roi`, `api`, `devops`

---

## Phase 3 — Core UI Components (15 min)

### Screen flow
```
LandingPage → CategorySelect → GameBoard → WinScreen
                                   ↑ (play again loops back to CategorySelect)
```

### 3.1 `src/components/LandingPage.tsx`
- Hero: title, tagline, "New Game" CTA
- Privacy badge: "Audio processed locally. Never recorded."
- "How It Works" 4-step list (from PRD §6.2)

### 3.2 `src/components/CategorySelect.tsx`
- 3 cards: Agile 🏃 / Corporate 💼 / Tech 💻
- Each card shows name, description, 3 sample words
- Select → immediate card generation + navigate to GameBoard

### 3.3 `src/components/BingoCard.tsx` + `BingoSquare.tsx`
- 5×5 grid, responsive (works mobile + desktop)
- Square states: default / filled / auto-filled / free-space / winning
- Click to manually toggle fill
- Winning squares: green highlight + ring

### 3.4 `src/App.tsx`
- Single `screen` state: `'landing' | 'category' | 'game' | 'win'`
- Single `game` state (GameState)
- All navigation handlers live here, passed as props
- No router needed (4 screens, simple)

---

## Phase 4 — Speech Recognition (25 min)

### 4.1 `src/hooks/useSpeechRecognition.ts`
Key behaviors:
- Feature detect: `window.SpeechRecognition || window.webkitSpeechRecognition`
- Config: `continuous=true`, `interimResults=true`, `lang='en-US'`
- Auto-restart on `onend` if `isListening` is still true (handles Chrome's 60s timeout)
- Expose: `{ isSupported, isListening, transcript, interimTranscript, error, startListening, stopListening }`
- Callback pattern: `startListening(onResult)` fires on each final result

### 4.2 `src/hooks/useGame.ts`
Wire speech → game state:
- On each new final transcript chunk, call `detectWordsWithAliases()`
- For each detected word, fill matching square (`isAutoFilled=true`)
- After each fill, run `checkForBingo()` — if win, call `onWin()`
- Expose `handleSquareClick()` for manual toggle

### 4.3 `src/components/GameBoard.tsx`
- Header: logo, listening status indicator (pulsing red dot), fill counter
- `BingoCard` with square click handler
- `TranscriptPanel`: last 100 chars of transcript + detected words chips
- Controls: "New Card" + "Start/Stop Listening" toggle
- Graceful fallback if `isSupported=false`: hide mic controls, show manual-only message

### 4.4 `src/components/TranscriptPanel.tsx`
- Pulsing red dot when active, grey when paused
- Final transcript (last 100 chars) + italic interim transcript
- Green chips for last 5 detected words (✨ word)

---

## Phase 5 — Win State & Polish (15 min)

### 5.1 `src/components/WinScreen.tsx`
- Full-screen overlay triggered on BINGO
- Confetti via `canvas-confetti` (burst from top)
- Winning card displayed with green winning-line highlight
- Stats: ⏱ time to bingo, 🏆 winning word, 📊 squares filled, category played
- Actions: "Share Result" + "Play Again"

### 5.2 Share Functionality (`src/lib/shareUtils.ts`)
Text summary copied to clipboard:
```
🎯 BINGO! I won Meeting Bingo!
Category: Agile & Scrum
Time: 22 minutes | Winning word: "Scope Creep"
12/24 squares filled

Play at: meetingbingo.vercel.app
```
- Use `navigator.share()` on mobile (native share sheet)
- Fallback to `navigator.clipboard.writeText()` on desktop
- Show toast confirmation: "Copied to clipboard!"

### 5.3 `src/components/ui/Toast.tsx`
- Stack of dismissible toasts (top-right)
- Auto-dismiss after 3s
- Types: success (green), info (blue)
- Used for: word detected, share copied, speech error

### 5.4 localStorage Persistence (`src/hooks/useLocalStorage.ts`)
- Save `GameState` on every state change
- Restore on app load if `status === 'playing'` (resume in-progress game)
- Clear on "New Game"

---

## Phase 6 — Deploy (5 min)

```bash
npm run build
# Push to GitHub, connect to Vercel
# Or: npx vercel --prod
```

Vercel auto-detects Vite. No config needed. HTTPS included.

---

## File Delivery Order

Build in this sequence to minimize dead-end dependencies:

1. `src/types/index.ts`
2. `src/data/categories.ts`
3. `src/lib/cardGenerator.ts`
4. `src/lib/bingoChecker.ts`
5. `src/lib/wordDetector.ts`
6. `src/lib/shareUtils.ts`
7. `src/hooks/useLocalStorage.ts`
8. `src/hooks/useSpeechRecognition.ts`
9. `src/hooks/useGame.ts`
10. `src/components/ui/Button.tsx`
11. `src/components/ui/Toast.tsx`
12. `src/components/LandingPage.tsx`
13. `src/components/CategorySelect.tsx`
14. `src/components/BingoSquare.tsx`
15. `src/components/BingoCard.tsx`
16. `src/components/TranscriptPanel.tsx`
17. `src/components/GameControls.tsx`
18. `src/components/GameBoard.tsx`
19. `src/components/WinScreen.tsx`
20. `src/App.tsx`

---

## Critical UX Requirements (from UXR)

| Moment | Requirement | Why |
|--------|-------------|-----|
| First auto-fill | < 500ms from spoken to filled | "Magic moment" that proves product works |
| Listening indicator | Always visible, clearly active/paused | Users need to trust the mic is working |
| Near-bingo state | "One away!" highlight on potential winning line | Peak engagement moment |
| Win celebration | Confetti + highlight, NO sound by default | User is still in meeting — can't cheer aloud |
| Privacy badge | Visible on landing AND mic permission prompt | Mic access is a trust moment |
| Share | One tap, works in Slack/Teams/Discord | Viral loop — every share = new user |

---

## Edge Cases to Handle

| Case | Handling |
|------|----------|
| Web Speech API unavailable (Firefox) | Feature detect, hide mic UI, show manual-only mode |
| Mic permission denied | Show error message with instructions to re-enable |
| Same word spoken twice | `alreadyFilled` Set prevents double-fill |
| Chrome 60s speech timeout | Auto-restart on `onend` event |
| Tab switch mid-game | `localStorage` saves state, restores on return |
| Mobile landscape | Tailwind responsive classes handle layout reflow |

---

## Out of Scope (Do Not Build)

- User accounts / authentication
- Multiplayer real-time sync
- Custom buzzword creation
- Sound effects
- Backend server or database
- Dark mode
- Game history beyond current session

---

## Success Criteria (from PRD)

| Metric | Target |
|--------|--------|
| Card generation | < 2 seconds |
| Speech start | < 1 second after permission |
| Auto-fill detection | > 70% accuracy |
| Typical time to BINGO | 10–25 minutes |
| Share rate (post-win) | > 30% |
