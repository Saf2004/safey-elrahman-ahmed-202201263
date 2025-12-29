import type { VisualizationTheme, CartPoleState } from '../../../types/environment';
import { drawGlow, pulseValue } from '../utils/visualizationUtils';

export function drawCartPole(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CartPoleState,
  theme: VisualizationTheme,
  time: number
): void {
  drawSunsetBackground(ctx, width, height, time);
  drawTrack(ctx, width, height, theme);
  drawCart(ctx, width, height, state, theme, time);
  drawPole(ctx, width, height, state, theme, time);
  drawInfoPanel(ctx, width, height, state, theme);
}

function drawSunsetBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a0a2e');
  gradient.addColorStop(0.3, '#2d1b4e');
  gradient.addColorStop(0.5, '#5c3d6e');
  gradient.addColorStop(0.7, '#e85d04');
  gradient.addColorStop(0.85, '#ff8800');
  gradient.addColorStop(1, '#ffb74d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  const sunY = height * 0.65;
  const sunRadius = 50;
  
  const sunGradient = ctx.createRadialGradient(
    width / 2, sunY, 0,
    width / 2, sunY, sunRadius * 2
  );
  sunGradient.addColorStop(0, '#fffde7');
  sunGradient.addColorStop(0.3, '#ffeb3b');
  sunGradient.addColorStop(0.6, '#ff9800');
  sunGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(width / 2, sunY, sunRadius * 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(width / 2, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 15; i++) {
    const x = (i * 71 + time * 0.01) % width;
    const y = (i * 43) % (height * 0.4);
    const size = (i % 2) + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawClouds(ctx, width, height, time);
}

function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.3;
  
  for (let i = 0; i < 3; i++) {
    const baseX = ((i * 150 + time * 0.02) % (width + 100)) - 50;
    const y = 30 + i * 40;
    
    const cloudGradient = ctx.createRadialGradient(
      baseX, y, 0,
      baseX, y, 40
    );
    cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    cloudGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = cloudGradient;
    
    ctx.beginPath();
    ctx.arc(baseX, y, 25, 0, Math.PI * 2);
    ctx.arc(baseX + 30, y - 5, 20, 0, Math.PI * 2);
    ctx.arc(baseX + 50, y, 22, 0, Math.PI * 2);
    ctx.arc(baseX + 25, y + 10, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawTrack(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme
): void {
  const groundY = height - 60;
  
  const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
  groundGradient.addColorStop(0, '#2d1b0e');
  groundGradient.addColorStop(0.3, '#4a2c17');
  groundGradient.addColorStop(1, '#1a0f05');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, width, height - groundY);
  
  const grassY = groundY - 5;
  for (let x = 0; x < width; x += 8) {
    const grassHeight = 5 + (x * 7 % 10);
    const hue = 100 + (x % 30);
    ctx.strokeStyle = `hsl(${hue}, 60%, 35%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, grassY);
    ctx.quadraticCurveTo(x + 2, grassY - grassHeight, x + 4, grassY);
    ctx.stroke();
  }
  
  const railY = groundY - 15;
  const railGradient = ctx.createLinearGradient(0, railY - 10, 0, railY + 10);
  railGradient.addColorStop(0, '#8B7355');
  railGradient.addColorStop(0.5, '#5D4E37');
  railGradient.addColorStop(1, '#3D3225');
  
  ctx.fillStyle = railGradient;
  ctx.fillRect(20, railY, width - 40, 12);
  
  ctx.strokeStyle = '#6B5B45';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, railY, width - 40, 12);
  
  ctx.fillStyle = '#4A4035';
  for (let x = 30; x < width - 30; x += 25) {
    ctx.fillRect(x, railY + 12, 8, 8);
  }
  
  ctx.fillStyle = '#A0A0A0';
  ctx.fillRect(20, railY + 3, width - 40, 3);
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(20, railY + 3, width - 40, 1);
}

function drawCart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CartPoleState,
  theme: VisualizationTheme,
  time: number
): void {
  const groundY = height - 60;
  const railY = groundY - 15;
  
  const cartWidth = 70;
  const cartHeight = 35;
  const cartX = ((state.cartPos + 2.4) / 4.8) * (width - cartWidth - 40) + 20;
  const cartY = railY - cartHeight;
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(cartX + cartWidth / 2, railY + 15, cartWidth * 0.4, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const cartGradient = ctx.createLinearGradient(cartX, cartY, cartX, cartY + cartHeight);
  cartGradient.addColorStop(0, '#4A4A4A');
  cartGradient.addColorStop(0.3, '#3A3A3A');
  cartGradient.addColorStop(0.7, '#2A2A2A');
  cartGradient.addColorStop(1, '#1A1A1A');
  
  ctx.fillStyle = cartGradient;
  ctx.beginPath();
  ctx.roundRect(cartX, cartY, cartWidth, cartHeight, 5);
  ctx.fill();
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(cartX + 5, cartY + 5, cartWidth - 10, 8);
  
  const wheelRadius = 10;
  const wheelY = railY + 3;
  
  drawWheel(ctx, cartX + 15, wheelY, wheelRadius, time);
  drawWheel(ctx, cartX + cartWidth - 15, wheelY, wheelRadius, time);
  
  ctx.restore();
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number
): void {
  const rotation = time * 0.01;
  
  const wheelGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  wheelGradient.addColorStop(0, '#555');
  wheelGradient.addColorStop(0.7, '#333');
  wheelGradient.addColorStop(1, '#222');
  
  ctx.fillStyle = wheelGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = rotation + (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * radius * 0.7, y + Math.sin(angle) * radius * 0.7);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawPole(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CartPoleState,
  theme: VisualizationTheme,
  time: number
): void {
  const groundY = height - 60;
  const railY = groundY - 15;
  
  const cartWidth = 70;
  const cartHeight = 35;
  const cartX = ((state.cartPos + 2.4) / 4.8) * (width - cartWidth - 40) + 20;
  const cartCenterX = cartX + cartWidth / 2;
  const pivotY = railY - cartHeight;
  
  const poleLength = 100;
  const poleEndX = cartCenterX + Math.sin(state.poleAngle) * poleLength;
  const poleEndY = pivotY - Math.cos(state.poleAngle) * poleLength;
  
  ctx.save();
  
  const isBalanced = Math.abs(state.poleAngle) < 0.2;
  const glowColor = isBalanced ? theme.success : theme.warning;
  const glowIntensity = isBalanced ? 0.5 : 0.3;
  
  drawGlow(ctx, poleEndX, poleEndY, 30, glowColor, glowIntensity);
  
  const poleGradient = ctx.createLinearGradient(
    cartCenterX, pivotY,
    poleEndX, poleEndY
  );
  poleGradient.addColorStop(0, '#D2691E');
  poleGradient.addColorStop(0.3, '#CD853F');
  poleGradient.addColorStop(0.7, '#8B4513');
  poleGradient.addColorStop(1, '#A0522D');
  
  ctx.strokeStyle = poleGradient;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cartCenterX, pivotY);
  ctx.lineTo(poleEndX, poleEndY);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cartCenterX - 3, pivotY);
  ctx.lineTo(poleEndX - 3, poleEndY);
  ctx.stroke();
  
  const ballGradient = ctx.createRadialGradient(
    poleEndX - 3, poleEndY - 3, 0,
    poleEndX, poleEndY, 12
  );
  ballGradient.addColorStop(0, '#FF6347');
  ballGradient.addColorStop(0.5, '#FF4500');
  ballGradient.addColorStop(1, '#CC3700');
  
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(poleEndX, poleEndY, 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(poleEndX - 3, poleEndY - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  
  const pivotGradient = ctx.createRadialGradient(
    cartCenterX, pivotY, 0,
    cartCenterX, pivotY, 8
  );
  pivotGradient.addColorStop(0, '#888');
  pivotGradient.addColorStop(1, '#444');
  
  ctx.fillStyle = pivotGradient;
  ctx.beginPath();
  ctx.arc(cartCenterX, pivotY, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CartPoleState,
  theme: VisualizationTheme
): void {
  const panelX = 10;
  const panelY = 10;
  const panelWidth = 130;
  const panelHeight = 60;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = theme.text;
  ctx.textAlign = 'left';
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('Position', panelX + 10, panelY + 20);
  ctx.fillStyle = theme.primary;
  ctx.fillText(`${state.cartPos.toFixed(2)}`, panelX + 75, panelY + 20);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('Angle', panelX + 10, panelY + 40);
  
  const angleDeg = (state.poleAngle * 180 / Math.PI);
  const isBalanced = Math.abs(angleDeg) < 12;
  ctx.fillStyle = isBalanced ? theme.success : theme.warning;
  ctx.fillText(`${angleDeg.toFixed(1)}°`, panelX + 75, panelY + 40);
}




