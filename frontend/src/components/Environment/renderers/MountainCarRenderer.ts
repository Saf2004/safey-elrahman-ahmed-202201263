import type { VisualizationTheme, MountainCarState } from '../../../types/environment';
import { drawGlow, pulseValue } from '../utils/visualizationUtils';

export function drawMountainCar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: MountainCarState,
  theme: VisualizationTheme,
  time: number
): void {
  drawNightSky(ctx, width, height, time);
  drawMountains(ctx, width, height, theme, time);
  drawTerrain(ctx, width, height, theme);
  drawGoalFlag(ctx, width, height, theme, time);
  drawCar(ctx, width, height, state, theme, time);
  drawInfoPanel(ctx, width, height, state, theme);
}

function drawNightSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  gradient.addColorStop(0, '#0a0a1a');
  gradient.addColorStop(0.3, '#1a1a3a');
  gradient.addColorStop(0.6, '#2a2a4a');
  gradient.addColorStop(1, '#3a3a5a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height * 0.6);
  
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 73) % width;
    const y = (i * 47) % (height * 0.4);
    const size = (i % 3) === 0 ? 1.5 : 0.8;
    const twinkle = 0.5 + 0.5 * Math.sin(time * 0.003 + i * 0.7);
    
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  const moonX = width * 0.85;
  const moonY = height * 0.12;
  const moonRadius = 25;
  
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3);
  moonGlow.addColorStop(0, 'rgba(255, 255, 240, 0.3)');
  moonGlow.addColorStop(0.5, 'rgba(255, 255, 240, 0.1)');
  moonGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
  ctx.fill();
  
  const moonGradient = ctx.createRadialGradient(
    moonX - 5, moonY - 5, 0,
    moonX, moonY, moonRadius
  );
  moonGradient.addColorStop(0, '#fffef0');
  moonGradient.addColorStop(0.8, '#f5f5dc');
  moonGradient.addColorStop(1, '#e8e8d0');
  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
  ctx.beginPath();
  ctx.arc(moonX - 8, moonY + 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 5, moonY - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 10, moonY + 8, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme,
  time: number
): void {
  const layers = [
    { color: '#1a2a1a', offset: 0.4, amplitude: 80 },
    { color: '#2a3a2a', offset: 0.5, amplitude: 60 },
    { color: '#3a4a3a', offset: 0.55, amplitude: 40 },
  ];
  
  layers.forEach((layer, idx) => {
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    for (let x = 0; x <= width; x += 5) {
      const y = height * layer.offset + 
        Math.sin(x * 0.008 + idx) * layer.amplitude +
        Math.sin(x * 0.015 + idx * 2) * layer.amplitude * 0.5;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  });
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme
): void {
  const getHeight = (x: number) => {
    const normalizedX = (x / width) * 1.8 - 1.2;
    return Math.sin(3 * normalizedX);
  };
  
  const terrainGradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
  terrainGradient.addColorStop(0, '#2d5016');
  terrainGradient.addColorStop(0.3, '#3d6020');
  terrainGradient.addColorStop(0.6, '#2d4516');
  terrainGradient.addColorStop(1, '#1a3009');
  
  ctx.fillStyle = terrainGradient;
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  for (let x = 0; x <= width; x++) {
    const h = getHeight(x);
    const y = height - 50 - (h + 1) * 80;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= width; x++) {
    const h = getHeight(x);
    const y = height - 50 - (h + 1) * 80;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  for (let i = 0; i < 30; i++) {
    const treeX = (i * 47 + 20) % width;
    const h = getHeight(treeX);
    const treeY = height - 50 - (h + 1) * 80;
    
    if (treeY < height - 30) {
      drawTree(ctx, treeX, treeY, 8 + (i % 5) * 2);
    }
  }
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  ctx.fillStyle = '#1a2a10';
  ctx.fillRect(x - size * 0.15, y, size * 0.3, size * 0.5);
  
  ctx.fillStyle = '#1a3a15';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.6, y);
  ctx.lineTo(x - size * 0.6, y);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#2a4a25';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.7);
  ctx.lineTo(x + size * 0.5, y - size * 0.1);
  ctx.lineTo(x - size * 0.5, y - size * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawGoalFlag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme,
  time: number
): void {
  const getHeight = (x: number) => {
    const normalizedX = (x / width) * 1.8 - 1.2;
    return Math.sin(3 * normalizedX);
  };
  
  const goalX = ((0.5 + 1.2) / 1.8) * width;
  const goalH = getHeight(goalX);
  const goalY = height - 50 - (goalH + 1) * 80;
  
  const pulse = pulseValue(time, 1.5, 0.8, 1);
  drawGlow(ctx, goalX, goalY - 20, 40, theme.accent, 0.4 * pulse);
  
  const poleGradient = ctx.createLinearGradient(goalX, goalY, goalX, goalY - 50);
  poleGradient.addColorStop(0, '#8B7355');
  poleGradient.addColorStop(1, '#D4C4B0');
  ctx.fillStyle = poleGradient;
  ctx.fillRect(goalX - 2, goalY - 50, 4, 50);
  
  const waveOffset = Math.sin(time * 0.005) * 3;
  
  ctx.fillStyle = theme.success;
  ctx.beginPath();
  ctx.moveTo(goalX + 2, goalY - 50);
  ctx.quadraticCurveTo(goalX + 20 + waveOffset, goalY - 42, goalX + 35, goalY - 38);
  ctx.quadraticCurveTo(goalX + 20 + waveOffset, goalY - 34, goalX + 2, goalY - 25);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(goalX, goalY - 52, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: MountainCarState,
  theme: VisualizationTheme,
  time: number
): void {
  const getHeight = (x: number) => {
    const normalizedX = (x / width) * 1.8 - 1.2;
    return Math.sin(3 * normalizedX);
  };
  
  const carX = ((state.position + 1.2) / 1.8) * width;
  const carH = getHeight(carX);
  const carY = height - 50 - (carH + 1) * 80;
  
  const dx = 2;
  const h1 = getHeight(carX - dx);
  const h2 = getHeight(carX + dx);
  const slope = (h2 - h1) / (dx * 2 / width * 1.8);
  const angle = Math.atan(slope * 80 / width * 1.8);
  
  ctx.save();
  ctx.translate(carX, carY);
  ctx.rotate(-angle);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const headlightGlow = ctx.createRadialGradient(18, -5, 0, 18, -5, 30);
  headlightGlow.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
  headlightGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = headlightGlow;
  ctx.beginPath();
  ctx.arc(18, -5, 30, -0.5, 0.5);
  ctx.fill();
  
  const bodyGradient = ctx.createLinearGradient(-20, -15, -20, 5);
  bodyGradient.addColorStop(0, '#FF6B6B');
  bodyGradient.addColorStop(0.3, '#FF5252');
  bodyGradient.addColorStop(0.7, '#E53935');
  bodyGradient.addColorStop(1, '#C62828');
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.roundRect(-20, -12, 40, 16, 4);
  ctx.fill();
  
  const roofGradient = ctx.createLinearGradient(-12, -25, -12, -12);
  roofGradient.addColorStop(0, '#FF5252');
  roofGradient.addColorStop(1, '#E53935');
  
  ctx.fillStyle = roofGradient;
  ctx.beginPath();
  ctx.moveTo(-12, -12);
  ctx.lineTo(-8, -22);
  ctx.lineTo(8, -22);
  ctx.lineTo(12, -12);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(-7, -20);
  ctx.lineTo(7, -20);
  ctx.lineTo(10, -12);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(-18, -10, 15, 3);
  
  const wheelRotation = time * 0.02;
  drawCarWheel(ctx, -12, 5, 6, wheelRotation);
  drawCarWheel(ctx, 12, 5, 6, wheelRotation);
  
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.arc(18, -5, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#F44336';
  ctx.beginPath();
  ctx.arc(-18, -5, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  if (Math.abs(state.velocity) > 0.01) {
    drawSpeedLines(ctx, carX, carY, state.velocity, angle, time);
  }
}

function drawCarWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number
): void {
  const wheelGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  wheelGradient.addColorStop(0, '#555');
  wheelGradient.addColorStop(0.6, '#333');
  wheelGradient.addColorStop(1, '#222');
  
  ctx.fillStyle = wheelGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const angle = rotation + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * radius * 0.3, y + Math.sin(angle) * radius * 0.3);
    ctx.lineTo(x + Math.cos(angle) * radius * 0.7, y + Math.sin(angle) * radius * 0.7);
    ctx.stroke();
  }
}

function drawSpeedLines(
  ctx: CanvasRenderingContext2D,
  carX: number,
  carY: number,
  velocity: number,
  angle: number,
  time: number
): void {
  const direction = velocity > 0 ? 1 : -1;
  const speed = Math.abs(velocity);
  
  ctx.save();
  ctx.translate(carX, carY);
  ctx.rotate(-angle);
  
  const lineCount = Math.min(5, Math.floor(speed * 50));
  
  for (let i = 0; i < lineCount; i++) {
    const offsetX = -direction * (20 + i * 8);
    const offsetY = -5 + (i - lineCount / 2) * 4;
    const length = 10 + speed * 100;
    const alpha = 0.3 - i * 0.05;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2 - i * 0.3;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX - direction * length, offsetY);
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: MountainCarState,
  theme: VisualizationTheme
): void {
  const panelX = 10;
  const panelY = 10;
  const panelWidth = 130;
  const panelHeight = 70;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Position', panelX + 10, panelY + 22);
  ctx.fillStyle = theme.primary;
  ctx.fillText(state.position.toFixed(3), panelX + 75, panelY + 22);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Velocity', panelX + 10, panelY + 42);
  ctx.fillStyle = state.velocity > 0 ? theme.success : theme.danger;
  ctx.fillText(state.velocity.toFixed(3), panelX + 75, panelY + 42);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Goal', panelX + 10, panelY + 62);
  ctx.fillStyle = theme.accent;
  ctx.fillText('0.5', panelX + 75, panelY + 62);
}




