import { Box, Text, VStack } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

interface PolicyVisualizationProps {
  policy: Record<string, number> | null;
  gridSize?: number;
  environmentType?: 'gridworld' | 'frozenlake';
}

export const PolicyVisualization = ({ policy, gridSize = 5, environmentType = 'gridworld' }: PolicyVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!policy || Object.keys(policy).length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerSize = 300;
    canvas.width = containerSize;
    canvas.height = containerSize;
    const cellSize = containerSize / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Action arrows - different orderings for different environments
    // GridWorld: 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
    // FrozenLake: 0=LEFT, 1=DOWN, 2=RIGHT, 3=UP
    const gridWorldArrows = [
      { dx: 0, dy: -1, symbol: '↑', angle: -Math.PI / 2 }, // 0=UP
      { dx: 1, dy: 0, symbol: '→', angle: 0 },            // 1=RIGHT
      { dx: 0, dy: 1, symbol: '↓', angle: Math.PI / 2 },  // 2=DOWN
      { dx: -1, dy: 0, symbol: '←', angle: Math.PI },     // 3=LEFT
    ];
    const frozenLakeArrows = [
      { dx: -1, dy: 0, symbol: '←', angle: Math.PI },     // 0=LEFT
      { dx: 0, dy: 1, symbol: '↓', angle: Math.PI / 2 },  // 1=DOWN
      { dx: 1, dy: 0, symbol: '→', angle: 0 },            // 2=RIGHT
      { dx: 0, dy: -1, symbol: '↑', angle: -Math.PI / 2 }, // 3=UP
    ];
    const arrows = environmentType === 'frozenlake' ? frozenLakeArrows : gridWorldArrows;

    // Draw policy arrows
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const stateIdx = y * gridSize + x;
        const action = policy[stateIdx.toString()];

        if (action !== undefined && action >= 0 && action < 4) {
          const arrow = arrows[action];
          const centerX = (x + 0.5) * cellSize;
          const centerY = (y + 0.5) * cellSize;

          // Draw arrow using triangle
          const arrowLength = cellSize * 0.4;
          const arrowWidth = cellSize * 0.2;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(arrow.angle);

          // Arrow body (triangle)
          ctx.fillStyle = '#2196f3';
          ctx.beginPath();
          ctx.moveTo(arrowLength, 0); // tip
          ctx.lineTo(-arrowLength / 3, arrowWidth / 2); // bottom left
          ctx.lineTo(-arrowLength / 3, -arrowWidth / 2); // top left
          ctx.closePath();
          ctx.fill();

          // Arrow outline
          ctx.strokeStyle = '#1565c0';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
        }
      }
    }

  }, [policy, gridSize]);

  if (!policy || Object.keys(policy).length === 0) {
    return (
      <Box 
        p={8} 
        textAlign="center" 
        bg="gray.50" 
        borderRadius="md"
        border="2px dashed"
        borderColor="gray.300"
      >
        <Text color="gray.500" fontSize="sm">
          Policy visualization will appear after training starts
        </Text>
        <Text color="gray.400" fontSize="xs" mt={2}>
          (Updates every 50 episodes)
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontWeight="bold" fontSize="sm">Policy (Optimal Actions)</Text>
      <Box>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            maxWidth: '300px',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />
      </Box>
      <Text fontSize="xs" color="gray.500" textAlign="center">
        Arrows show best action for each state
      </Text>
    </VStack>
  );
};
