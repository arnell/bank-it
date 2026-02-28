// Game state types for Bank It

export interface Player {
  id: string;
  name: string;
  score: number;
  isBanked: boolean;
}

export interface BankedRound {
  playerId: string;
  amount: number;
  round: number;
}

export interface GameState {
  // Game configuration
  totalRounds: number;
  players: Player[];

  // Current game state
  currentRound: number;
  currentPlayerIndex: number;
  lastNormalRollPlayerIndex: number;
  currentPhase: 'first' | 'second';
  roundTotal: number;
  rollCount: number;

  // Game stats
  diceRolls: Record<number, number>;
  badSevens: Record<string, number>;
  pointsLost: Record<string, number>;
  bankedRounds: BankedRound[];

  // Game status
  isGameStarted: boolean;
  isGameOver: boolean;
}

export type ActionType =
  | 'START_GAME'
  | 'ROLL_DICE'
  | 'BANK_PLAYER'
  | 'UNDO'
  | 'RESET_GAME'
  | 'RESTART_WITH_SAME_PLAYERS'
  | 'ADD_PLAYER'
  | 'REMOVE_PLAYER'
  | 'REORDER_PLAYERS'
  | 'RETURN_TO_SETUP';

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

export interface UndoAction {
  type: 'UNDO';
  payload: {
    previousState?: GameState;
  };
}

export interface ResetGameAction {
  type: 'RESET_GAME';
  payload: Record<string, never>;
}

export interface RestartWithSamePlayersAction {
  type: 'RESTART_WITH_SAME_PLAYERS';
  payload: {
    totalRounds: number;
  };
}

export interface AddPlayerAction {
  type: 'ADD_PLAYER';
  payload: {
    player: Player;
  };
}

export interface RemovePlayerAction {
  type: 'REMOVE_PLAYER';
  payload: {
    playerId: string;
  };
}

export interface ReorderPlayersAction {
  type: 'REORDER_PLAYERS';
  payload: {
    players: Player[];
  };
}

export interface ReturnToSetupAction {
  type: 'RETURN_TO_SETUP';
  payload: Record<string, never>;
}

export type GameAction =
  | StartGameAction
  | RollDiceAction
  | BankPlayerAction
  | UndoAction
  | ResetGameAction
  | RestartWithSamePlayersAction
  | AddPlayerAction
  | RemovePlayerAction
  | ReorderPlayersAction
  | ReturnToSetupAction;

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
