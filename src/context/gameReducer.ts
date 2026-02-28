import type { GameState, GameAction } from '../types/gameTypes';
import { initialGameState } from './GameContextTypes';

// Game reducer function
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        totalRounds: action.payload.totalRounds,
        players: action.payload.players.map((player) => ({
          ...player,
          score: 0,
          isBanked: false,
        })),
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
        pointsLost: 0,
        bankedRounds: [],
        isGameStarted: true,
        isGameOver: false,
      };

    case 'ROLL_DICE': {
      const { diceValue, isDoubles } = action.payload;
      let newRoundTotal = state.roundTotal;
      let newPhase = state.currentPhase;
      let newPlayerIndex = state.currentPlayerIndex;
      const lastNormalRollPlayerIndex = state.currentPlayerIndex;
      let endRound = false;
      const newRollCount = state.rollCount + 1;

      const newDiceRolls = { ...state.diceRolls };
      if (!isDoubles) { // Don't count "doubles" as a specific dice value since it's just a button in GameScreen.tsx right now
        newDiceRolls[diceValue] = (newDiceRolls[diceValue] || 0) + 1;
      }

      let newBadSevens = { ...state.badSevens };
      let newPointsLost = state.pointsLost;

      // Handle 7 in first phase (70 points)
      if (diceValue === 7 && state.currentPhase === 'first') {
        newRoundTotal += 70;
      }
      // Handle 7 in second phase (reset round total, end round)
      else if (diceValue === 7 && state.currentPhase === 'second') {
        newRoundTotal = 0;
        endRound = true;

        // Track bad seven for current player
        const currentPlayerId = state.players[state.currentPlayerIndex].id;
        newBadSevens[currentPlayerId] = (newBadSevens[currentPlayerId] || 0) + 1;

        // Track points lost by unbanked players
        const unbankedCount = state.players.filter((p) => !p.isBanked).length;
        newPointsLost += state.roundTotal * unbankedCount;
      }
      // Handle doubles in second phase (double round total)
      else if (isDoubles && state.currentPhase === 'second') {
        newRoundTotal = state.roundTotal * 2;
      }
      // Normal roll
      else {
        newRoundTotal += diceValue;
      }

      // Transition from first to second phase after 3 rolls
      if (state.currentPhase === 'first' && newRollCount >= 3) {
        newPhase = 'second';
      }

      // Move to next player
      newPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      if (!endRound) {
        // Find next unbanked player
        const activePlayers = state.players.filter((p) => !p.isBanked);
        if (activePlayers.length > 1) {
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
          rollCount: 0,
          diceRolls: newDiceRolls,
          badSevens: newBadSevens,
          pointsLost: newPointsLost,
          currentRound: state.currentRound + 1,
          currentPlayerIndex: newPlayerIndex,
          lastNormalRollPlayerIndex: lastNormalRollPlayerIndex,
          currentPhase: 'first',
          players: state.players.map((player) => ({
            ...player,
            isBanked: false,
          })),
          isGameOver: state.currentRound + 1 > state.totalRounds,
        };
      }

      return {
        ...state,
        roundTotal: newRoundTotal,
        rollCount: newRollCount,
        diceRolls: newDiceRolls,
        currentPhase: newPhase,
        currentPlayerIndex: newPlayerIndex,
        lastNormalRollPlayerIndex: lastNormalRollPlayerIndex,
      };
    }

    case 'BANK_PLAYER': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            score: player.score + state.roundTotal,
            isBanked: true,
          };
        }
        return player;
      });

      const newBankedRounds = [
        ...state.bankedRounds,
        {
          playerId,
          amount: state.roundTotal,
          round: state.currentRound,
        }
      ];

      // Check if all players are banked
      const allBanked = updatedPlayers.every((player) => player.isBanked);

      // If all players are banked, end the round
      if (allBanked) {
        return {
          ...state,
          players: updatedPlayers.map((player) => ({
            ...player,
            isBanked: false,
          })),
          bankedRounds: newBankedRounds,
          currentRound: state.currentRound + 1,
          currentPlayerIndex: (state.lastNormalRollPlayerIndex + 1) % state.players.length,
          currentPhase: 'first',
          roundTotal: 0,
          rollCount: 0,
          isGameOver: state.currentRound + 1 > state.totalRounds,
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
        bankedRounds: newBankedRounds,
        currentPlayerIndex: newPlayerIndex,
        lastNormalRollPlayerIndex: state.lastNormalRollPlayerIndex,
      };
    }

    case 'RESET_GAME':
      return initialGameState;

    case 'RESTART_WITH_SAME_PLAYERS':
      return {
        ...state,
        totalRounds: action.payload.totalRounds,
        players: state.players.map((player) => ({
          ...player,
          score: 0,
          isBanked: false,
        })),
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
        pointsLost: 0,
        bankedRounds: [],
        isGameStarted: true,
        isGameOver: false,
      };

    case 'UNDO':
      // Return the previous state from history
      if (action.payload && 'previousState' in action.payload) {
        return action.payload.previousState as GameState;
      }
      return state;

    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload.player],
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((player) => player.id !== action.payload.playerId),
        // If we're removing the current player, adjust the currentPlayerIndex
        currentPlayerIndex:
          state.players.findIndex((p) => p.id === action.payload.playerId) <= state.currentPlayerIndex
            ? Math.max(0, state.currentPlayerIndex - 1)
            : state.currentPlayerIndex,
      };

    case 'REORDER_PLAYERS':
      return {
        ...state,
        players: action.payload.players,
        // Adjust currentPlayerIndex if the current player has moved
        currentPlayerIndex:
          action.payload.players.findIndex((player) => player.id === state.players[state.currentPlayerIndex]?.id) !== -1
            ? action.payload.players.findIndex((player) => player.id === state.players[state.currentPlayerIndex]?.id)
            : 0,
      };

    case 'RETURN_TO_SETUP':
      return {
        ...state,
        isGameStarted: false,
        // Preserve the current players and their scores
      };

    default:
      return state;
  }
}
