import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { ROUND_OPTIONS, MIN_PLAYERS } from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';
import '../styles/SetupScreen.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Sortable player item component
interface SortablePlayerItemProps {
  player: { id: string; name: string };
  onRemove: (id: string) => void;
}

const SortablePlayerItem = ({ player, onRemove }: SortablePlayerItemProps) => {
  // Note: 'canStartDrag' is not a valid property in the @dnd-kit/sortable API
  // Instead, we isolate the remove button from drag events using event stopPropagation
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    cursor: 'grab',
    touchAction: 'none', // Prevent browser touch actions like scrolling during drag
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    // Stop propagation at all levels
    e.stopPropagation();
    e.preventDefault();

    // Log for debugging
    console.log('Remove button clicked for player:', player.name);

    // Call the remove function
    onRemove(player.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`player-list-item ${isDragging ? 'dragging' : ''}`}
    >
      {/* Make it clear this is the drag handle */}
      <div className="drag-handle" title="Drag to reorder">
        ☰
      </div>
      <span className="player-name">{player.name}</span>
      {/* Completely isolate the button from drag handlers */}
      <div
        className="button-container"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <button
          type="button"
          onClick={handleRemoveClick}
          className="remove-player-btn"
          aria-label={`Remove ${player.name}`}
          draggable={false}
        >
          ✕
        </button>
      </div>
    </li>
  );
};

const SetupScreen = () => {
  const { dispatch } = useGame();
  const [totalRounds, setTotalRounds] = useState<number>(ROUND_OPTIONS[0]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      // Add activation constraint to improve touch handling
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      // Prevent PointerSensor from capturing touch events
      activationConstraint: {
        distance: 10, // Require some movement before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) return;

    // Check for duplicates
    if (players.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player names must be unique.');
      return;
    }

    setPlayers([...players, { id: uuidv4(), name: trimmedName }]);
    setNewPlayerName('');
    setError('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id));
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
        players: players.map((player) => ({
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
        <h3>Number of Rounds</h3>
        <select id="rounds" value={totalRounds} onChange={(e) => setTotalRounds(Number(e.target.value))}>
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={players.map((player) => player.id)} strategy={verticalListSortingStrategy}>
            <ul className="player-list">
              {players.map((player) => (
                <SortablePlayerItem key={player.id} player={player} onRemove={handleRemovePlayer} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
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
