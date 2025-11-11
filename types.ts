
export interface Brick {
  x: number;
  y: number;
  status: 1 | 0;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface Paddle {
  x: number;
}

export type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'win';
