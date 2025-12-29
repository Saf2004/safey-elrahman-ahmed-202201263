import { Box, Flex, Text, Badge, Icon, HStack, VStack, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FiPlay, FiPause, FiZap, FiTarget, FiTrendingUp, FiActivity } from 'react-icons/fi';
import type { TrainingUpdate } from '../../types/training';
import type { EnvironmentType, GridPosition, CartPoleState, MountainCarState, BreakoutState, DamState } from '../../types/environment';
import { THEMES, ENVIRONMENT_THEMES, getActionLabel } from './utils/visualizationUtils';
import { drawGridWorld, drawFrozenLake, drawCartPole, drawMountainCar, drawBreakout, drawDam } from './renderers';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

interface EnhancedEnvironmentCanvasProps {
  updates: TrainingUpdate[];
  environmentType: EnvironmentType;
  isTraining?: boolean;
}

const GRID_SIZE = 5;
const CANVAS_SIZE = 320;

export const EnhancedEnvironmentCanvas = ({ 
  updates, 
  environmentType,
  isTraining = false 
}: EnhancedEnvironmentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  const [agentPos, setAgentPos] = useState<GridPosition>({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<GridPosition>({ x: 0, y: 0 });
  const [cartPoleState, setCartPoleState] = useState<CartPoleState>({ 
    cartPos: 0, cartVelocity: 0, poleAngle: 0, poleAngularVelocity: 0 
  });
  const [mountainCarState, setMountainCarState] = useState<MountainCarState>({ 
    position: -0.5, velocity: 0 
  });
  const [breakoutState, setBreakoutState] = useState<BreakoutState>({ 
    paddleX: 80, ballX: 80, ballY: 100, ballVelX: 2, ballVelY: -2, lives: 5, 
    bricks: Array(4).fill(null).map(() => Array(10).fill(true))
  });
  const [damState, setDamState] = useState<DamState>({ 
    waterLevel: 50, inflow: 5, outflow: 3, targetLevel: 50 
  });

  const [showRewardFlash, setShowRewardFlash] = useState(false);
  const [lastReward, setLastReward] = useState(0);

  const latestUpdate = updates.length > 0 ? updates[updates.length - 1] : null;
  const theme = useMemo(() => THEMES[ENVIRONMENT_THEMES[environmentType] || 'midnight'], [environmentType]);

  const parseState = useCallback((state: unknown, envType: EnvironmentType) => {
    if (envType === 'gridworld' || envType === 'frozenlake') {
      if (typeof state === 'number') {
        return { x: state % GRID_SIZE, y: Math.floor(state / GRID_SIZE) };
      } else if (Array.isArray(state) && state.length >= 2) {
        return { x: state[0], y: state[1] };
      }
    } else if (envType === 'cartpole') {
      if (Array.isArray(state) && state.length >= 4) {
        return { 
          cartPos: state[0], 
          cartVelocity: state[1], 
          poleAngle: state[2], 
          poleAngularVelocity: state[3] 
        };
      }
    } else if (envType === 'mountaincar') {
      if (Array.isArray(state) && state.length >= 2) {
        return { 
          position: state[0], 
          velocity: state[1] 
        };
      } else if (typeof state === 'number') {
        const n_bins = 20;
        const posIdx = Math.floor(state / (n_bins + 1));
        const velIdx = state % (n_bins + 1);
        return { 
          position: -1.2 + (posIdx / n_bins) * 1.8,
          velocity: -0.07 + (velIdx / n_bins) * 0.14
        };
      }
    } else if (envType === 'breakout') {
      // Check if state is already an object with Breakout data
      if (typeof state === 'object' && state !== null && 'paddle_x' in state) {
        const breakoutState = state as any;
        const remainingBricks = breakoutState.remaining_bricks || breakoutState.remainingBricks || 40;
        const bricksDestroyed = breakoutState.bricks_destroyed || breakoutState.bricksDestroyed || 0;
        
        // Create brick grid (4 rows x 10 cols = 40 bricks total)
        // Hide bricks based on how many have been destroyed
        // In Breakout, the ball hits bottom rows first, so break from bottom to top
        // Start from bottom-right and work backwards (bottom row = row 3, top row = row 0)
        const bricks: boolean[][] = Array(4).fill(null).map(() => Array(10).fill(true));
        let destroyed = 0;
        // Break from bottom row (row 3) to top row (row 0)
        for (let row = 3; row >= 0 && destroyed < bricksDestroyed; row--) {
          // Within each row, break from right to left (more realistic)
          for (let col = 9; col >= 0 && destroyed < bricksDestroyed; col--) {
            bricks[row][col] = false; // false means destroyed
            destroyed++;
          }
        }
        
        return {
          paddleX: breakoutState.paddle_x || breakoutState.paddleX || 80,
          ballX: breakoutState.ball_x || breakoutState.ballX || 80,
          ballY: breakoutState.ball_y || breakoutState.ballY || 100,
          ballVelX: breakoutState.ball_vel_x || breakoutState.ballVelX || 0,
          ballVelY: breakoutState.ball_vel_y || breakoutState.ballVelY || 0,
          lives: breakoutState.lives || 5,
          bricks: bricks
        };
      } else if (typeof state === 'number') {
        // Fallback: parse discrete state number
        const n_bins = 10;
        const ballY = state % n_bins;
        const ballX = Math.floor(state / n_bins) % n_bins;
        const paddleX = Math.floor(state / (n_bins * n_bins));
        return {
          paddleX: paddleX * 16 + 20,
          ballX: ballX * 16 + 20,
          ballY: ballY * 20 + 30,
          ballVelX: 2,
          ballVelY: -2,
          lives: 5,
          bricks: Array(4).fill(null).map(() => Array(10).fill(true))
        };
      }
    } else if (envType === 'gym4real_dam') {
      if (typeof state === 'number') {
        const n_bins = 20;
        const inflowBin = state % n_bins;
        const levelBin = Math.floor(state / n_bins);
        return {
          waterLevel: (levelBin / n_bins) * 100,
          inflow: (inflowBin / n_bins) * 20,
          outflow: 3,
          targetLevel: 50
        };
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!latestUpdate?.state) return;

    const parsedState = parseState(latestUpdate.state, environmentType);
    if (!parsedState) return;

    if (environmentType === 'gridworld' || environmentType === 'frozenlake') {
      setTargetPos(parsedState as GridPosition);
    } else if (environmentType === 'cartpole') {
      setCartPoleState(parsedState as CartPoleState);
    } else if (environmentType === 'mountaincar') {
      setMountainCarState(parsedState as MountainCarState);
    } else if (environmentType === 'breakout') {
      setBreakoutState(parsedState as BreakoutState);
    } else if (environmentType === 'gym4real_dam') {
      setDamState(parsedState as DamState);
    }

    if (latestUpdate.reward !== undefined && latestUpdate.reward !== 0) {
      setLastReward(latestUpdate.reward);
      setShowRewardFlash(true);
      setTimeout(() => setShowRewardFlash(false), 500);
    }
  }, [latestUpdate, environmentType, parseState]);

  useEffect(() => {
    if (environmentType !== 'gridworld' && environmentType !== 'frozenlake') return;

    let isAnimating = true;
    
    const animate = () => {
      if (!isAnimating) return;
      
      setAgentPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return { x: targetPos.x, y: targetPos.y };
        }
        
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      isAnimating = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetPos, environmentType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      
      timeRef.current += 16;
      const time = timeRef.current;

      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (environmentType) {
        case 'gridworld':
          drawGridWorld(ctx, CANVAS_SIZE, CANVAS_SIZE, agentPos, theme, time);
          break;
        case 'frozenlake':
          drawFrozenLake(ctx, CANVAS_SIZE, CANVAS_SIZE, agentPos, theme, time);
          break;
        case 'cartpole':
          drawCartPole(ctx, CANVAS_SIZE, CANVAS_SIZE, cartPoleState, theme, time);
          break;
        case 'mountaincar':
          drawMountainCar(ctx, CANVAS_SIZE, CANVAS_SIZE, mountainCarState, theme, time);
          break;
        case 'breakout':
          drawBreakout(ctx, CANVAS_SIZE, CANVAS_SIZE, breakoutState, theme, time);
          break;
        case 'gym4real_dam':
          drawDam(ctx, CANVAS_SIZE, CANVAS_SIZE, damState, theme, time);
          break;
      }

      requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
    };
  }, [environmentType, agentPos, cartPoleState, mountainCarState, breakoutState, damState, theme]);

  const getEnvironmentLabel = () => {
    const labels: Record<EnvironmentType, string> = {
      gridworld: 'GridWorld',
      frozenlake: 'FrozenLake',
      cartpole: 'CartPole',
      mountaincar: 'MountainCar',
      breakout: 'Breakout',
      gym4real_dam: 'Dam Control',
    };
    return labels[environmentType];
  };

  const getEnvironmentSize = () => {
    if (environmentType === 'gridworld' || environmentType === 'frozenlake') {
      return '5×5';
    }
    return 'Continuous';
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      position="relative"
      bg="linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
      p={5}
      maxW="400px"
      w="100%"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)"
        pointerEvents="none"
      />

      <VStack spacing={4} position="relative" zIndex={1}>
        <Flex justify="space-between" align="center" w="100%">
          <HStack spacing={3}>
            <Box
              bg={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`}
              p={2}
              borderRadius="lg"
              boxShadow={`0 0 20px ${theme.glow}`}
            >
              <Icon as={FiActivity} color="white" boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                color="white"
                letterSpacing="tight"
              >
                {getEnvironmentLabel()}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {getEnvironmentSize()} Environment
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            <AnimatePresence>
              {isTraining && (
                <MotionBox
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    px={2}
                    py={1}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Box
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg="green.400"
                      animation="pulse 1s infinite"
                    />
                    Live
                  </Badge>
                </MotionBox>
              )}
            </AnimatePresence>
          </HStack>
        </Flex>

        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '12px',
            }}
          />

          <AnimatePresence>
            {showRewardFlash && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.3 }}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg={lastReward > 0 ? 'green.500' : 'red.500'}
                color="white"
                px={4}
                py={2}
                borderRadius="full"
                fontWeight="bold"
                fontSize="lg"
                boxShadow={`0 0 30px ${lastReward > 0 ? 'rgba(72, 187, 120, 0.8)' : 'rgba(245, 101, 101, 0.8)'}`}
              >
                {lastReward > 0 ? '+' : ''}{lastReward.toFixed(2)}
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        <MotionFlex
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          w="100%"
          justify="space-between"
          align="center"
          bg="rgba(0, 0, 0, 0.3)"
          borderRadius="xl"
          p={3}
          backdropFilter="blur(10px)"
        >
          <Tooltip label="Current Episode" hasArrow>
            <HStack spacing={2}>
              <Icon as={FiPlay} color="blue.400" boxSize={4} />
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Episode</Text>
                <Text fontSize="sm" fontWeight="bold" color="white">
                  {latestUpdate?.episode ?? 0}
                </Text>
              </VStack>
            </HStack>
          </Tooltip>

          <Box h={8} w="1px" bg="gray.700" />

          <Tooltip label="Current Step" hasArrow>
            <HStack spacing={2}>
              <Icon as={FiZap} color="yellow.400" boxSize={4} />
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Step</Text>
                <Text fontSize="sm" fontWeight="bold" color="white">
                  {latestUpdate?.step ?? 0}
                </Text>
              </VStack>
            </HStack>
          </Tooltip>

          <Box h={8} w="1px" bg="gray.700" />

          <Tooltip label="Cumulative Reward" hasArrow>
            <HStack spacing={2}>
              <Icon as={FiTrendingUp} color="green.400" boxSize={4} />
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Reward</Text>
                <Text fontSize="sm" fontWeight="bold" color="white">
                  {(latestUpdate?.cumulative_reward ?? 0).toFixed(1)}
                </Text>
              </VStack>
            </HStack>
          </Tooltip>
        </MotionFlex>

        {latestUpdate?.action !== undefined && (
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            w="100%"
          >
            <HStack 
              spacing={2} 
              bg="rgba(99, 102, 241, 0.15)" 
              px={3} 
              py={2} 
              borderRadius="lg"
              border="1px solid"
              borderColor="rgba(99, 102, 241, 0.3)"
            >
              <Icon as={FiTarget} color="indigo.400" boxSize={4} />
              <Text fontSize="xs" color="gray.400">Last Action:</Text>
              <Badge colorScheme="purple" variant="subtle">
                {getActionLabel(latestUpdate.action, environmentType)}
              </Badge>
            </HStack>
          </MotionBox>
        )}

        <Text fontSize="xs" color="gray.600" textAlign="center">
          Total Updates: {updates.length}
        </Text>
      </VStack>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </MotionBox>
  );
};
