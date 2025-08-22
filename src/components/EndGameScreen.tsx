import { useGame } from '../hooks/useGame';
import '../styles/EndGameScreen.css';
import { formatNumber } from '../util/formatNumber.tsx';

const EndGameScreen = () => {
  const { gameState, dispatch, undo, history } = useGame();

  // Sort players by score in descending order
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  // Find the winner(s) - players with the highest score
  const highestScore = sortedPlayers[0]?.score || 0;
  const winners = sortedPlayers.filter((player) => player.score === highestScore);

  // Handle starting a new game
  const handleNewGame = () => {
    dispatch({
      type: 'RESET_GAME',
      payload: {},
    });
  };

  // Handle restarting with the same players
  const handleRestartWithSamePlayers = () => {
    dispatch({
      type: 'RESTART_WITH_SAME_PLAYERS',
      payload: {
        totalRounds: gameState.totalRounds,
      },
    });
  };

  // Handle undo of the last action
  const handleUndo = () => {
    if (history.length > 0) {
      undo();
    }
  };

  return (
    <div className="end-game-screen">
      <div className="game-header">
        <h1>Bank It</h1>
        <div className="game-header-spacer" />
        <button className="undo-button" onClick={handleUndo}>
          <svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#fff"
              d="M25 38c-5.1 0-9.7-3-11.8-7.6l1.8-.8c1.8 3.9 5.7 6.4 10 6.4 6.1 0 11-4.9 11-11s-4.9-11-11-11c-4.6 0-8.5 2.8-10.1 7.3l-1.9-.7c1.9-5.2 6.6-8.6 12-8.6 7.2 0 13 5.8 13 13s-5.8 13-13 13z"
            />
            <path fill="#fff" d="M20 22h-8v-8h2v6h6z" />
          </svg>
        </button>
      </div>
      <h1>Game Over!</h1>

      <div className="winner-section">
        <h2>{winners.length === 1 ? `Winner: ${winners[0].name}` : 'Winners (Tie)'}</h2>

        {winners.length > 1 && (
          <div className="winners-list">
            {winners.map((winner) => (
              <div key={winner.id} className="winner-name">
                {winner.name}
              </div>
            ))}
          </div>
        )}

        <div className="winner-score">Final Score: {formatNumber(highestScore)}</div>
      </div>

      <div className="final-scores">
        <h3>Final Scores</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className={winners.some((w) => w.id === player.id) ? 'winner-row' : ''}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{formatNumber(player.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="game-stats">
        <h3>Game Statistics</h3>
        <div className="stat-item">
          <span className="stat-label">Total Rounds:</span>
          <span className="stat-value">{gameState.totalRounds}</span>
        </div>
      </div>

      <div className="end-game-buttons">
        <button className="restart-game-button" onClick={handleRestartWithSamePlayers}>
          Play Again with Same Players
        </button>
        <button className="new-game-button" onClick={handleNewGame}>
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default EndGameScreen;
