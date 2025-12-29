import { ChakraProvider, Box, VStack, Heading, Button, Select, Text, Grid, GridItem, Card, CardHeader, CardBody, Slider, SliderTrack, SliderFilledTrack, SliderThumb, FormControl, FormLabel, NumberInput, NumberInputField, Divider } from '@chakra-ui/react';
import { EnhancedEnvironmentCanvas } from './components/Environment/EnhancedEnvironmentCanvas';
import { TrainingCharts } from './components/Training/TrainingCharts';
import { TrainingProgress } from './components/Training/TrainingProgress';
import { ValueFunctionHeatmap } from './components/Visualization/ValueFunctionHeatmap';
import { PolicyVisualization } from './components/Visualization/PolicyVisualization';
import { EnhancedMetricsPanel } from './components/Training/EnhancedMetricsPanel';
import { useTrainingStore } from './store/trainingStore';
import { useState, useEffect } from 'react';
import theme from './theme/theme';

// Define which environments support model-based algorithms (Policy Iteration, Value Iteration)
const MODEL_BASED_ENVIRONMENTS = ['gridworld', 'frozenlake'];
const MODEL_BASED_ALGORITHMS = ['policy_iteration', 'value_iteration'];

// Check if an algorithm is compatible with an environment
const isCompatible = (algorithm: string, environment: string): boolean => {
  if (MODEL_BASED_ALGORITHMS.includes(algorithm)) {
    return MODEL_BASED_ENVIRONMENTS.includes(environment);
  }
  return true; // Model-free algorithms work with all environments
};

function App() {
  const { isRunning, startSession, stopSession, updates, metrics, valueFunction, policy } = useTrainingStore();
  const [algo, setAlgo] = useState('q_learning');
  const [env, setEnv] = useState('gridworld');
  const [learningRate, setLearningRate] = useState(0.1);
  const [epsilon, setEpsilon] = useState(0.1);
  const [discountFactor, setDiscountFactor] = useState(0.99);
  const [nStep, setNStep] = useState(3);
  const [nEpisodes, setNEpisodes] = useState(500);
  const [stepDelay, setStepDelay] = useState(200); // Step speed in ms (1-1000)
  const [startTime, setStartTime] = useState<number | undefined>(undefined);

  // Auto-switch to compatible algorithm when environment changes
  useEffect(() => {
    if (!isCompatible(algo, env)) {
      setAlgo('q_learning'); // Default to Q-Learning which works with all environments
    }
  }, [env, algo]);

  const handleStart = () => {
    setStartTime(Date.now());
    startSession({
      environment: env,
      algorithm: algo,
      n_episodes: nEpisodes,
      max_steps: 100,
      epsilon,
      learning_rate: learningRate,
      discount_factor: discountFactor,
      n_step: algo === 'n_step_td' ? nStep : 1,
      step_delay_ms: stepDelay,
    });
  };

  const handleStop = () => {
    stopSession();
    setStartTime(undefined);
  };

  const latestUpdate = updates.length > 0 ? updates[updates.length - 1] : null;

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="xl" color="brand.700" mb={2}>
              🧠 RL Interactive Learning Tool
            </Heading>
            <Text color="gray.600">
              Train and visualize reinforcement learning algorithms in real-time
            </Text>
          </Box>

          {/* Training Progress Bar */}
          {isRunning && (
            <Card>
              <CardBody>
                <TrainingProgress
                  currentEpisode={latestUpdate?.episode || 0}
                  totalEpisodes={nEpisodes}
                  isRunning={isRunning}
                  startTime={startTime}
                />
              </CardBody>
            </Card>
          )}

          {/* Main 4-Column Grid */}
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} gap={6}>
            {/* Column 1: Configuration */}
            <GridItem>
              <Card h="full">
                <CardHeader>
                  <Heading size="md">⚙️ Configuration</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Environment</FormLabel>
                      <Select value={env} onChange={(e) => setEnv(e.target.value)} isDisabled={isRunning} size="sm">
                        <option value="gridworld">GridWorld</option>
                        <option value="frozenlake">FrozenLake</option>
                        <option value="cartpole">CartPole</option>
                        <option value="mountaincar">MountainCar</option>
                        <option value="breakout">Breakout</option>
                        <option value="gym4real_dam">Gym4ReaL Dam</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Algorithm</FormLabel>
                      <Select value={algo} onChange={(e) => setAlgo(e.target.value)} isDisabled={isRunning} size="sm">
                        <option value="q_learning">Q-Learning</option>
                        <option value="sarsa">SARSA</option>
                        <option value="policy_iteration" disabled={!MODEL_BASED_ENVIRONMENTS.includes(env)}>
                          Policy Iteration {!MODEL_BASED_ENVIRONMENTS.includes(env) ? '(requires GridWorld/FrozenLake)' : ''}
                        </option>
                        <option value="value_iteration" disabled={!MODEL_BASED_ENVIRONMENTS.includes(env)}>
                          Value Iteration {!MODEL_BASED_ENVIRONMENTS.includes(env) ? '(requires GridWorld/FrozenLake)' : ''}
                        </option>
                        <option value="monte_carlo">Monte Carlo</option>
                        <option value="td_learning">TD Learning</option>
                        <option value="n_step_td">n-Step TD</option>
                      </Select>
                      {!MODEL_BASED_ENVIRONMENTS.includes(env) && (
                        <Text fontSize="xs" color="orange.500" mt={1}>
                          ⚠️ Model-based algorithms require GridWorld or FrozenLake
                        </Text>
                      )}
                    </FormControl>

                    <Divider />

                    <FormControl>
                      <FormLabel fontSize="sm">Learning Rate (α): {learningRate.toFixed(2)}</FormLabel>
                      <Slider value={learningRate} onChange={setLearningRate} min={0.01} max={1} step={0.01} isDisabled={isRunning}>
                        <SliderTrack>
                          <SliderFilledTrack bg="brand.500" />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Epsilon (ε): {epsilon.toFixed(2)}</FormLabel>
                      <Slider value={epsilon} onChange={setEpsilon} min={0} max={1} step={0.01} isDisabled={isRunning}>
                        <SliderTrack>
                          <SliderFilledTrack bg="brand.500" />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Discount Factor (γ): {discountFactor.toFixed(2)}</FormLabel>
                      <Slider value={discountFactor} onChange={setDiscountFactor} min={0.5} max={1} step={0.01} isDisabled={isRunning}>
                        <SliderTrack>
                          <SliderFilledTrack bg="brand.500" />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>

                    {algo === 'n_step_td' && (
                      <FormControl>
                        <FormLabel fontSize="sm">n-Step: {nStep}</FormLabel>
                        <Slider value={nStep} onChange={setNStep} min={1} max={10} step={1} isDisabled={isRunning}>
                          <SliderTrack>
                            <SliderFilledTrack bg="brand.500" />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                        <Text fontSize="xs" color="gray.500">Number of steps for n-step TD learning</Text>
                      </FormControl>
                    )}

                    <FormControl>
                      <FormLabel fontSize="sm">Step Speed: {stepDelay}ms</FormLabel>
                      <Slider value={stepDelay} onChange={setStepDelay} min={1} max={1000} step={1} isDisabled={isRunning}>
                        <SliderTrack>
                          <SliderFilledTrack bg="brand.500" />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Text fontSize="xs" color="gray.500">Lower = faster visualization</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Episodes</FormLabel>
                      <NumberInput value={nEpisodes} onChange={(_, val) => setNEpisodes(val)} min={10} max={5000} isDisabled={isRunning} size="sm">
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>

                    <Button
                      colorScheme={isRunning ? 'red' : 'brand'}
                      onClick={isRunning ? handleStop : handleStart}
                      size="lg"
                      width="100%"
                    >
                      {isRunning ? '⏹️ Stop Training' : '▶️ Start Training'}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Column 2: Environment Visualization */}
            <GridItem>
              <Card h="full">
                <CardHeader>
                  <Heading size="md">🎮 Environment</Heading>
                </CardHeader>
                <CardBody display="flex" alignItems="center" justifyContent="center">
                  <EnhancedEnvironmentCanvas updates={updates} environmentType={env as 'gridworld' | 'frozenlake' | 'cartpole' | 'mountaincar' | 'breakout' | 'gym4real_dam'} />
                </CardBody>
              </Card>
            </GridItem>

            {/* Column 3: Metrics */}
            <GridItem>
              <Card h="full">
                <CardHeader>
                  <Heading size="md">📊 Metrics</Heading>
                </CardHeader>
                <CardBody>
                  <EnhancedMetricsPanel
                    metrics={metrics}
                    latestReward={latestUpdate?.reward || 0}
                    currentEpisode={latestUpdate?.episode || 0}
                  />
                </CardBody>
              </Card>
            </GridItem>

            {/* Column 4: Value Function & Policy */}
            <GridItem>
              <Card h="full">
                <CardHeader>
                  <Heading size="md">🎯 Learning</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <ValueFunctionHeatmap valueFunction={valueFunction} />
                    <Divider />
                    <PolicyVisualization policy={policy} environmentType={env as 'gridworld' | 'frozenlake'} />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Training Charts - Full Width */}
          <TrainingCharts metrics={metrics} />
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
