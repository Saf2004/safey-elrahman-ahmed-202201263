import type { VisualizationTheme, DamState } from '../../../types/environment';
import { drawGlow, pulseValue, drawRoundedRect } from '../utils/visualizationUtils';

export function drawDam(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme,
  time: number
): void {
  drawSkyAndMountains(ctx, width, height, time);
  drawDamStructure(ctx, width, height, theme);
  drawWaterReservoir(ctx, width, height, state, theme, time);
  drawWaterfall(ctx, width, height, state, theme, time);
  drawInflowIndicator(ctx, width, height, state, theme, time);
  drawTargetLevel(ctx, width, height, state, theme);
  drawInfoPanel(ctx, width, height, state, theme);
}

function drawSkyAndMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGradient.addColorStop(0, '#1a365d');
  skyGradient.addColorStop(0.3, '#2563eb');
  skyGradient.addColorStop(0.6, '#60a5fa');
  skyGradient.addColorStop(1, '#bfdbfe');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.6);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 4; i++) {
    const cloudX = ((i * 100 + time * 0.01) % (width + 60)) - 30;
    const cloudY = 30 + i * 25;
    
    ctx.globalAlpha = 0.3 + (i % 2) * 0.1;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 15, 0, Math.PI * 2);
    ctx.arc(cloudX + 20, cloudY - 5, 18, 0, Math.PI * 2);
    ctx.arc(cloudX + 40, cloudY, 15, 0, Math.PI * 2);
    ctx.arc(cloudX + 20, cloudY + 8, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  const mountainGradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
  mountainGradient.addColorStop(0, '#374151');
  mountainGradient.addColorStop(0.5, '#4b5563');
  mountainGradient.addColorStop(1, '#6b7280');
  
  ctx.fillStyle = mountainGradient;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  ctx.lineTo(0, height * 0.5);
  ctx.lineTo(width * 0.15, height * 0.35);
  ctx.lineTo(width * 0.25, height * 0.45);
  ctx.lineTo(width * 0.35, height * 0.3);
  ctx.lineTo(width * 0.45, height * 0.4);
  ctx.lineTo(width * 0.5, height * 0.5);
  ctx.lineTo(width * 0.5, height * 0.7);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.7);
  ctx.lineTo(width * 0.5, height * 0.5);
  ctx.lineTo(width * 0.55, height * 0.45);
  ctx.lineTo(width * 0.65, height * 0.32);
  ctx.lineTo(width * 0.75, height * 0.4);
  ctx.lineTo(width * 0.85, height * 0.35);
  ctx.lineTo(width, height * 0.45);
  ctx.lineTo(width, height * 0.7);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.3);
  ctx.lineTo(width * 0.38, height * 0.32);
  ctx.lineTo(width * 0.35, height * 0.35);
  ctx.lineTo(width * 0.32, height * 0.32);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(width * 0.65, height * 0.32);
  ctx.lineTo(width * 0.68, height * 0.34);
  ctx.lineTo(width * 0.65, height * 0.37);
  ctx.lineTo(width * 0.62, height * 0.34);
  ctx.closePath();
  ctx.fill();
}

function drawDamStructure(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: VisualizationTheme
): void {
  const damLeft = width * 0.1;
  const damRight = width * 0.9;
  const damTop = height * 0.35;
  const damBottom = height - 40;
  const wallWidth = 40;
  
  const concreteGradient = ctx.createLinearGradient(0, 0, wallWidth, 0);
  concreteGradient.addColorStop(0, '#4b5563');
  concreteGradient.addColorStop(0.3, '#6b7280');
  concreteGradient.addColorStop(0.7, '#9ca3af');
  concreteGradient.addColorStop(1, '#6b7280');
  
  ctx.fillStyle = concreteGradient;
  ctx.beginPath();
  ctx.moveTo(0, damTop);
  ctx.lineTo(damLeft, damTop);
  ctx.lineTo(damLeft + wallWidth, damBottom);
  ctx.lineTo(0, damBottom);
  ctx.closePath();
  ctx.fill();
  
  const concreteGradient2 = ctx.createLinearGradient(width - wallWidth, 0, width, 0);
  concreteGradient2.addColorStop(0, '#6b7280');
  concreteGradient2.addColorStop(0.3, '#9ca3af');
  concreteGradient2.addColorStop(0.7, '#6b7280');
  concreteGradient2.addColorStop(1, '#4b5563');
  
  ctx.fillStyle = concreteGradient2;
  ctx.beginPath();
  ctx.moveTo(width, damTop);
  ctx.lineTo(damRight, damTop);
  ctx.lineTo(damRight - wallWidth, damBottom);
  ctx.lineTo(width, damBottom);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let y = damTop + 20; y < damBottom; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(damLeft + (y - damTop) / (damBottom - damTop) * wallWidth, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width, y);
    ctx.lineTo(damRight - (y - damTop) / (damBottom - damTop) * wallWidth, y);
    ctx.stroke();
  }
  
  const groundGradient = ctx.createLinearGradient(0, damBottom, 0, height);
  groundGradient.addColorStop(0, '#78350f');
  groundGradient.addColorStop(0.5, '#92400e');
  groundGradient.addColorStop(1, '#713f12');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, damBottom, width, height - damBottom);
  
  ctx.fillStyle = '#65a30d';
  for (let x = 0; x < width; x += 5) {
    const grassHeight = 3 + (x * 7 % 5);
    ctx.fillRect(x, damBottom - grassHeight, 2, grassHeight);
  }
}

function drawWaterReservoir(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme,
  time: number
): void {
  const damLeft = width * 0.1 + 40;
  const damRight = width * 0.9 - 40;
  const damTop = height * 0.35;
  const damBottom = height - 40;
  
  const maxWaterHeight = damBottom - damTop - 10;
  const waterHeight = (state.waterLevel / 100) * maxWaterHeight;
  const waterY = damBottom - waterHeight;
  
  const waterGradient = ctx.createLinearGradient(0, waterY, 0, damBottom);
  waterGradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
  waterGradient.addColorStop(0.3, 'rgba(37, 99, 235, 0.85)');
  waterGradient.addColorStop(0.7, 'rgba(29, 78, 216, 0.8)');
  waterGradient.addColorStop(1, 'rgba(30, 64, 175, 0.9)');
  
  ctx.fillStyle = waterGradient;
  ctx.fillRect(damLeft, waterY, damRight - damLeft, waterHeight);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(damLeft, waterY);
  
  for (let x = damLeft; x <= damRight; x += 5) {
    const waveOffset = Math.sin((x - damLeft) * 0.05 + time * 0.003) * 3;
    ctx.lineTo(x, waterY + waveOffset);
  }
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 8; i++) {
    const rippleX = damLeft + ((i * 73 + time * 0.02) % (damRight - damLeft));
    const rippleY = waterY + 20 + (i * 17 % 40);
    const rippleSize = 5 + (i % 3) * 3;
    
    ctx.beginPath();
    ctx.ellipse(rippleX, rippleY, rippleSize, rippleSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
  ctx.beginPath();
  ctx.ellipse(
    (damLeft + damRight) / 2,
    waterY + 15,
    (damRight - damLeft) * 0.3,
    10,
    0, 0, Math.PI * 2
  );
  ctx.fill();
}

function drawWaterfall(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme,
  time: number
): void {
  const outflowAmount = state.outflow || 0;
  if (outflowAmount <= 0) return;
  
  const damRight = width * 0.9 - 40;
  const spillX = damRight + 10;
  const spillY = height * 0.55;
  const spillWidth = 25;
  const fallHeight = height - 40 - spillY;
  
  ctx.fillStyle = 'rgba(96, 165, 250, 0.7)';
  ctx.fillRect(spillX, spillY, spillWidth, fallHeight);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 10; i++) {
    const dropX = spillX + (i * 7 % spillWidth);
    const dropY = spillY + ((time * 0.5 + i * 30) % fallHeight);
    const dropSize = 2 + (i % 3);
    
    ctx.beginPath();
    ctx.ellipse(dropX, dropY, dropSize, dropSize * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 6; i++) {
    const splashX = spillX + spillWidth / 2 + (i - 3) * 8;
    const splashY = height - 45;
    const splashSize = 3 + Math.sin(time * 0.01 + i) * 2;
    
    ctx.beginPath();
    ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawInflowIndicator(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme,
  time: number
): void {
  const centerX = width / 2;
  const startY = height * 0.2;
  const inflowScale = Math.min(3, Math.max(1, Math.floor(state.inflow / 5)));
  
  ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
  
  for (let i = 0; i < inflowScale * 3; i++) {
    const offsetX = (i - inflowScale * 1.5) * 12;
    const dropY = startY + ((time * 0.3 + i * 20) % 40);
    const dropSize = 4 + (i % 2) * 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX + offsetX, dropY - dropSize);
    ctx.quadraticCurveTo(
      centerX + offsetX + dropSize, dropY,
      centerX + offsetX, dropY + dropSize
    );
    ctx.quadraticCurveTo(
      centerX + offsetX - dropSize, dropY,
      centerX + offsetX, dropY - dropSize
    );
    ctx.fill();
  }
  
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#60a5fa';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💧'.repeat(inflowScale), centerX, startY - 10);
  ctx.restore();
}

function drawTargetLevel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme
): void {
  const damLeft = width * 0.1 + 40;
  const damRight = width * 0.9 - 40;
  const damTop = height * 0.35;
  const damBottom = height - 40;
  
  const maxWaterHeight = damBottom - damTop - 10;
  const targetLevel = state.targetLevel || 50;
  const targetY = damBottom - (targetLevel / 100) * maxWaterHeight;
  
  ctx.setLineDash([8, 4]);
  ctx.strokeStyle = theme.warning;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(damLeft - 10, targetY);
  ctx.lineTo(damRight + 10, targetY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.roundRect(damRight + 15, targetY - 12, 55, 24, 4);
  ctx.fill();
  
  ctx.fillStyle = theme.warning;
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TARGET', damRight + 20, targetY + 4);
  
  drawGlow(ctx, damRight + 42, targetY, 30, theme.warning, 0.2);
}

function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DamState,
  theme: VisualizationTheme
): void {
  const panelX = 10;
  const panelY = 10;
  const panelWidth = 120;
  const panelHeight = 80;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 10);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  
  const waterColor = state.waterLevel > 80 ? theme.danger : 
                     state.waterLevel > 60 ? theme.warning : theme.primary;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Water Level', panelX + 10, panelY + 20);
  ctx.fillStyle = waterColor;
  ctx.fillText(`${state.waterLevel.toFixed(0)}%`, panelX + 85, panelY + 20);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Inflow', panelX + 10, panelY + 40);
  ctx.fillStyle = theme.primary;
  ctx.fillText(`${state.inflow.toFixed(1)}`, panelX + 85, panelY + 40);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Target', panelX + 10, panelY + 60);
  ctx.fillStyle = theme.warning;
  ctx.fillText(`${(state.targetLevel || 50).toFixed(0)}%`, panelX + 85, panelY + 60);
  
  const barX = panelX + panelWidth + 10;
  const barWidth = 15;
  const barHeight = panelHeight - 10;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(barX, panelY + 5, barWidth, barHeight, 4);
  ctx.fill();
  
  const fillHeight = (state.waterLevel / 100) * (barHeight - 4);
  const barGradient = ctx.createLinearGradient(barX, panelY + barHeight - fillHeight, barX, panelY + barHeight);
  barGradient.addColorStop(0, '#60a5fa');
  barGradient.addColorStop(1, '#2563eb');
  ctx.fillStyle = barGradient;
  ctx.beginPath();
  ctx.roundRect(barX + 2, panelY + barHeight - fillHeight + 3, barWidth - 4, fillHeight, 2);
  ctx.fill();
}




