import { ReactNode, useReducer } from 'react';
import { GameAction, GameHistory } from '../types/gameTypes';
import { GameContext, initialGameState, initialHistory } from './GameContextTypes';
import { gameReducer } from './gameReducer';

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [history, setHistory] = useReducer(
    (state: GameHistory, action: { type: 'ADD' | 'POP', payload?: GameAction }) => {
      if (action.type === 'ADD' && action.payload) {
        return [
          ...state,
          {
            gameState,
            action: action.payload,
            timestamp: Date.now()
          }
        ];
      } else if (action.type === 'POP') {
        return state.slice(0, -1);
      }
      return state;
    },
    initialHistory
  );

  // Custom dispatch that also updates history
  const dispatchWithHistory = (action: GameAction) => {
    // Don't add UNDO actions to history
    if (action.type !== 'UNDO') {
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
          previousState: previousEntry.gameState 
        } 
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