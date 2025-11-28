import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { formatNumber } from '../util/formatNumber';
import '../styles/GameScreen.css';
import PlayerModal from './PlayerModal';

const GameScreen = () => {
  const { gameState, dispatch, undo, history } = useGame();
  const [showAlert, setShowAlert] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success';
  } | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isSecondPhase = gameState.currentPhase === 'second';

  // Handle dice roll - submits immediately
  const handleRoll = (value: number) => {
    // Dispatch the roll action
    dispatch({
      type: 'ROLL_DICE',
      payload: {
        diceValue: value,
        isDoubles: false, // Regular dice rolls are not doubles
      },
    });
  };

  // Handle banking a player
  const handleBank = (playerId: string) => {
    if (!isSecondPhase) return;

    dispatch({
      type: 'BANK_PLAYER',
      payload: {
        playerId,
      },
    });
  };

  // Handle undo
  const handleUndo = () => {
    // Check if there's history to undo
    if (history.length > 0) {
      undo();
      setShowAlert({
        message: 'Last action undone!',
        type: 'info',
      });
    } else {
      setShowAlert({
        message: 'No more actions to undo!',
        type: 'warning',
      });
    }
    setTimeout(() => setShowAlert(null), 3000);
  };

  // Handle doubles roll
  const handleDoublesRoll = () => {
    // Only allow doubles in second phase
    if (gameState.currentPhase !== 'second') return;

    // Dispatch the roll action with doubles
    dispatch({
      type: 'ROLL_DICE',
      payload: {
        diceValue: 2, // Use a minimal value that won't affect the game much
        isDoubles: true,
      },
    });
  };

  // Generate dice buttons (2-12)
  const renderDiceButtons = (currentPhase: string) => {
    const buttons = [];
    const disabledButtons: number[] = [];
    if (currentPhase === 'second') {
      disabledButtons.push(2, 12);
    }
    for (let i = 2; i <= 12; i++) {
      buttons.push(
        <button
          key={i}
          className={`dice-button ${disabledButtons.includes(i) ? 'disabled' : ''}`}
          onClick={() => (disabledButtons.includes(i) ? undefined : handleRoll(i))}
        >
          {i}
        </button>
      );
    }
    buttons.push(
      <button
        key="doubles"
        className={`dice-button doubles-button ${gameState.currentPhase === 'second' ? '' : 'disabled'}`}
        onClick={gameState.currentPhase === 'second' ? handleDoublesRoll : undefined}
      >
        Doubles
      </button>
    );
    return buttons;
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1>Bank It</h1>
        <div className="game-header-spacer" />

        {/* New Players button */}
        <button className="players-button" onClick={() => setShowPlayerModal(true)}>
          <svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#fff"
              d="M25 10c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"
            />
            <path
              fill="#fff"
              d="M32.5 28h-15c-5.2 0-9.5 4.3-9.5 9.5V40h34v-2.5c0-5.2-4.3-9.5-9.5-9.5zm7.5 10h-30v-0.5c0-4.1 3.4-7.5 7.5-7.5h15c4.1 0 7.5 3.4 7.5 7.5V38z"
            />
            <circle fill="#fff" cx="38" cy="15" r="6" />
            <path fill="#fff" d="M38 10v10M33 15h10" />
          </svg>
        </button>

        <button className="undo-button" onClick={handleUndo}>
          <svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#fff"
              d="M25 38c-5.1 0-9.7-3-11.8-7.6l1.8-.8c1.8 3.9 5.7 6.4 10 6.4 6.1 0 11-4.9 11-11s-4.9-11-11-11c-4.6 0-8.5 2.8-10.1 7.3l-1.9-.7c1.9-5.2 6.6-8.6 12-8.6 7.2 0 13 5.8 13 13s-5.8 13-13 13z"
            />
            <path fill="#fff" d="M20 22h-8v-8h2v6h6z" />
          </svg>
        </button>
        <div className="round-info">
          <span className="round-number">
            Round {gameState.currentRound} of {gameState.totalRounds}
          </span>
          <span className="phase-indicator">{gameState.currentPhase === 'first' ? 'First Phase' : 'Second Phase'}</span>
        </div>
      </div>
      <div className="round-stats">
        <div className="round-total">
          <h2>Round Total</h2>
          <div className="total-value">{formatNumber(gameState.roundTotal)}</div>
        </div>

        <div className="current-player">
          <h2>Current Player</h2>
          <div className="current-player-name">{currentPlayer?.name || 'No active player'}</div>
        </div>
      </div>
      <div className="score-table">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...gameState.players]
              .sort((a, b) => b.score - a.score)
              .map((player) => (
                <tr key={player.id}>
                  <td className="player-name-col">{player.name}</td>
                  <td className="player-score-col">
                    {formatNumber(player.score)}
                    <span>
                      {!player.isBanked &&
                        gameState.roundTotal > 0 &&
                        ` (${formatNumber(player.score + gameState.roundTotal)})`}
                    </span>
                  </td>
                  <td>
                    {player.isBanked ? (
                      <span className="banked-status">Banked</span>
                    ) : (
                      <span className="active-status">Active</span>
                    )}
                  </td>
                  <td>
                    {isSecondPhase && !player.isBanked && (
                      <button className="bank-button" onClick={() => handleBank(player.id)}>
                        BANK
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="dice-controls">
        <div className="dice-buttons">{renderDiceButtons(gameState.currentPhase)}</div>
      </div>

      {showAlert && <div className={`alert alert-${showAlert.type}`}>{showAlert.message}</div>}

      {/* Add the modal component */}
      {showPlayerModal && (
        <PlayerModal
          onClose={() => setShowPlayerModal(false)}
          currentPlayers={gameState.players}
          dispatch={dispatch}
          totalRounds={gameState.totalRounds}
        />
      )}
    </div>
  );
};

export default GameScreen;
