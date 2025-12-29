import type { VisualizationTheme, GridPosition } from '../../../types/environment';
import { drawGlow, pulseValue, drawRoundedRect } from '../utils/visualizationUtils';

const GRID_SIZE = 5;
const HOLES: [number, number][] = [[1, 1], [1, 3], [2, 3], [3, 0]];
const GOAL: [number, number] = [4, 4];

export function drawGridWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  agentPos: GridPosition,
  theme: VisualizationTheme,
  time: number
): void {
  const cellSize = Math.min(width, height) / GRID_SIZE;
  const offsetX = (width - cellSize * GRID_SIZE) / 2;
  const offsetY = (height - cellSize * GRID_SIZE) / 2;
  
  drawBackground(ctx, width, height, theme, time);
  drawGrid(ctx, cellSize, offsetX, offsetY, theme);
  drawHoles(ctx, cellSize, offsetX, offsetY, theme, time);
  drawGoal(ctx, cellSize, offsetX, offsetY, theme, time);
  drawAgent(ctx, agentPos, cellSize, offsetX, offsetY, theme, time);
  drawGridOverlay(ctx, cellSize, offsetX, offsetY, theme);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme,
  time: number
): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height)
  );
  gradient.addColorStop(0, theme.surface);
  gradient.addColorStop(1, theme.background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 50; i++) {
    const x = ((i * 73 + time * 0.01) % width);
    const y = ((i * 47 + i) % height);
    const size = (i % 3) + 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme
): void {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;
      const isEven = (row + col) % 2 === 0;
      
      ctx.fillStyle = isEven
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.02)';
      
      drawRoundedRect(ctx, x + 2, y + 2, cellSize - 4, cellSize - 4, 8);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawHoles(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme,
  time: number
): void {
  HOLES.forEach(([row, col]) => {
    const x = offsetX + col * cellSize;
    const y = offsetY + row * cellSize;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const pulse = pulseValue(time, 0.5, 0.7, 1);
    
    const holeGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      cellSize * 0.45
    );
    holeGradient.addColorStop(0, theme.danger);
    holeGradient.addColorStop(0.6, `${theme.danger}aa`);
    holeGradient.addColorStop(1, `${theme.danger}00`);
    
    ctx.fillStyle = holeGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize * 0.4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    drawGlow(ctx, centerX, centerY, cellSize * 0.6, theme.danger, 0.3 * pulse);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = `${cellSize * 0.35}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.text;
    ctx.fillText('☠️', centerX, centerY);
  });
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme,
  time: number
): void {
  const [row, col] = GOAL;
  const x = offsetX + col * cellSize;
  const y = offsetY + row * cellSize;
  const centerX = x + cellSize / 2;
  const centerY = y + cellSize / 2;
  const pulse = pulseValue(time, 1, 0.9, 1.1);
  
  const goalGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    cellSize * 0.5
  );
  goalGradient.addColorStop(0, `${theme.success}ff`);
  goalGradient.addColorStop(0.5, `${theme.success}88`);
  goalGradient.addColorStop(1, `${theme.success}00`);
  
  ctx.fillStyle = goalGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, cellSize * 0.45 * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  drawGlow(ctx, centerX, centerY, cellSize * 0.8, theme.success, 0.5 * pulse);
  
  for (let i = 0; i < 4; i++) {
    const angle = (time * 0.002 + (i * Math.PI) / 2);
    const sparkX = centerX + Math.cos(angle) * cellSize * 0.3;
    const sparkY = centerY + Math.sin(angle) * cellSize * 0.3;
    
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.font = `${cellSize * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎯', centerX, centerY);
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  pos: GridPosition,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme,
  time: number
): void {
  const x = offsetX + (pos.x + 0.5) * cellSize;
  const y = offsetY + (pos.y + 0.5) * cellSize;
  const radius = cellSize * 0.32;
  const bounce = Math.sin(time * 0.005) * 3;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius + 5, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawGlow(ctx, x, y + bounce, radius * 2.5, theme.primary, 0.6);
  
  const agentGradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y + bounce - radius * 0.3,
    0,
    x,
    y + bounce,
    radius
  );
  agentGradient.addColorStop(0, theme.secondary);
  agentGradient.addColorStop(0.7, theme.primary);
  agentGradient.addColorStop(1, `${theme.primary}88`);
  
  ctx.fillStyle = agentGradient;
  ctx.beginPath();
  ctx.arc(x, y + bounce, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y + bounce - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.font = `${cellSize * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🤖', x, y + bounce);
}

function drawGridOverlay(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + i * cellSize, offsetY);
    ctx.lineTo(offsetX + i * cellSize, offsetY + GRID_SIZE * cellSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + i * cellSize);
    ctx.lineTo(offsetX + GRID_SIZE * cellSize, offsetY + i * cellSize);
    ctx.stroke();
  }
  
  const borderGradient = ctx.createLinearGradient(
    offsetX,
    offsetY,
    offsetX + GRID_SIZE * cellSize,
    offsetY + GRID_SIZE * cellSize
  );
  borderGradient.addColorStop(0, theme.primary);
  borderGradient.addColorStop(0.5, theme.secondary);
  borderGradient.addColorStop(1, theme.primary);
  
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 3;
  drawRoundedRect(
    ctx,
    offsetX,
    offsetY,
    GRID_SIZE * cellSize,
    GRID_SIZE * cellSize,
    4
  );
  ctx.stroke();
}




