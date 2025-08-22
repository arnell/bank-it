import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../styles/PlayerModal.css';
import { GameAction } from '../types/gameTypes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

// Sortable player item component
interface SortablePlayerItemProps {
  player: { id: string; name: string; score: number; isBanked: boolean };
  onRemove: (id: string) => void;
}

const SortablePlayerItem = ({ player, onRemove }: SortablePlayerItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: player.id
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
      <div className="drag-handle" title="Drag to reorder">☰</div>
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

interface PlayerModalProps {
  onClose: () => void;
  currentPlayers: Array<{ id: string; name: string; score: number; isBanked: boolean }>;
  dispatch: React.Dispatch<GameAction>;
  totalRounds?: number; // Optional, will default to 10 if not provided
}

const PlayerModal = ({ onClose, currentPlayers, dispatch, totalRounds = 10 }: PlayerModalProps) => {
  const [players, setPlayers] = useState([...currentPlayers]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');

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
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      setError('Player name cannot be empty');
      return;
    }

    // Check for duplicates
    if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player names must be unique');
      return;
    }

    // Add the new player with 0 score
    const newPlayer = {
      id: uuidv4(),
      name: trimmedName,
      score: 0,
      isBanked: false
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setError('');
  };
  
  const handleRemovePlayer = (id: string) => {
    // Update local state
    setPlayers(players.filter(player => player.id !== id));
    setError('');
  };

  const handleSaveChanges = () => {
    // First, handle any new players
    const existingPlayerIds = currentPlayers.map(p => p.id);
    const newPlayers = players.filter(p => !existingPlayerIds.includes(p.id));
    
    newPlayers.forEach(player => {
      dispatch({
        type: 'ADD_PLAYER',
        payload: { player }
      });
    });
    
    // Handle removed players
    const currentPlayerIds = players.map(p => p.id);
    const removedPlayers = currentPlayers.filter(p => !currentPlayerIds.includes(p.id));
    
    removedPlayers.forEach(player => {
      dispatch({
        type: 'REMOVE_PLAYER',
        payload: { playerId: player.id }
      });
    });
    
    // Handle player reordering if the order has changed
    if (players.length > 0 && JSON.stringify(players.map(p => p.id)) !== JSON.stringify(currentPlayers.map(p => p.id))) {
      dispatch({
        type: 'REORDER_PLAYERS',
        payload: { players }
      });
    }
    
    onClose();
  };

  const handleReturnToSetup = () => {
    dispatch({
      type: 'RETURN_TO_SETUP',
      payload: {}
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPlayer();
    }
  };
  
  // Handle restarting with the same players
  const handleRestartWithSamePlayers = () => {
    dispatch({
      type: 'RESTART_WITH_SAME_PLAYERS',
      payload: {
        totalRounds, // Use the totalRounds prop (defaults to 10 if not provided)
      },
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="player-modal">
        <h3>Player Options</h3>
        
        <div className="modal-section">
          <h4>Manage Players</h4>
          <div className="input-group">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type player name and press Enter"
              className="player-input"
            />
            <button 
              onClick={handleAddPlayer}
              className="add-player-btn"
            >
              Add Player
            </button>
          </div>
          
          {players.length > 0 && (
            <div className="player-list-container">
              <h5>Current Players</h5>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={players.map(player => player.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="player-list">
                    {players.map((player) => (
                      <SortablePlayerItem 
                        key={player.id} 
                        player={player} 
                        onRemove={handleRemovePlayer} 
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handleSaveChanges}
            className="save-changes-btn"
          >
            Save Changes
          </button>
        </div>

        <div className="modal-actions">

          <button className="restart-game-button-modal" onClick={handleRestartWithSamePlayers}>
            Restart Game with Same Players
          </button>

          <button
            onClick={handleReturnToSetup}
            className="return-setup-btn"
          >
            Start New Game
          </button>

        </div>
        
        <button className="close-modal-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PlayerModal;