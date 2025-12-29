import type { VisualizationTheme, GridPosition } from '../../../types/environment';
import { drawGlow, pulseValue, drawRoundedRect } from '../utils/visualizationUtils';

const GRID_SIZE = 5;
const HOLES: [number, number][] = [[1, 1], [2, 2], [1, 3], [2, 3]];
const GOAL: [number, number] = [4, 4];

export function drawFrozenLake(
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
  
  drawArcticBackground(ctx, width, height, theme, time);
  drawIceTiles(ctx, cellSize, offsetX, offsetY, theme, time);
  drawIceHoles(ctx, cellSize, offsetX, offsetY, theme, time);
  drawGift(ctx, cellSize, offsetX, offsetY, theme, time);
  drawElf(ctx, agentPos, cellSize, offsetX, offsetY, theme, time);
  drawSnowfall(ctx, width, height, time);
  drawFrostBorder(ctx, cellSize, offsetX, offsetY, theme);
}

function drawArcticBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme,
  time: number
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0B1426');
  gradient.addColorStop(0.3, '#0C2D48');
  gradient.addColorStop(0.7, '#145374');
  gradient.addColorStop(1, '#1A6A89');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 30; i++) {
    const x = (i * 83 + time * 0.002) % width;
    const y = (i * 67) % (height * 0.3);
    const size = (i % 2) + 0.5;
    const twinkle = Math.sin(time * 0.003 + i) * 0.3 + 0.7;
    
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  drawAurora(ctx, width, height, time);
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.15;
  
  for (let i = 0; i < 3; i++) {
    const waveOffset = time * 0.0005 + i * 0.5;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    
    const colors = [
      ['#00ff88', '#00ffcc', '#00ff88'],
      ['#00ccff', '#88ffcc', '#00ccff'],
      ['#ff00ff', '#ff88cc', '#ff00ff'],
    ];
    
    gradient.addColorStop(0, colors[i][0]);
    gradient.addColorStop(0.5, colors[i][1]);
    gradient.addColorStop(1, colors[i][2]);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.1 + i * 20);
    
    for (let x = 0; x <= width; x += 10) {
      const y = height * 0.1 + 
        Math.sin(x * 0.01 + waveOffset) * 30 + 
        Math.sin(x * 0.02 + waveOffset * 2) * 15 +
        i * 20;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
}

function drawIceTiles(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme,
  time: number
): void {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;
      
      const isHole = HOLES.some(([r, c]) => r === row && c === col);
      const isGoal = row === GOAL[0] && col === GOAL[1];
      
      if (!isHole && !isGoal) {
        const iceGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        iceGradient.addColorStop(0, '#E8F4FC');
        iceGradient.addColorStop(0.3, '#C5E3F6');
        iceGradient.addColorStop(0.7, '#A8D8EA');
        iceGradient.addColorStop(1, '#E8F4FC');
        
        ctx.fillStyle = iceGradient;
        drawRoundedRect(ctx, x + 3, y + 3, cellSize - 6, cellSize - 6, 6);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        drawIceCracks(ctx, x, y, cellSize, row, col);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + cellSize * 0.3, y + cellSize * 0.3, cellSize * 0.15, cellSize * 0.08, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawIceCracks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  row: number,
  col: number
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  const seed = row * 10 + col;
  const crackCount = (seed % 3) + 1;
  
  for (let i = 0; i < crackCount; i++) {
    const startX = x + ((seed * (i + 1) * 17) % 80) / 100 * cellSize;
    const startY = y + ((seed * (i + 1) * 23) % 80) / 100 * cellSize;
    const endX = startX + ((seed * (i + 1) * 31) % 40) / 100 * cellSize;
    const endY = startY + ((seed * (i + 1) * 37) % 40) / 100 * cellSize;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function drawIceHoles(
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
    const pulse = pulseValue(time, 0.3, 0.95, 1.05);
    
    const waterGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      cellSize * 0.45
    );
    waterGradient.addColorStop(0, '#0A4C6E');
    waterGradient.addColorStop(0.4, '#063A52');
    waterGradient.addColorStop(0.8, '#042638');
    waterGradient.addColorStop(1, '#021820');
    
    ctx.fillStyle = waterGradient;
    drawRoundedRect(ctx, x + 5, y + 5, cellSize - 10, cellSize - 10, 8);
    ctx.fill();
    
    const iceRimGradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
    iceRimGradient.addColorStop(0, '#B8E0F2');
    iceRimGradient.addColorStop(0.5, '#88C8E8');
    iceRimGradient.addColorStop(1, '#B8E0F2');
    
    ctx.strokeStyle = iceRimGradient;
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, x + 5, y + 5, cellSize - 10, cellSize - 10, 8);
    ctx.stroke();
    
    const rippleRadius = ((time * 0.03) % 30) + 10;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - rippleRadius / 100})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rippleRadius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.ellipse(centerX - 5, centerY - 5, 8, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGift(
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
  const bounce = Math.sin(time * 0.003) * 3;
  const pulse = pulseValue(time, 1.5, 0.9, 1);
  
  const snowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, cellSize * 0.5);
  snowGradient.addColorStop(0, '#FFFFFF');
  snowGradient.addColorStop(0.5, '#E8F4FC');
  snowGradient.addColorStop(1, '#C5E3F6');
  ctx.fillStyle = snowGradient;
  drawRoundedRect(ctx, x + 3, y + 3, cellSize - 6, cellSize - 6, 6);
  ctx.fill();
  
  for (let i = 0; i < 6; i++) {
    const angle = (time * 0.002 + (i * Math.PI) / 3);
    const sparkX = centerX + Math.cos(angle) * cellSize * 0.4 * pulse;
    const sparkY = centerY + Math.sin(angle) * cellSize * 0.4 * pulse;
    
    ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 0.01 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawGlow(ctx, centerX, centerY + bounce, cellSize * 0.5, '#FFD700', 0.4);
  
  ctx.font = `${cellSize * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎁', centerX, centerY + bounce);
}

function drawElf(
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
  const bounce = Math.sin(time * 0.006) * 4;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y + cellSize * 0.35, cellSize * 0.2, cellSize * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawGlow(ctx, x, y + bounce, cellSize * 0.5, '#00ff88', 0.3);
  
  ctx.save();
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 15;
  ctx.font = `${cellSize * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧝', x, y + bounce);
  ctx.restore();
  
  for (let i = 0; i < 3; i++) {
    const trailX = x - (pos.x - Math.floor(pos.x)) * cellSize * 0.3 * (i + 1);
    const trailY = y + bounce + i * 2;
    const alpha = 0.3 - i * 0.1;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, 3 - i, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSnowfall(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  
  for (let i = 0; i < 40; i++) {
    const baseX = (i * 97) % width;
    const speed = 0.5 + (i % 3) * 0.3;
    const drift = Math.sin(time * 0.001 + i) * 20;
    
    const x = (baseX + drift + time * 0.02) % width;
    const y = ((time * speed + i * 50) % (height + 50)) - 25;
    const size = 1 + (i % 3);
    
    ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}

function drawFrostBorder(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  theme: VisualizationTheme
): void {
  const borderGradient = ctx.createLinearGradient(
    offsetX,
    offsetY,
    offsetX + GRID_SIZE * cellSize,
    offsetY + GRID_SIZE * cellSize
  );
  borderGradient.addColorStop(0, '#88DDFF');
  borderGradient.addColorStop(0.3, '#FFFFFF');
  borderGradient.addColorStop(0.5, '#88DDFF');
  borderGradient.addColorStop(0.7, '#FFFFFF');
  borderGradient.addColorStop(1, '#88DDFF');
  
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 4;
  drawRoundedRect(
    ctx,
    offsetX - 2,
    offsetY - 2,
    GRID_SIZE * cellSize + 4,
    GRID_SIZE * cellSize + 4,
    8
  );
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  drawRoundedRect(
    ctx,
    offsetX - 4,
    offsetY - 4,
    GRID_SIZE * cellSize + 8,
    GRID_SIZE * cellSize + 8,
    10
  );
  ctx.stroke();
}




