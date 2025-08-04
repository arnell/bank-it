import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import '../styles/GameScreen.css';

const GameScreen = () => {
  const { gameState, dispatch, undo, history } = useGame();
  const [showAlert, setShowAlert] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success';
  } | null>(null);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isSecondPhase = gameState.currentPhase === 'second';
  const allBanked = gameState.players.every(player => player.isBanked);

  // Handle dice roll - submits immediately
  const handleRoll = (value: number) => {
    // Create a message based on the roll
    let alertMessage = '';
    let alertType: 'info' | 'warning' | 'success' = 'info';

    // Handle 7 in first phase
    if (value === 7 && gameState.currentPhase === 'first') {
      alertMessage = '7 rolled in first phase! 70 points added.';
      alertType = 'success';
    }
    // Handle 7 in second phase
    else if (value === 7 && gameState.currentPhase === 'second') {
      alertMessage = '7 rolled in second phase! Round ends, all unbanked players lose points.';
      alertType = 'warning';
    }
    // Handle transition to second phase
    else if (
      gameState.currentPhase === 'first' &&
      gameState.roundTotal + value >= 100
    ) {
      alertMessage = 'Entering second phase! Players can now BANK.';
      alertType = 'info';
    }

    // Dispatch the roll action
    dispatch({
      type: 'ROLL_DICE',
      payload: {
        diceValue: value,
        isDoubles: false, // Regular dice rolls are not doubles
      },
    });

    // Show alert if there's a message
    if (alertMessage) {
      setShowAlert({ message: alertMessage, type: alertType });
      setTimeout(() => setShowAlert(null), 3000);
    }
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

    setShowAlert({
      message: `Player banked! ${gameState.roundTotal} points added to score.`,
      type: 'success',
    });
    setTimeout(() => setShowAlert(null), 3000);
  };

  // Handle end of round (when all players are banked)
  const handleEndRound = () => {
    dispatch({
      type: 'END_ROUND',
      payload: {},
    });

    setShowAlert({
      message: 'Round ended! Starting next round.',
      type: 'info',
    });
    setTimeout(() => setShowAlert(null), 3000);
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
    
    // Create alert message
    const alertMessage = 'Doubles! Round total is doubled.';
    const alertType: 'info' | 'warning' | 'success' = 'success';
    
    // Dispatch the roll action with doubles
    dispatch({
      type: 'ROLL_DICE',
      payload: {
        diceValue: 2, // Use a minimal value that won't affect the game much
        isDoubles: true,
      },
    });
    
    // Show alert
    setShowAlert({ message: alertMessage, type: alertType });
    setTimeout(() => setShowAlert(null), 3000);
  };

  // Generate dice buttons (2-12)
  const renderDiceButtons = () => {
    const buttons = [];
    for (let i = 2; i <= 12; i++) {
      buttons.push(
        <button
          key={i}
          className="dice-button"
          onClick={() => handleRoll(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1>Bank It</h1>
        <div className="round-info">
          Round {gameState.currentRound} of {gameState.totalRounds}
          <span className="phase-indicator">
            {gameState.currentPhase === 'first' ? 'First Phase' : 'Second Phase'}
          </span>
        </div>
      </div>

      <div className="round-total">
        <h2>Round Total</h2>
        <div className="total-value">{gameState.roundTotal}</div>
      </div>

      <div className="current-player">
        <h3>Current Player</h3>
        <div className="player-name">{currentPlayer?.name || 'No active player'}</div>
      </div>

      <div className="score-table">
        <h3>Scores</h3>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
              <th>Status</th>
              {isSecondPhase && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {gameState.players.map((player) => (
              <tr
                key={player.id}
                className={
                  player.id === currentPlayer?.id ? 'current-player-row' : ''
                }
              >
                <td>{player.name}</td>
                <td>{player.score}</td>
                <td>
                  {player.isBanked ? (
                    <span className="banked-status">BANKED</span>
                  ) : (
                    <span className="active-status">Active</span>
                  )}
                </td>
                {isSecondPhase && (
                  <td>
                    {!player.isBanked && (
                      <button
                        className="bank-button"
                        onClick={() => handleBank(player.id)}
                      >
                        BANK
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dice-controls">
        <h3>Roll Dice</h3>
        <div className="dice-buttons">
          {renderDiceButtons()}
          {gameState.currentPhase === 'second' && (
            <button
              className="dice-button doubles-button"
              onClick={handleDoublesRoll}
            >
              Doubles
            </button>
          )}
        </div>
      </div>

      <div className="game-controls">
        <button className="undo-button" onClick={handleUndo}>
          Undo Last Action
        </button>
        {allBanked && (
          <button className="next-round-button" onClick={handleEndRound}>
            Next Round
          </button>
        )}
      </div>

      {showAlert && (
        <div className={`alert alert-${showAlert.type}`}>
          {showAlert.message}
        </div>
      )}
    </div>
  );
};

export default GameScreen;