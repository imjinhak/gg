
import React from 'react';

interface HeaderProps {
  score: number;
  lives: number;
}

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ score, lives }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-3 flex justify-between items-center text-white font-bold text-xl bg-gray-800/50 rounded-b-lg select-none">
      <div>
        <span className="text-gray-400">SCORE:</span> {score}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">LIVES:</span>
        <div className="flex items-center">
          {Array.from({ length: lives > 0 ? lives : 0 }).map((_, i) => (
            <HeartIcon key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
