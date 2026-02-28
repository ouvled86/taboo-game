# Taboo Game Architecture

## Game Rules

**Taboo** is a word-guessing party game:

1. Players split into **two teams** (Team A and Team B)
2. Teams take **alternating turns**
3. One player from the active team is the **Describer**
4. The Describer sees a **target word** and a list of **forbidden words**
5. They must make their team guess the target word **without using any forbidden words**
6. A **timer** counts down (default: 60 seconds)
7. Correct guesses earn **+1 point**, using a taboo word gives **-1 point**
8. After the timer ends, the other team takes their turn
9. After all rounds, the team with the **highest score wins**

### Example Card (Darija)

```
┌─────────────────────┐
│       أتـاي         │  ← Target word (Atay / Tea)
│─────────────────────│
│  ✗  ماء             │  ← Forbidden: water
│  ✗  سخون            │  ← Forbidden: hot
│  ✗  نعناع           │  ← Forbidden: mint
│  ✗  كيسان           │  ← Forbidden: glasses
│  ✗  برّاد           │  ← Forbidden: teapot
└─────────────────────┘
```

## Client-Server Architecture

```
┌──────────────────────────────────────────┐
│              Server (Node.js)            │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ Room ABCD │  │ Room XYZW│  ...        │
│  │           │  │          │             │
│  │ Team A: 3 │  │ Team A: 2│             │
│  │ Team B: 2 │  │ Team B: 2│             │
│  │ Score: 5-3│  │ Score: 0-0│            │
│  └──────────┘  └──────────┘             │
│                                          │
│  Word Bank: darija.json / english.json   │
└────────────────┬─────────────────────────┘
                 │ Socket.IO
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐ ┌────────┐  ┌────────┐
│Player 1│ │Player 2│  │Player 3│
│(Phone) │ │(Laptop)│  │(Tablet)│
└────────┘ └────────┘  └────────┘
```

## Game State Machine

The game progresses through these states:

```
┌─────────┐     create/join      ┌───────────┐
│  LOBBY  │ ──────────────────── │  TEAMS    │
│         │                      │ SELECTION │
└─────────┘                      └─────┬─────┘
                                       │ start
                                       ▼
                                ┌─────────────┐
                         ┌───── │   PLAYING    │ ◄────┐
                         │      │  (round N)   │      │
                         │      └──────┬───────┘      │
                         │             │ timer=0       │
                         │             ▼               │
                         │      ┌─────────────┐       │
                         │      │ ROUND RESULT │───────┘
                         │      └──────┬───────┘  next round
                         │             │ all rounds done
                         │             ▼
                         │      ┌─────────────┐
                         └────> │  GAME OVER  │
                                │  (winner!)  │
                                └─────────────┘
```

### States Explained

| State | What Happens |
|-------|-------------|
| **LOBBY** | Players create/join a room with a code |
| **TEAMS** | Players pick Team A or Team B |
| **PLAYING** | Active team's describer sees the word card, timer runs |
| **ROUND RESULT** | Show scores, prepare next round |
| **GAME OVER** | Display final scores and winner |

## Server-Side Game Object

Each room maintains a game state object:

```javascript
const gameState = {
  roomCode: 'ABCD',
  phase: 'playing',       // lobby | teams | playing | roundResult | gameOver
  teams: {
    A: { players: [...], score: 0 },
    B: { players: [...], score: 0 }
  },
  currentTeam: 'A',       // whose turn
  currentDescriber: 0,    // index in team's player array
  currentWord: null,      // { word, forbidden }
  round: 1,
  totalRounds: 4,
  timeLeft: 60,
  usedWords: new Set(),   // avoid repeats
  language: 'darija'      // or 'english'
};
```

## The Describer Role

Only the **Describer** sees the word card. Other players see a waiting screen:

```
Describer's Screen         Teammate's Screen
┌──────────────────┐      ┌──────────────────┐
│  Target: أتاي    │      │                  │
│  ✗ ماء           │      │  Your teammate   │
│  ✗ سخون          │      │  is describing!  │
│  ✗ نعناع         │      │                  │
│  ✗ كيسان         │      │  Listen and      │
│  ✗ برّاد         │      │  guess the word! │
│                  │      │                  │
│ [Got It] [Skip]  │      │    ⏱️ 0:45       │
│ [Taboo!]         │      │                  │
└──────────────────┘      └──────────────────┘
```

## Scoring System

| Action | Points | Who Presses |
|--------|--------|-------------|
| **Correct** (Got It) | +1 | Describer (teammate guessed) |
| **Skip** | 0 | Describer (too hard) |
| **Taboo!** | -1 | Opposing team (caught forbidden word) |

## Security: Server-Authoritative

The server is the **source of truth**. Clients never see the answer before it's revealed:

- Word cards are only sent to the Describer's socket
- Score changes are validated on the server
- Timer runs on the server (clients sync display only)

## Moroccan Darija (الدارجة) Language Support

Darija is the Moroccan Arabic dialect. For the UI:
- **RTL (Right-to-Left)** text direction for Arabic content
- **Mixed direction** — UI chrome in English/French, game words in Darija
- Words drawn from everyday Moroccan culture, food, traditions, and slang
