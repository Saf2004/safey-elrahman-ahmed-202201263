import { useRef, useEffect, useState } from 'react';
import { Box, Text, Flex, Badge, Icon, HStack, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiGrid, FiActivity } from 'react-icons/fi';

const MotionBox = motion.create(Box);

interface EnvironmentCanvasProps {
  updates: { state?: number | unknown }[];
}

const GRID_SIZE = 5;
const HOLES: [number, number][] = [[1, 1], [1, 3], [2, 3], [3, 0]];
const GOAL = { row: 4, col: 4 };

export const EnvironmentCanvas = ({ updates }: EnvironmentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agentPos, setAgentPos] = useState({ row: 0, col: 0 });
  const [targetPos, setTargetPos] = useState({ row: 0, col: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  useEffect(() => {
    if (updates.length > 0) {
      const lastUpdate = updates[updates.length - 1];
      const stateIndex = lastUpdate.state;
      
      if (typeof stateIndex === 'number') {
        const row = Math.floor(stateIndex / GRID_SIZE);
        const col = stateIndex % GRID_SIZE;
        setTargetPos({ row, col });
      }
    }
  }, [updates]);

  useEffect(() => {
    let isAnimating = true;
    
    const animate = () => {
      if (!isAnimating) return;
      
      setAgentPos(prev => {
        const dx = targetPos.col - prev.col;
        const dy = targetPos.row - prev.row;
        
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return { row: targetPos.row, col: targetPos.col };
        }
        
        return {
          col: prev.col + dx * 0.15,
          row: prev.row + dy * 0.15,
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
  }, [targetPos]);

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

      const size = 280;
      canvas.width = size;
      canvas.height = size;
      
      const cellSize = size / GRID_SIZE;

      const bgGradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size
      );
      bgGradient.addColorStop(0, '#1E293B');
      bgGradient.addColorStop(1, '#0F172A');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, size, size);

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          const isEven = (r + c) % 2 === 0;
          
          ctx.fillStyle = isEven ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
          ctx.beginPath();
          ctx.roundRect(x + 3, y + 3, cellSize - 6, cellSize - 6, 6);
          ctx.fill();
        }
      }

      HOLES.forEach(([r, c]) => {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;
        const pulse = 0.8 + 0.2 * Math.sin(time * 0.003);
        
        const holeGradient = ctx.createRadialGradient(x, y, 0, x, y, cellSize * 0.4);
        holeGradient.addColorStop(0, '#EF4444');
        holeGradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.5)');
        holeGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = holeGradient;
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.35 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = `${cellSize * 0.35}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠️', x, y);
      });

      const goalX = GOAL.col * cellSize + cellSize / 2;
      const goalY = GOAL.row * cellSize + cellSize / 2;
      const goalPulse = 0.9 + 0.1 * Math.sin(time * 0.005);
      
      const goalGradient = ctx.createRadialGradient(goalX, goalY, 0, goalX, goalY, cellSize * 0.45);
      goalGradient.addColorStop(0, '#10B981');
      goalGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.5)');
      goalGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = goalGradient;
      ctx.beginPath();
      ctx.arc(goalX, goalY, cellSize * 0.4 * goalPulse, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = `${cellSize * 0.4}px Arial`;
      ctx.fillText('🎯', goalX, goalY);

      const agentX = (agentPos.col + 0.5) * cellSize;
      const agentY = (agentPos.row + 0.5) * cellSize;
      const bounce = Math.sin(time * 0.005) * 3;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(agentX, agentY + cellSize * 0.3, cellSize * 0.25, cellSize * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      
      const agentGradient = ctx.createRadialGradient(
        agentX - 5, agentY + bounce - 5, 0,
        agentX, agentY + bounce, cellSize * 0.3
      );
      agentGradient.addColorStop(0, '#818CF8');
      agentGradient.addColorStop(0.7, '#6366F1');
      agentGradient.addColorStop(1, '#4F46E5');
      
      ctx.fillStyle = agentGradient;
      ctx.beginPath();
      ctx.arc(agentX, agentY + bounce, cellSize * 0.28, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.font = `${cellSize * 0.35}px Arial`;
      ctx.fillText('🤖', agentX, agentY + bounce);

      const borderGradient = ctx.createLinearGradient(0, 0, size, size);
      borderGradient.addColorStop(0, '#6366F1');
      borderGradient.addColorStop(0.5, '#8B5CF6');
      borderGradient.addColorStop(1, '#6366F1');
      
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(2, 2, size - 4, size - 4, 8);
      ctx.stroke();

      requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
    };
  }, [agentPos]);

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      bg="linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
      p={4}
      maxW="350px"
    >
      <VStack spacing={4}>
        <Flex justify="space-between" align="center" w="100%">
          <HStack spacing={2}>
            <Box
              bg="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
              p={2}
              borderRadius="lg"
              boxShadow="0 0 15px rgba(99, 102, 241, 0.4)"
            >
              <Icon as={FiGrid} color="white" boxSize={4} />
            </Box>
            <Text fontSize="md" fontWeight="bold" color="white">
              GridWorld
            </Text>
          </HStack>
          <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="full">
            5×5
          </Badge>
        </Flex>

        <Box
          borderRadius="xl"
          overflow="hidden"
          boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.3)"
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>

        <Flex 
          w="100%" 
          justify="space-between" 
          align="center"
          bg="rgba(0, 0, 0, 0.3)"
          borderRadius="lg"
          p={3}
        >
          <HStack spacing={2}>
            <Icon as={FiActivity} color="blue.400" boxSize={4} />
            <Text fontSize="sm" color="gray.400">Updates</Text>
          </HStack>
          <Text fontSize="sm" fontWeight="bold" color="white">
            {updates.length}
          </Text>
        </Flex>
      </VStack>
    </MotionBox>
  );
};
