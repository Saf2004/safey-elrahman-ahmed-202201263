import type { VisualizationTheme, BreakoutState } from '../../../types/environment';
import { drawGlow, pulseValue } from '../utils/visualizationUtils';

export function drawBreakout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: BreakoutState,
  theme: VisualizationTheme,
  time: number
): void {
  drawArcadeBackground(ctx, width, height, time);
  drawBricks(ctx, width, height, state, theme, time);
  drawPaddle(ctx, width, height, state, theme, time);
  drawBall(ctx, width, height, state, theme, time);
  drawScorePanel(ctx, width, height, state, theme);
  drawScanlines(ctx, width, height, time);
}

function drawArcadeBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height)
  );
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16162a');
  gradient.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
  ctx.lineWidth = 1;
  
  const gridSize = 30;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, width - 10, height - 10);
  
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, width - 16, height - 16);
}

function drawBricks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: BreakoutState,
  theme: VisualizationTheme,
  time: number
): void {
  const brickRows = 4;
  const brickCols = 10;
  const brickWidth = (width - 30) / brickCols;
  const brickHeight = 18;
  const startY = 50;
  
  const rowColors = [
    { main: '#FF6B6B', glow: '#FF8888' },
    { main: '#FFE66D', glow: '#FFF088' },
    { main: '#4ECDC4', glow: '#6EEEE6' },
    { main: '#A78BFA', glow: '#C4AAFF' },
  ];
  
  // Use bricks array from state if available, otherwise show all bricks
  const bricks = state.bricks || Array(4).fill(null).map(() => Array(10).fill(true));
  
  for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < brickCols; col++) {
      // Only draw brick if it exists (not destroyed)
      if (!bricks[row] || !bricks[row][col]) {
        continue;
      }
      
      const x = 15 + col * brickWidth;
      const y = startY + row * (brickHeight + 4);
      const colors = rowColors[row];
      
      const pulse = pulseValue(time + row * 100 + col * 50, 0.5, 0.9, 1);
      
      ctx.save();
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 8 * pulse;
      
      const brickGradient = ctx.createLinearGradient(x, y, x, y + brickHeight);
      brickGradient.addColorStop(0, colors.glow);
      brickGradient.addColorStop(0.3, colors.main);
      brickGradient.addColorStop(0.7, colors.main);
      brickGradient.addColorStop(1, `${colors.main}aa`);
      
      ctx.fillStyle = brickGradient;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 1, brickWidth - 4, brickHeight - 2, 3);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x + 4, y + 3, brickWidth - 8, 3);
      
      ctx.restore();
    }
  }
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: BreakoutState,
  theme: VisualizationTheme,
  time: number
): void {
  const paddleWidth = 60;
  const paddleHeight = 12;
  const paddleY = height - 35;
  const paddleX = (state.paddleX / 160) * (width - paddleWidth - 20) + 10;
  
  ctx.save();
  
  drawGlow(ctx, paddleX + paddleWidth / 2, paddleY + paddleHeight / 2, 40, theme.success, 0.3);
  
  const paddleGradient = ctx.createLinearGradient(paddleX, paddleY, paddleX, paddleY + paddleHeight);
  paddleGradient.addColorStop(0, '#4ADE80');
  paddleGradient.addColorStop(0.3, '#22C55E');
  paddleGradient.addColorStop(0.7, '#16A34A');
  paddleGradient.addColorStop(1, '#15803D');
  
  ctx.shadowColor = '#4ADE80';
  ctx.shadowBlur = 15;
  
  ctx.fillStyle = paddleGradient;
  ctx.beginPath();
  ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 6);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(paddleX + 4, paddleY + 2, paddleWidth - 8, 3);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(paddleX + paddleWidth / 2, paddleY + paddleHeight / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: BreakoutState,
  theme: VisualizationTheme,
  time: number
): void {
  const ballX = (state.ballX / 160) * width;
  const ballY = (state.ballY / 200) * height;
  const ballRadius = 8;
  
  ctx.save();
  
  const trailCount = 5;
  for (let i = trailCount; i > 0; i--) {
    const trailX = ballX - (state.ballVelX || 0) * i * 2;
    const trailY = ballY - (state.ballVelY || 0) * i * 2;
    const alpha = 0.15 - i * 0.03;
    const size = ballRadius * (1 - i * 0.1);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 20;
  
  const ballGradient = ctx.createRadialGradient(
    ballX - 2, ballY - 2, 0,
    ballX, ballY, ballRadius
  );
  ballGradient.addColorStop(0, '#ffffff');
  ballGradient.addColorStop(0.5, '#f0f0f0');
  ballGradient.addColorStop(1, '#d0d0d0');
  
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(ballX - 2, ballY - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawScorePanel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: BreakoutState,
  theme: VisualizationTheme
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(10, 10, width - 20, 30);
  
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, 30);
  
  ctx.font = 'bold 14px "Press Start 2P", monospace';
  ctx.fillStyle = '#22D3EE';
  ctx.textAlign = 'left';
  ctx.fillText('BREAKOUT', 20, 30);
  
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F472B6';
  
  let heartsText = '';
  for (let i = 0; i < state.lives; i++) {
    heartsText += '❤️';
  }
  for (let i = state.lives; i < 5; i++) {
    heartsText += '🖤';
  }
  ctx.font = '12px Arial';
  ctx.fillText(heartsText, width - 20, 30);
}

function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  
  ctx.globalAlpha = 0.03;
  const flickerY = (time * 0.5) % height;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, flickerY, width, 3);
  
  ctx.restore();
  
  const vignetteGradient = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.3,
    width / 2, height / 2, height * 0.8
  );
  vignetteGradient.addColorStop(0, 'transparent');
  vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, width, height);
}




