import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { ROUND_OPTIONS, MIN_PLAYERS } from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';
import '../styles/SetupScreen.css';

const SetupScreen = () => {
  const { dispatch } = useGame();
  const [totalRounds, setTotalRounds] = useState<number>(ROUND_OPTIONS[0]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([
    { id: uuidv4(), name: '' },
    { id: uuidv4(), name: '' },
  ]);
  const [error, setError] = useState<string>('');

  const handleAddPlayer = () => {
    setPlayers([...players, { id: uuidv4(), name: '' }]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= MIN_PLAYERS) {
      setError(`You need at least ${MIN_PLAYERS} players to play.`);
      return;
    }
    setPlayers(players.filter(player => player.id !== id));
    setError('');
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayers(
      players.map(player => (player.id === id ? { ...player, name } : player))
    );
  };

  const handleStartGame = () => {
    // Validate player names
    const emptyNames = players.some(player => !player.name.trim());
    if (emptyNames) {
      setError('All players must have a name.');
      return;
    }

    // Check for duplicate names
    const names = players.map(player => player.name.trim());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== players.length) {
      setError('All players must have unique names.');
      return;
    }

    // Start the game
    dispatch({
      type: 'START_GAME',
      payload: {
        totalRounds,
        players: players.map(player => ({
          ...player,
          name: player.name.trim(),
          score: 0,
          isBanked: false,
        })),
      },
    });
  };

  return (
    <div className="setup-screen">
      <h1>Bank It</h1>
      <h2>Game Setup</h2>

      <div className="setup-section">
        <label htmlFor="rounds">Number of Rounds:</label>
        <select
          id="rounds"
          value={totalRounds}
          onChange={(e) => setTotalRounds(Number(e.target.value))}
        >
          {ROUND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="setup-section">
        <h3>Players</h3>
        {players.map((player, index) => (
          <div key={player.id} className="player-input">
            <label htmlFor={`player-${index}`}>Player {index + 1}:</label>
            <input
              id={`player-${index}`}
              type="text"
              value={player.name}
              onChange={(e) =>
                handlePlayerNameChange(player.id, e.target.value)
              }
              placeholder="Enter player name"
            />
            <button
              type="button"
              onClick={() => handleRemovePlayer(player.id)}
              className="remove-player-btn"
              aria-label={`Remove player ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddPlayer}
          className="add-player-btn"
        >
          Add Player
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="button"
        onClick={handleStartGame}
        className="start-game-btn"
        disabled={players.length < MIN_PLAYERS}
      >
        Start Game
      </button>
    </div>
  );
};

export default SetupScreen;