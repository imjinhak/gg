
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ball, Brick, GameState, Paddle } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y_OFFSET,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BRICK_ROW_COUNT,
  BRICK_COLUMN_COUNT,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  INITIAL_LIVES,
  BRICK_COLORS,
} from './constants';
import { Header } from './components/Header';
import { GameOverlay } from './components/GameOverlay';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);

  const ballRef = useRef<Ball>({} as Ball);
  const paddleRef = useRef<Paddle>({} as Paddle);
  const bricksRef = useRef<Brick[]>([]);

  const resetBricks = () => {
    const newBricks: Brick[] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
        });
      }
    }
    bricksRef.current = newBricks;
  };

  const resetBallAndPaddle = useCallback(() => {
    paddleRef.current = {
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    };
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT - BALL_RADIUS,
      dx: BALL_INITIAL_SPEED * (Math.random() < 0.5 ? 1 : -1),
      dy: -BALL_INITIAL_SPEED,
      radius: BALL_RADIUS,
    };
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    resetBricks();
    resetBallAndPaddle();
  }, [resetBallAndPaddle]);

  const handlePrimaryAction = () => {
    if (gameState === 'start' || gameState === 'gameOver' || gameState === 'win') {
        resetGame();
        setGameState('playing');
    } else if (gameState === 'paused') {
        setGameState('playing');
    }
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const drawElements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw Bricks
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.closePath();
      }
    });

    // Draw Ball
    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.closePath();
    
    // Draw Paddle
    const paddle = paddleRef.current;
    ctx.beginPath();
    ctx.rect(paddle.x, CANVAS_HEIGHT - PADDLE_Y_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#67e8f9';
    ctx.fill();
    ctx.closePath();
  }, []);

  const collisionDetection = useCallback(() => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;
    let activeBricks = 0;

    for(const brick of bricksRef.current) {
        if (brick.status === 1) {
            if (
                ball.x > brick.x - ball.radius &&
                ball.x < brick.x + BRICK_WIDTH + ball.radius &&
                ball.y > brick.y - ball.radius &&
                ball.y < brick.y + BRICK_HEIGHT + ball.radius
            ) {
                ball.dy = -ball.dy;
                brick.status = 0;
                setScore(prev => prev + 10);
            } else {
              activeBricks++;
            }
        }
    }

    if (activeBricks === 0 && bricksRef.current.length > 0) {
      setGameState('win');
    }

    if (
        ball.y + ball.dy > CANVAS_HEIGHT - PADDLE_Y_OFFSET - PADDLE_HEIGHT - ball.radius &&
        ball.y + ball.dy < CANVAS_HEIGHT - PADDLE_Y_OFFSET + PADDLE_HEIGHT
    ) {
        if (ball.x > paddle.x && ball.x < paddle.x + PADDLE_WIDTH) {
           let collidePoint = ball.x - (paddle.x + PADDLE_WIDTH / 2);
           collidePoint = collidePoint / (PADDLE_WIDTH / 2);
           const angle = collidePoint * (Math.PI / 3);
           ball.dx = BALL_INITIAL_SPEED * Math.sin(angle);
           ball.dy = -BALL_INITIAL_SPEED * Math.cos(angle);
        }
    }
    
    if (ball.x + ball.dx > CANVAS_WIDTH - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > CANVAS_HEIGHT - ball.radius) {
      setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
              setGameState('gameOver');
          } else {
              resetBallAndPaddle();
          }
          return newLives;
      });
    }
  }, [resetBallAndPaddle]);

  const gameLoop = useCallback(() => {
    drawElements();
    collisionDetection();
    
    ballRef.current.x += ballRef.current.dx;
    ballRef.current.y += ballRef.current.dy;
    
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [drawElements, collisionDetection]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationFrameIdRef.current);
      drawElements(); // Draw one final frame
    }
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [gameState, gameLoop, drawElements]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
            paddleRef.current.x = Math.max(0, Math.min(relativeX - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH));
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            setGameState(current => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-mono">
        <Header score={score} lives={lives} />
        <div className="relative mt-4 shadow-2xl shadow-cyan-500/20">
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-gray-800 rounded-lg"
            />
            <GameOverlay 
                gameState={gameState} 
                score={score}
                onPrimaryAction={handlePrimaryAction} 
            />
        </div>
    </div>
  );
};

export default App;
