
import React from 'react';
import { GameState } from '../types';

interface GameOverlayProps {
  gameState: GameState;
  score: number;
  onPrimaryAction: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ gameState, score, onPrimaryAction }) => {
  if (gameState === 'playing') {
    return null;
  }

  const getMessage = () => {
    switch (gameState) {
      case 'start':
        return { title: 'Block Breaker', buttonText: 'Start Game' };
      case 'gameOver':
        return { title: 'Game Over', buttonText: 'Try Again' };
      case 'win':
        return { title: 'You Win!', buttonText: 'Play Again' };
      case 'paused':
        return { title: 'Paused', buttonText: 'Resume' };
      default:
        return null;
    }
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white z-10 rounded-lg">
      <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 select-none">
        {message.title}
      </h1>
      {(gameState === 'gameOver' || gameState === 'win') && (
        <p className="text-2xl mb-8 select-none">Your Score: {score}</p>
      )}
      <button
        onClick={onPrimaryAction}
        className="px-8 py-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-bold text-2xl rounded-lg shadow-lg hover:scale-105 transform transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {message.buttonText}
      </button>
      {gameState === 'start' && <p className="mt-8 text-gray-300 select-none">Move your mouse to control the paddle. Press 'P' to pause.</p>}
    </div>
  );
};
