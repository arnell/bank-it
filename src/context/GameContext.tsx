import { type ReactNode, useReducer, useEffect } from 'react';
import type { GameAction, GameHistory, GameState } from '../types/gameTypes';
import { GameContext, initialGameState, initialHistory } from './GameContextTypes';
import { gameReducer } from './gameReducer';

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Check if localStorage is available
  const isLocalStorageAvailable = (): boolean => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      console.warn('localStorage is not available. Game state will not persist.');
      return false;
    }
  };

  const storageAvailable = isLocalStorageAvailable();

  // Load initial state from localStorage if available
  const loadInitialState = (): GameState => {
    if (!storageAvailable) return initialGameState;

    try {
      const savedState = localStorage.getItem('bankItGameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage:', error);
    }
    return initialGameState;
  };

  // Load initial history from localStorage if available
  const loadInitialHistory = (): GameHistory => {
    try {
      const savedHistory = localStorage.getItem('bankItGameHistory');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Failed to load game history from localStorage:', error);
    }
    return initialHistory;
  };

  const [gameState, dispatch] = useReducer(gameReducer, loadInitialState());

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bankItGameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }, [gameState]);

  const [history, setHistory] = useReducer(
    (state: GameHistory, action: { type: 'ADD' | 'POP'; payload?: GameAction }) => {
      if (action.type === 'ADD' && action.payload) {
        return [
          ...state,
          {
            gameState,
            action: action.payload,
            timestamp: Date.now(),
          },
        ];
      } else if (action.type === 'POP') {
        return state.slice(0, -1);
      }
      return state;
    },
    loadInitialHistory()
  );

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bankItGameHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save game history to localStorage:', error);
    }
  }, [history]);

  // Custom dispatch that also updates history
  const dispatchWithHistory = (action: GameAction) => {
    // Don't add UNDO actions to history
    if (action.type !== 'UNDO') {
      // Clear localStorage when game is reset
      if (action.type === 'RESET_GAME') {
        localStorage.removeItem('bankItGameState');
        localStorage.removeItem('bankItGameHistory');
      }

      // First dispatch the action to update the state
      dispatch(action);
      // Then add the updated state to history
      setHistory({ type: 'ADD', payload: action });
    } else {
      dispatch(action);
    }
  };

  // Undo function
  const undo = () => {
    if (history.length > 1) {
      // Get the previous state from history (second to last entry)
      const previousEntry = history[history.length - 2];

      // Directly set the state to the previous state
      dispatch({
        type: 'UNDO',
        payload: {
          previousState: previousEntry.gameState,
        },
      });

      // Remove the last entry from history
      setHistory({ type: 'POP' });
    } else {
      // If there's not enough history, show a message or handle appropriately
      console.log('No more history to undo');
    }
  };

  return (
    <GameContext.Provider value={{ gameState, history, dispatch: dispatchWithHistory, undo }}>
      {children}
    </GameContext.Provider>
  );
}
