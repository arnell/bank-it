import { useGame } from '../hooks/useGame';
import '../styles/EndGameScreen.css';

const EndGameScreen = () => {
  const { gameState, dispatch } = useGame();

  // Sort players by score in descending order
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  
  // Find the winner(s) - players with the highest score
  const highestScore = sortedPlayers[0]?.score || 0;
  const winners = sortedPlayers.filter(player => player.score === highestScore);
  
  // Handle starting a new game
  const handleNewGame = () => {
    dispatch({
      type: 'RESET_GAME',
      payload: {},
    });
  };

  return (
    <div className="end-game-screen">
      <h1>Game Over!</h1>
      
      <div className="winner-section">
        <h2>
          {winners.length === 1
            ? `Winner: ${winners[0].name}`
            : 'Winners (Tie)'}
        </h2>
        
        {winners.length > 1 && (
          <div className="winners-list">
            {winners.map(winner => (
              <div key={winner.id} className="winner-name">
                {winner.name}
              </div>
            ))}
          </div>
        )}
        
        <div className="winner-score">
          Final Score: {highestScore}
        </div>
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
              <tr 
                key={player.id}
                className={winners.some(w => w.id === player.id) ? 'winner-row' : ''}
              >
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.score}</td>
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
      
      <button className="new-game-button" onClick={handleNewGame}>
        Start New Game
      </button>
    </div>
  );
};

export default EndGameScreen;