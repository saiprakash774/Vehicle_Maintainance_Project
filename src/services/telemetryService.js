import { THRESHOLDS } from '../utils/thresholds';
import { round } from '../utils/formatters';

let intervalId = null;

// Drift state so readings feel continuous rather than purely random
const state = {
  engineTemp: THRESHOLDS.engineTemp.baseline,
  tirePressure: THRESHOLDS.tirePressure.baseline,
};

function fluctuate(current, baseline, maxFluctuation, min, max) {
  // Random walk with a gentle pull back toward baseline
  const drift = (Math.random() - 0.5) * maxFluctuation;
  const pull = (baseline - current) * 0.05;
  return Math.min(max, Math.max(min, round(current + drift + pull)));
}

// Occasionally inject a spike to trigger warnings/critical alerts
function maybeSpike(key) {
  if (Math.random() < 0.03) {
    const cfg = THRESHOLDS[key];
    const spikeMagnitude = cfg.fluctuation * (3 + Math.random() * 3);
    const direction = Math.random() < 0.5 ? -1 : 1;
    state[key] = round(
      Math.min(cfg.max, Math.max(cfg.min, state[key] + direction * spikeMagnitude))
    );
  }
}

export function startSimulation(onReading, intervalMs = 1000) {
  if (intervalId !== null) return;

  intervalId = setInterval(() => {
    const cfg = THRESHOLDS.engineTemp;
    state.engineTemp = fluctuate(
      state.engineTemp,
      cfg.baseline,
      cfg.fluctuation,
      cfg.min,
      cfg.max
    );
    maybeSpike('engineTemp');

    const tCfg = THRESHOLDS.tirePressure;
    state.tirePressure = fluctuate(
      state.tirePressure,
      tCfg.baseline,
      tCfg.fluctuation,
      tCfg.min,
      tCfg.max
    );
    maybeSpike('tirePressure');

    onReading({
      engineTemp: state.engineTemp,
      tirePressure: state.tirePressure,
      timestamp: new Date(),
    });
  }, intervalMs);
}

export function stopSimulation() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
