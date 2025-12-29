export interface SpaceInfo {
  type: string;
  shape?: number[];
  low?: number[];
  high?: number[];
  n?: number;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  state_space: SpaceInfo;
  action_space: SpaceInfo;
  max_episode_steps: number;
}

export interface EnvironmentState {
  observation: number | number[];
  reward: number;
  done: boolean;
  info: Record<string, unknown>;
}

export type EnvironmentType = 
  | 'gridworld' 
  | 'frozenlake' 
  | 'cartpole' 
  | 'mountaincar' 
  | 'breakout' 
  | 'gym4real_dam';

export interface GridPosition {
  x: number;
  y: number;
}

export interface CartPoleState {
  cartPos: number;
  cartVelocity: number;
  poleAngle: number;
  poleAngularVelocity: number;
}

export interface MountainCarState {
  position: number;
  velocity: number;
}

export interface BreakoutState {
  paddleX: number;
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  lives: number;
  bricks: boolean[][];
}

export interface DamState {
  waterLevel: number;
  inflow: number;
  outflow: number;
  targetLevel: number;
}

export interface EnvironmentVisualizationProps {
  state: number | number[];
  previousState?: number | number[];
  action?: number;
  reward?: number;
  done?: boolean;
  episode?: number;
  step?: number;
  isAnimating?: boolean;
}

export interface RendererProps {
  width: number;
  height: number;
  state: number | number[];
  animatedPosition?: GridPosition;
  theme: VisualizationTheme;
}

export interface VisualizationTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  danger: string;
  warning: string;
  glow: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface AnimationState {
  position: GridPosition;
  targetPosition: GridPosition;
  velocity: GridPosition;
  trail: GridPosition[];
}
