// Game state types for Bank It

export interface Player {
  id: string;
  name: string;
  score: number;
  isBanked: boolean;
}

export interface GameState {
  // Game configuration
  totalRounds: number;
  players: Player[];
  
  // Current game state
  currentRound: number;
  currentPlayerIndex: number;
  currentPhase: 'first' | 'second';
  roundTotal: number;
  
  // Game status
  isGameStarted: boolean;
  isGameOver: boolean;
}

export type ActionType = 
  | 'START_GAME' 
  | 'ROLL_DICE' 
  | 'BANK_PLAYER' 
  | 'END_ROUND' 
  | 'UNDO' 
  | 'RESET_GAME';

export interface StartGameAction {
  type: 'START_GAME';
  payload: {
    totalRounds: number;
    players: Player[];
  };
}

export interface RollDiceAction {
  type: 'ROLL_DICE';
  payload: {
    diceValue: number;
    isDoubles: boolean;
  };
}

export interface BankPlayerAction {
  type: 'BANK_PLAYER';
  payload: {
    playerId: string;
  };
}

export interface EndRoundAction {
  type: 'END_ROUND';
  payload: Record<string, never>;
}

export interface UndoAction {
  type: 'UNDO';
  payload: Record<string, never>;
}

export interface ResetGameAction {
  type: 'RESET_GAME';
  payload: Record<string, never>;
}

export type GameAction = 
  | StartGameAction 
  | RollDiceAction 
  | BankPlayerAction 
  | EndRoundAction 
  | UndoAction 
  | ResetGameAction;

// History for undo functionality
export interface HistoryEntry {
  gameState: GameState;
  action: GameAction;
  timestamp: number;
}

export type GameHistory = HistoryEntry[];

// Game setup options
export const ROUND_OPTIONS = [10, 15, 20];
export const MIN_PLAYERS = 2;