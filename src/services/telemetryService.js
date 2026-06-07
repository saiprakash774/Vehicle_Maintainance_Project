import { SENSORS } from '../utils/thresholds';
import { round } from '../utils/formatters';

let intervalId = null;

// Drift state per sensor so readings feel continuous rather than purely random
const state = {};
SENSORS.forEach((sensor) => {
  state[sensor.key] = sensor.baseline;
});

function fluctuate(current, sensor) {
  const { baseline, fluctuation, min, max, decimals = 1 } = sensor;
  // Random walk with a gentle pull back toward baseline
  const drift = (Math.random() - 0.5) * fluctuation;
  const pull = (baseline - current) * 0.05;
  return Math.min(max, Math.max(min, round(current + drift + pull, decimals)));
}

// Occasionally inject a spike to trigger warning/critical alerts
function maybeSpike(sensor) {
  if (Math.random() < 0.02) {
    const { fluctuation, min, max, decimals = 1 } = sensor;
    const magnitude = fluctuation * (3 + Math.random() * 3);
    const direction = Math.random() < 0.5 ? -1 : 1;
    state[sensor.key] = round(
      Math.min(max, Math.max(min, state[sensor.key] + direction * magnitude)),
      decimals
    );
  }
}

export function startSimulation(onReading, intervalMs = 1000) {
  if (intervalId !== null) return;

  intervalId = setInterval(() => {
    SENSORS.forEach((sensor) => {
      state[sensor.key] = fluctuate(state[sensor.key], sensor);
      maybeSpike(sensor);
    });

    onReading({ ...state, timestamp: new Date() });
  }, intervalMs);
}

export function stopSimulation() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
