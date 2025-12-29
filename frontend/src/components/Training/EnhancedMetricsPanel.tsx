import { Box, VStack, Text, SimpleGrid, Badge, HStack, Icon } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiTarget } from 'react-icons/fi';
import type { TrainingMetrics } from '../../types/training';

interface EnhancedMetricsPanelProps {
  metrics: TrainingMetrics;
  latestReward?: number;
  currentEpisode?: number;
}

export const EnhancedMetricsPanel = ({ metrics, latestReward = 0, currentEpisode = 0 }: EnhancedMetricsPanelProps) => {
  // Calculate statistics
  const recentRewards = metrics.episode_rewards.slice(-10);
  const avgLast10 = recentRewards.length > 0 
    ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length 
    : 0;

  const previousAvg = metrics.episode_rewards.slice(-20, -10);
  const avgPrevious10 = previousAvg.length > 0
    ? previousAvg.reduce((a, b) => a + b, 0) / previousAvg.length
    : 0;

  const trend = avgLast10 - avgPrevious10;
  const trendPercent = avgPrevious10 !== 0 ? ((trend / Math.abs(avgPrevious10)) * 100) : 0;

  // Success rate (rewards > 0)
  const successfulEpisodes = recentRewards.filter(r => r > 0).length;
  const successRate = recentRewards.length > 0 ? (successfulEpisodes / recentRewards.length) * 100 : 0;

  // Best and worst episodes
  const allRewards = metrics.episode_rewards;
  const bestReward = allRewards.length > 0 ? Math.max(...allRewards) : 0;
  const worstReward = allRewards.length > 0 ? Math.min(...allRewards) : 0;

  // Average episode length
  const recentLengths = metrics.episode_lengths.slice(-10);
  const avgLength = recentLengths.length > 0
    ? recentLengths.reduce((a, b) => a + b, 0) / recentLengths.length
    : 0;

  const MetricCard = ({ label, value, subtitle, icon, color, trend }: any) => (
    <Box p={4} bg={`${color}.50`} borderRadius="md" border="1px" borderColor={`${color}.200`}>
      <HStack justify="space-between" mb={2}>
        <Icon as={icon} color={`${color}.600`} boxSize={5} />
        {trend !== undefined && (
          <Badge colorScheme={trend >= 0 ? 'green' : 'red'} fontSize="xs">
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </Badge>
        )}
      </HStack>
      <Text fontSize="xs" color={`${color}.700`} fontWeight="bold" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={`${color}.800`}>
        {value}
      </Text>
      {subtitle && (
        <Text fontSize="xs" color={`${color}.600`} mt={1}>
          {subtitle}
        </Text>
      )}
    </Box>
  );

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={2} spacing={3}>
        <MetricCard
          label="Episode"
          value={currentEpisode}
          icon={FiActivity}
          color="brand"
        />

        <MetricCard
          label="Latest Reward"
          value={latestReward.toFixed(2)}
          icon={FiTarget}
          color={latestReward >= 0 ? 'success' : 'danger'}
        />
      </SimpleGrid>

      <MetricCard
        label="Avg Reward (Last 10)"
        value={avgLast10.toFixed(2)}
        subtitle={`Trend: ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trendPercent).toFixed(1)}%`}
        icon={trend >= 0 ? FiTrendingUp : FiTrendingDown}
        color="purple"
        trend={trendPercent}
      />

      <SimpleGrid columns={2} spacing={3}>
        <Box p={3} bg="green.50" borderRadius="md" textAlign="center">
          <Text fontSize="xs" color="green.700" fontWeight="bold">Success Rate</Text>
          <Text fontSize="xl" fontWeight="bold" color="green.800">
            {successRate.toFixed(0)}%
          </Text>
          <Text fontSize="xs" color="green.600">Last 10 episodes</Text>
        </Box>

        <Box p={3} bg="orange.50" borderRadius="md" textAlign="center">
          <Text fontSize="xs" color="orange.700" fontWeight="bold">Avg Steps</Text>
          <Text fontSize="xl" fontWeight="bold" color="orange.800">
            {avgLength.toFixed(0)}
          </Text>
          <Text fontSize="xs" color="orange.600">Per episode</Text>
        </Box>
      </SimpleGrid>

      <Box p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={2}>Performance Range</Text>
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">Best</Text>
            <Badge colorScheme="green" fontSize="sm">{bestReward.toFixed(2)}</Badge>
          </VStack>
          <VStack align="end" spacing={0}>
            <Text fontSize="xs" color="gray.500">Worst</Text>
            <Badge colorScheme="red" fontSize="sm">{worstReward.toFixed(2)}</Badge>
          </VStack>
        </HStack>
      </Box>

      {metrics.cumulative_rewards.length > 0 && (
        <Box p={3} bg="blue.50" borderRadius="md" textAlign="center">
          <Text fontSize="xs" color="blue.700" fontWeight="bold">Total Cumulative Reward</Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.800">
            {metrics.cumulative_rewards[metrics.cumulative_rewards.length - 1].toFixed(1)}
          </Text>
        </Box>
      )}
    </VStack>
  );
};
