import { Card, CardHeader, CardBody, Heading, SimpleGrid } from '@chakra-ui/react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import type { TrainingMetrics } from '../../types/training';

interface TrainingChartsProps {
  metrics: TrainingMetrics;
}

export const TrainingCharts = ({ metrics }: TrainingChartsProps) => {
  // Memoize data preparation to prevent recalculation on every render
  const chartData = useMemo(() => {
    const rewardData = metrics.episode_rewards.map((reward, index) => ({
      episode: index + 1,
      reward: reward,
      movingAvg: index >= 9 
        ? metrics.episode_rewards.slice(Math.max(0, index - 9), index + 1).reduce((a, b) => a + b, 0) / 10
        : reward,
    }));

    const cumulativeData = metrics.cumulative_rewards.map((cum, index) => ({
      episode: index + 1,
      cumulative: cum,
    }));

    const lengthData = metrics.episode_lengths.map((length, index) => ({
      episode: index + 1,
      steps: length,
    }));

    return {
      recentRewardData: rewardData.slice(-100),
      recentCumulativeData: cumulativeData.slice(-100),
      recentLengthData: lengthData.slice(-100),
    };
  }, [metrics.episode_rewards.length, metrics.cumulative_rewards.length, metrics.episode_lengths.length]);

  if (metrics.episode_rewards.length === 0) {
    return null;
  }

  const { recentRewardData, recentCumulativeData, recentLengthData } = chartData;

  return (
    <Card>
      <CardHeader>
        <Heading size="md">📊 Training Progress</Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Episode Rewards Chart */}
          <Card variant="outline">
            <CardHeader pb={2}>
              <Heading size="sm">Episode Rewards</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={recentRewardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="episode" 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reward" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    dot={false}
                    name="Reward"
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Avg (10)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Cumulative Reward Chart */}
          <Card variant="outline">
            <CardHeader pb={2}>
              <Heading size="sm">Cumulative Reward</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={recentCumulativeData}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="episode" 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#2196f3" 
                    fillOpacity={1} 
                    fill="url(#colorCumulative)"
                    name="Cumulative"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Episode Length Chart */}
          <Card variant="outline">
            <CardHeader pb={2}>
              <Heading size="sm">Episode Steps</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={recentLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="episode" 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#718096"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="steps" 
                    fill="#ff9800"
                    name="Steps"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};
