import { GameState, GameAction } from '../types/gameTypes';
import { initialGameState } from './GameContextTypes';

// Game reducer function
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        totalRounds: action.payload.totalRounds,
        players: action.payload.players.map(player => ({
          ...player,
          score: 0,
          isBanked: false
        })),
        currentRound: 1,
        currentPlayerIndex: 0,
        currentPhase: 'first',
        roundTotal: 0,
        isGameStarted: true,
        isGameOver: false,
      };
      
    case 'ROLL_DICE': {
      const { diceValue, isDoubles } = action.payload;
      let newRoundTotal = state.roundTotal;
      let newPhase = state.currentPhase;
      let newPlayerIndex = state.currentPlayerIndex;
      let endRound = false;
      
      // Handle 7 in first phase (70 points)
      if (diceValue === 7 && state.currentPhase === 'first') {
        newRoundTotal += 70;
      } 
      // Handle 7 in second phase (reset round total, end round)
      else if (diceValue === 7 && state.currentPhase === 'second') {
        newRoundTotal = 0;
        endRound = true;
      } 
      // Handle doubles in second phase (double round total)
      else if (isDoubles && state.currentPhase === 'second') {
        newRoundTotal = state.roundTotal * 2;
      } 
      // Normal roll
      else {
        newRoundTotal += diceValue;
      }
      
      // Transition from first to second phase if round total >= 100
      if (state.currentPhase === 'first' && newRoundTotal >= 100) {
        newPhase = 'second';
      }
      
      // Move to next player if not end of round
      if (!endRound) {
        // Find next unbanked player
        const activePlayers = state.players.filter(p => !p.isBanked);
        if (activePlayers.length > 1) {
          newPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
          // Skip banked players
          while (state.players[newPlayerIndex].isBanked) {
            newPlayerIndex = (newPlayerIndex + 1) % state.players.length;
          }
        }
      }
      
      // If round ended due to rolling 7 in second phase
      if (endRound) {
        return {
          ...state,
          roundTotal: 0,
          currentRound: state.currentRound + 1,
          currentPlayerIndex: 0,
          currentPhase: 'first',
          players: state.players.map(player => ({
            ...player,
            isBanked: false
          })),
          isGameOver: state.currentRound + 1 > state.totalRounds
        };
      }
      
      return {
        ...state,
        roundTotal: newRoundTotal,
        currentPhase: newPhase,
        currentPlayerIndex: newPlayerIndex
      };
    }
    
    case 'BANK_PLAYER': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            score: player.score + state.roundTotal,
            isBanked: true
          };
        }
        return player;
      });
      
      // Check if all players are banked
      const allBanked = updatedPlayers.every(player => player.isBanked);
      
      // If all players are banked, end the round
      if (allBanked) {
        return {
          ...state,
          players: updatedPlayers.map(player => ({
            ...player,
            isBanked: false
          })),
          currentRound: state.currentRound + 1,
          currentPlayerIndex: 0,
          currentPhase: 'first',
          roundTotal: 0,
          isGameOver: state.currentRound + 1 > state.totalRounds
        };
      }
      
      // Find next unbanked player
      let newPlayerIndex = state.currentPlayerIndex;
      if (updatedPlayers[state.currentPlayerIndex].isBanked) {
        newPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        while (updatedPlayers[newPlayerIndex].isBanked) {
          newPlayerIndex = (newPlayerIndex + 1) % state.players.length;
          // Safety check to prevent infinite loop
          if (newPlayerIndex === state.currentPlayerIndex) break;
        }
      }
      
      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: newPlayerIndex
      };
    }
    
    case 'END_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
        currentPlayerIndex: 0,
        currentPhase: 'first',
        roundTotal: 0,
        players: state.players.map(player => ({
          ...player,
          isBanked: false
        })),
        isGameOver: state.currentRound + 1 > state.totalRounds
      };
      
    case 'RESET_GAME':
      return initialGameState;
      
    default:
      return state;
  }
}