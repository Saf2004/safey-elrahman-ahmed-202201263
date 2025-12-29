import { Box, Text, VStack, Badge, HStack } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

interface ValueFunctionHeatmapProps {
  valueFunction: Record<string, number> | null;
  gridSize?: number;
}

export const ValueFunctionHeatmap = ({ valueFunction, gridSize = 5 }: ValueFunctionHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!valueFunction || Object.keys(valueFunction).length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerSize = 300;
    canvas.width = containerSize;
    canvas.height = containerSize;
    const cellSize = containerSize / gridSize;

    // Get min and max values for normalization
    const values = Object.values(valueFunction);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Color interpolation function
    const getColor = (value: number): string => {
      const normalized = (value - minValue) / range;
      
      // Blue (low) -> White (mid) -> Red (high)
      if (normalized < 0.5) {
        const t = normalized * 2;
        const r = Math.floor(66 + (255 - 66) * t);
        const g = Math.floor(165 + (255 - 165) * t);
        const b = Math.floor(245 + (255 - 245) * t);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = (normalized - 0.5) * 2;
        const r = Math.floor(255);
        const g = Math.floor(255 - 100 * t);
        const b = Math.floor(255 - 200 * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    // Draw cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const stateIdx = y * gridSize + x;
        const value = valueFunction[stateIdx.toString()] ?? 0;

        // Fill cell with color
        ctx.fillStyle = getColor(value);
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Draw border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Draw value text
        ctx.fillStyle = '#000000';
        ctx.font = `${cellSize * 0.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          value.toFixed(2),
          (x + 0.5) * cellSize,
          (y + 0.5) * cellSize
        );
      }
    }

    // Draw color legend
    const legendWidth = 20;
    const legendHeight = containerSize * 0.8;
    const legendX = containerSize + 10;
    const legendY = containerSize * 0.1;

    for (let i = 0; i < legendHeight; i++) {
      const value = maxValue - (i / legendHeight) * range;
      ctx.fillStyle = getColor(value);
      ctx.fillRect(legendX, legendY + i, legendWidth, 1);
    }

    // Legend labels
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(maxValue.toFixed(2), legendX + legendWidth + 5, legendY);
    ctx.fillText(minValue.toFixed(2), legendX + legendWidth + 5, legendY + legendHeight);

  }, [valueFunction, gridSize]);

  if (!valueFunction || Object.keys(valueFunction).length === 0) {
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
          Value function will appear after training starts
        </Text>
        <Text color="gray.400" fontSize="xs" mt={2}>
          (Updates every 50 episodes)
        </Text>
      </Box>
    );
  }

  const values = Object.values(valueFunction);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <VStack spacing={3} align="stretch">
      <HStack justify="space-between">
        <Text fontWeight="bold" fontSize="sm">Value Function</Text>
        <HStack spacing={2}>
          <Badge colorScheme="blue">Min: {minValue.toFixed(2)}</Badge>
          <Badge colorScheme="purple">Avg: {avgValue.toFixed(2)}</Badge>
          <Badge colorScheme="red">Max: {maxValue.toFixed(2)}</Badge>
        </HStack>
      </HStack>
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
        Blue = Low Value, Red = High Value
      </Text>
    </VStack>
  );
};
