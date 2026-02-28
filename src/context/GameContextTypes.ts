import { createContext } from 'react';
import type { GameState, GameAction, GameHistory } from '../types/gameTypes';

// Context interface
export interface GameContextType {
  gameState: GameState;
  history: GameHistory;
  dispatch: React.Dispatch<GameAction>;
  undo: () => void;
}

// Initial game state
export const initialGameState: GameState = {
  totalRounds: 10,
  players: [],
  currentRound: 1,
  currentPlayerIndex: 0,
  lastNormalRollPlayerIndex: 0,
  currentPhase: 'first',
  roundTotal: 0,
  rollCount: 0,
  diceRolls: {
    2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
  },
  badSevens: {},
  pointsLost: {},
  bankedRounds: [],
  isGameStarted: false,
  isGameOver: false,
};

// Initial history
export const initialHistory: GameHistory = [];

// Create context
export const GameContext = createContext<GameContextType | undefined>(undefined);
