import type { VisualizationTheme, Particle, GridPosition } from '../../../types/environment';

export const THEMES: Record<string, VisualizationTheme> = {
  midnight: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    glow: 'rgba(99, 102, 241, 0.5)',
  },
  arctic: {
    primary: '#06B6D4',
    secondary: '#0EA5E9',
    accent: '#F472B6',
    background: '#0C4A6E',
    surface: '#164E63',
    text: '#F0F9FF',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    glow: 'rgba(6, 182, 212, 0.5)',
  },
  neon: {
    primary: '#22D3EE',
    secondary: '#A78BFA',
    accent: '#F472B6',
    background: '#18181B',
    surface: '#27272A',
    text: '#FAFAFA',
    success: '#4ADE80',
    danger: '#FB7185',
    warning: '#FDE047',
    glow: 'rgba(34, 211, 238, 0.6)',
  },
  forest: {
    primary: '#22C55E',
    secondary: '#84CC16',
    accent: '#FBBF24',
    background: '#14532D',
    surface: '#166534',
    text: '#F0FDF4',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FDE047',
    glow: 'rgba(34, 197, 94, 0.5)',
  },
  sunset: {
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#A78BFA',
    background: '#1C1917',
    surface: '#292524',
    text: '#FAFAF9',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FBBF24',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
};

export const ENVIRONMENT_THEMES: Record<string, string> = {
  gridworld: 'midnight',
  frozenlake: 'arctic',
  cartpole: 'sunset',
  mountaincar: 'forest',
  breakout: 'neon',
  gym4real_dam: 'midnight',
};

export function createParticle(
  x: number,
  y: number,
  color: string,
  options: Partial<Particle> = {}
): Particle {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 1,
    maxLife: 60,
    size: 3,
    color,
    alpha: 1,
    ...options,
  };
}

export function updateParticle(particle: Particle): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + 0.1,
    life: particle.life - 1 / particle.maxLife,
    alpha: particle.life,
    size: particle.size * 0.98,
  };
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle
): void {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function lerpPosition(
  start: GridPosition,
  end: GridPosition,
  t: number
): GridPosition {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}

export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number = 1
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color.replace(')', `, ${0.6 * intensity})`).replace('rgb', 'rgba'));
  gradient.addColorStop(0.5, color.replace(')', `, ${0.3 * intensity})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 12,
  theme: VisualizationTheme
): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();
  
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}

export function drawIsometricTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  topColor: string,
  leftColor: string,
  rightColor: string
): void {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(x, y - halfHeight);
  ctx.lineTo(x + halfWidth, y);
  ctx.lineTo(x, y + halfHeight);
  ctx.lineTo(x - halfWidth, y);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(x - halfWidth, y);
  ctx.lineTo(x, y + halfHeight);
  ctx.lineTo(x, y + halfHeight + depth);
  ctx.lineTo(x - halfWidth, y + depth);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(x + halfWidth, y);
  ctx.lineTo(x, y + halfHeight);
  ctx.lineTo(x, y + halfHeight + depth);
  ctx.lineTo(x + halfWidth, y + depth);
  ctx.closePath();
  ctx.fill();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToString(rgb: { r: number; g: number; b: number }): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#FFFFFF';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.closePath();
}

export function createNeonGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.5, color2);
  gradient.addColorStop(1, color1);
  return gradient;
}

export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  starCount: number,
  seed: number = 42
): void {
  const rng = (s: number) => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
  
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < starCount; i++) {
    const x = rng(seed + i * 1.1) * width;
    const y = rng(seed + i * 2.2) * height;
    const size = rng(seed + i * 3.3) * 1.5 + 0.5;
    const alpha = rng(seed + i * 4.4) * 0.5 + 0.3;
    
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function pulseValue(time: number, frequency: number = 1, min: number = 0.8, max: number = 1): number {
  return min + (max - min) * (0.5 + 0.5 * Math.sin(time * frequency * 0.001 * Math.PI * 2));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function getActionLabel(action: number, environmentType: string): string {
  const labels: Record<string, string[]> = {
    gridworld: ['↑ Up', '→ Right', '↓ Down', '← Left'],
    frozenlake: ['← Left', '↓ Down', '→ Right', '↑ Up'],
    cartpole: ['← Left', '→ Right'],
    mountaincar: ['← Left', '○ None', '→ Right'],
    breakout: ['○ NOOP', '🔥 FIRE', '→ RIGHT', '← LEFT'],
    gym4real_dam: ['Release Water', 'Hold Water'],
  };
  
  return labels[environmentType]?.[action] ?? `Action ${action}`;
}




