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
  isGameStarted: false,
  isGameOver: false,
};

// Initial history
export const initialHistory: GameHistory = [];

// Create context
export const GameContext = createContext<GameContextType | undefined>(undefined);
