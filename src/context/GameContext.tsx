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
      setHistory({ type: 'ADD', payload: action });
    }
    dispatch(action);
  };

  // Undo function
  const undo = () => {
    if (history.length > 0) {
      dispatch({ type: 'UNDO', payload: {} });
      setHistory({ type: 'POP' });
    }
  };

  return (
    <GameContext.Provider value={{ gameState, history, dispatch: dispatchWithHistory, undo }}>
      {children}
    </GameContext.Provider>
  );
}