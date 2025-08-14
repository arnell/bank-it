import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { ROUND_OPTIONS, MIN_PLAYERS } from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';
import '../styles/SetupScreen.css';

const SetupScreen = () => {
  const { dispatch } = useGame();
  const [totalRounds, setTotalRounds] = useState<number>(ROUND_OPTIONS[0]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) return;

    // Check for duplicates
    if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player names must be unique.');
      return;
    }

    setPlayers([...players, { id: uuidv4(), name: trimmedName }]);
    setNewPlayerName('');
    setError('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
    setError('');
  };

  const handleStartGame = () => {
    if (players.length < MIN_PLAYERS) {
      setError(`You need at least ${MIN_PLAYERS} players to play.`);
      return;
    }

    // Start the game
    dispatch({
      type: 'START_GAME',
      payload: {
        totalRounds,
        players: players.map(player => ({
          ...player,
          score: 0,
          isBanked: false,
        })),
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPlayer();
    }
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
        <input
          type="text"
          placeholder="Type player name and press Enter"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="player-input"
        />
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id} className="player-list-item">
              {player.name}
              <button
                type="button"
                onClick={() => handleRemovePlayer(player.id)}
                className="remove-player-btn"
                aria-label={`Remove ${player.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
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