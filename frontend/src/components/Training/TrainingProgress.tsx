import { Box, Progress, HStack, Text, VStack, StatGroup, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface TrainingProgressProps {
  currentEpisode: number;
  totalEpisodes: number;
  isRunning: boolean;
  startTime?: number;
}

export const TrainingProgress = ({ currentEpisode, totalEpisodes, isRunning, startTime }: TrainingProgressProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [episodesPerSec, setEpisodesPerSec] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      setElapsedTime(elapsed);
      
      if (elapsed > 0) {
        setEpisodesPerSec(currentEpisode / elapsed);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, startTime, currentEpisode]);

  const progressPercent = totalEpisodes > 0 ? (currentEpisode / totalEpisodes) * 100 : 0;
  const remainingEpisodes = totalEpisodes - currentEpisode;
  const eta = episodesPerSec > 0 ? remainingEpisodes / episodesPerSec : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRunning && currentEpisode === 0) {
    return null;
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" color="brand.700">
            Training Progress
          </Text>
          <Text fontSize="sm" color="gray.600">
            Episode {currentEpisode} / {totalEpisodes}
          </Text>
        </HStack>

        <Progress 
          value={progressPercent} 
          size="lg" 
          colorScheme="brand"
          borderRadius="full"
          hasStripe={isRunning}
          isAnimated={isRunning}
        />

        <StatGroup>
          <Stat size="sm">
            <StatLabel fontSize="xs">Elapsed</StatLabel>
            <StatNumber fontSize="md">{formatTime(elapsedTime)}</StatNumber>
          </Stat>

          <Stat size="sm">
            <StatLabel fontSize="xs">ETA</StatLabel>
            <StatNumber fontSize="md">
              {isRunning && eta > 0 ? formatTime(eta) : '--:--'}
            </StatNumber>
          </Stat>

          <Stat size="sm">
            <StatLabel fontSize="xs">Speed</StatLabel>
            <StatNumber fontSize="md">
              {episodesPerSec > 0 ? `${episodesPerSec.toFixed(1)}/s` : '--'}
            </StatNumber>
            <StatHelpText fontSize="xs">episodes/sec</StatHelpText>
          </Stat>
        </StatGroup>
      </VStack>
    </Box>
  );
};
