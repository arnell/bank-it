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

  const getPlayerName = (id: string) => {
    const p = gameState.players.find(p => p.id === id);
    return p ? p.name : 'Unknown';
  };

  const top3Rounds = [...gameState.bankedRounds]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const badSevenPlayers = Object.entries(gameState.badSevens)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({
      name: getPlayerName(id),
      count
    }));

  const topPointsLost = Object.entries(gameState.pointsLost)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, amount]) => ({
      name: getPlayerName(id),
      amount
    }));

  const totalRolls = gameState.rollsPerRound.reduce((sum, count) => sum + count, 0);
  const maxRolls = gameState.rollsPerRound.length > 0 ? Math.max(...gameState.rollsPerRound) : 0;
  const avgRolls = gameState.rollsPerRound.length > 0
    ? (totalRolls / gameState.rollsPerRound.length).toFixed(1)
    : '0';

  const topDoubles = Object.entries(gameState.doublesRolled)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, amount]) => ({
      name: getPlayerName(id),
      amount
    }));
  const totalDoubles = Object.values(gameState.doublesRolled).reduce((sum, amount) => sum + amount, 0);

  // Calculate cumulative scores per round for each player
  const cumulativeScoresByRound: Record<string, number[]> = {};
  gameState.players.forEach(player => {
    // Initialize with 0 for round 0
    cumulativeScoresByRound[player.id] = [0];
  });

  for (let round = 1; round <= gameState.totalRounds; round++) {
    gameState.players.forEach(player => {
      const previousScore = cumulativeScoresByRound[player.id][round - 1];
      const bankedThisRound = gameState.bankedRounds.find(r => r.round === round && r.playerId === player.id)?.amount || 0;
      cumulativeScoresByRound[player.id].push(previousScore + bankedThisRound);
    });
  }

  const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
  ];

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

        <div className="stats-grid">
          <div className="stat-box">
            <h4>General</h4>
            <div className="stat-item">
              <span className="stat-label">Total Rounds:</span>
              <span className="stat-value">{gameState.totalRounds}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Dice Rolls:</span>
              <span className="stat-value">{formatNumber(totalRolls)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Rolls / Round:</span>
              <span className="stat-value">{avgRolls}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Rolls in Round:</span>
              <span className="stat-value">{formatNumber(maxRolls)}</span>
            </div>
          </div>

          <div className="stat-box">
            <h4>Most Doubles Rolled</h4>
            {topDoubles.length > 0 ? (
              <ol className="top-rounds-list">
                {topDoubles.map((p, i) => (
                  <li key={i}>
                    <span className="round-player">{p.name}</span>
                    <span className="round-amount">{formatNumber(p.amount)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-stats">No doubles rolled</div>
            )}
          </div>

          <div className="stat-box">
            <h4>Most Unbanked Points Lost</h4>
            {topPointsLost.length > 0 ? (
              <ol className="points-lost-list">
                {topPointsLost.map((p, i) => (
                  <li key={i}>
                    <span className="round-player">{p.name}</span>
                    <span className="round-amount">{formatNumber(p.amount)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-stats">No unbanked points lost</div>
            )}
          </div>

          <div className="stat-box">
            <h4>Best 3 Rounds</h4>
            {top3Rounds.length > 0 ? (
              <ol className="top-rounds-list">
                {top3Rounds.map((r, i) => (
                  <li key={i}>
                    <span className="round-player">{getPlayerName(r.playerId)}</span>
                    <span className="round-amount">{formatNumber(r.amount)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-stats">No rounds banked</div>
            )}
          </div>

          <div className="stat-box">
            <h4>Most Round-Ending 7s</h4>
            {badSevenPlayers.length > 0 ? (
              <ol className="bad-sevens-list">
                {badSevenPlayers.map((p, i) => (
                  <li key={i}>
                    <span className="round-player">{p.name}</span>
                    <span className="round-amount">{p.count}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="no-stats">No round-ending 7s rolled</div>
            )}
          </div>
        </div>

        <div className="stat-box full-width">
          <h4>Dice Roll Frequencies</h4>
          <div className="dice-chart">
            {Object.entries(gameState.diceRolls).concat([['DBL', totalDoubles]]).map(([val, count]) => {
              const maxCount = Math.max(...Object.values(gameState.diceRolls), totalDoubles, 1);
              const heightPercentage = (Number(count) / maxCount) * 100;
              return (
                <div key={val} className="dice-bar-container">
                  <div className="dice-count">{count}</div>
                  <div className="dice-bar" style={{ height: `${heightPercentage}%` }}></div>
                  <div className="dice-value">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stat-box full-width">
          <h4>Scores Per Round</h4>
          <div className="scores-chart-container" style={{ position: 'relative', height: '300px', width: '100%', marginTop: '20px' }}>
            <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(percent => (
                <line key={percent} x1="0" y1={percent} x2="100" y2={percent} stroke="#ecf0f1" strokeWidth="0.5" />
              ))}

              {/* Lines for each player */}
              {gameState.players.map((player, index) => {
                const scores = cumulativeScoresByRound[player.id];
                const maxScore = Math.max(...Object.values(cumulativeScoresByRound).flat(), 100); // Minimum max score of 100

                // Generate points for the polyline
                const points = scores.map((score, round) => {
                  const x = (round / gameState.totalRounds) * 100;
                  const y = 100 - ((score / maxScore) * 100);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polyline
                    key={player.id}
                    points={points}
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Round labels on X axis */}
              {Array.from({ length: gameState.totalRounds + 1 }).map((_, round) => {
                const x = (round / gameState.totalRounds) * 100;
                // Only show every 5th round and the first/last to avoid crowding, or all if totalRounds <= 10
                if (gameState.totalRounds <= 10 || round % 5 === 0 || round === gameState.totalRounds || round === 0) {
                   return (
                     <text key={round} x={x} y="105" fontSize="3" textAnchor="middle" fill="#7f8c8d">
                       {round}
                     </text>
                   );
                }
                return null;
              })}

              {/* Score labels on Y axis (rough estimates based on maxScore) */}
              {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
                const maxScore = Math.max(...Object.values(cumulativeScoresByRound).flat(), 100);
                const score = Math.round(maxScore * fraction);
                const y = 100 - (fraction * 100);
                return (
                  <text key={fraction} x="-2" y={y + 1} fontSize="3" textAnchor="end" fill="#7f8c8d">
                    {formatNumber(score)}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="chart-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            {gameState.players.map((player, index) => (
              <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', backgroundColor: colors[index % colors.length], borderRadius: '3px' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: '500' }}>{player.name}</span>
              </div>
            ))}
          </div>
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
