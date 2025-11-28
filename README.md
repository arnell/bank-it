# Product Requirements Document: Bank It

## 1. Overview

**Bank It** is a multiplayer companion web application for a physical dice game played with at least one pair of standard 6-sided dice. The app is used by a scorekeeper to manage gameplay, record dice rolls, track scores, and enforce rules.

### Tech Stack

- **Frontend Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript

---

## 2. Core Objectives

- Allow users to configure a new game (rounds, player names)
- Track turn order, dice rolls, round totals, and individual scores
- Enforce rule differences between 1st and 2nd phase of each round
- Support player actions like banking and handle consequences of rolling a 7 or doubles
- Allow undoing the last recorded action (e.g., dice roll or bank)
- Present a clean, user-friendly, responsive UI suitable for both desktop and mobile

---

## 3. Features

### 3.1 Game Setup

- Select number of rounds (10, 15, or 20)
- Input names of 2 or more players
- Start the game to initialize round 1, turn order, and scores

### 3.2 Game State

Each game must track:

- Total rounds and current round
- Current turn and player
- Current round phase (1st or 2nd)
- Round total
- Each player's score and bank status for the current round
- History stack for undo functionality

### 3.3 Gameplay Mechanics

#### 3.3.1 Rolling Dice

- Scorekeeper inputs result by selecting a number (2–12)
- App updates round total and determines current phase
- If **7** is rolled:
    - **1st phase**: 7 counts as **70 points**
    - **2nd phase**: round total resets to **0**, round ends immediately
- If **doubles** are rolled in 2nd phase:
    - Round total is **doubled**
- Display updated round total and highlight current player

#### 3.3.2 Banking

- Scorekeeper can bank players at any time during 2nd phase before a 7 is rolled
- Banked players have round total added to their score
- Banked players skip remaining turns in the current round
- If all players bank, round ends
- If 7 is rolled during 2nd phase, any unbanked players do not gain points for the round

#### 3.3.3 Undo

- Undo most recent action:
    - Dice roll
    - Bank decision
- Restore previous game state, including scores, round totals, and phase

### 3.4 End of Round

- Round ends when:
    - All players bank
    - A 7 is rolled in 2nd phase
- Start next round automatically
- Reset round total and bank statuses

### 3.5 End of Game

- After final round, app displays:
    - Final scores
    - Winner(s)

---

## 4. User Interface

### 4.1 Setup Screen

- Dropdown to select number of rounds
- Dynamic list to enter player names
- "Start Game" button

### 4.2 Game Screen

- **Header**: Current round / total rounds
- **Round Total Display**
- **Current Player Display**
- **Score Table**: Shows all players, scores, and bank status
- **Dice Roll Input**: Buttons for totals (2–12), doubles
- **Bank Buttons**: Select one or more players to bank
- **Undo Button**: Reverts last action
- **Edit Players Modal**: Add / remove players, restart game

### 4.3 End-of-Game Screen

- Scoreboard
- Winner announcement
- Option to start new game

---

## 5. UX & Design Considerations

- Highlight the current player’s turn visually
- Disable invalid inputs (e.g., rolling or banking out of phase)
- Animate score changes and transitions for clarity
- Mobile-friendly layout

---

## 6. Edge Cases

- All players bank before rolling a 7
- One player remains and keeps rolling
- Immediate 7 on first turn of 2nd phase
- Undoing a bank followed by a roll
- Simultaneous bank actions by multiple players

---

## 7. Stretch Features (Optional)

- Game history log / timeline
- Effects for 7s, doubles, banks
- Persistent game state via local storage
- Dark mode toggle

---

## 8. Development Plan (MVP Milestones)

1. **Setup Screen** (player input, round selection)
2. **Game State Engine** (round logic, scoring)
3. **Basic UI** (roll input, score display, round tracking)
4. **Banking Logic**
5. **Undo Feature**
6. **End-of-Game Handling**
7. **Polish UI/UX**
