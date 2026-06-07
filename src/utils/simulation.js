import { round } from './formatters';

/**
 * Clamp `value` to the inclusive range [min, max].
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Advance a sensor's value by one tick of a random walk that is gently pulled
 * back toward its `baseline`. This is the shared "default" physics most
 * sensors use; domain services compose it with their own special-case logic
 * for sensors that need different behavior (leaks, wear, coupling, etc).
 *
 * @param {number} current  Current simulated value.
 * @param {import('./thresholds').SensorConfig} sensor
 * @returns {number} The next value, rounded and clamped to [min, max].
 */
export function randomWalk(current, sensor) {
  const { baseline, fluctuation, min, max, decimals = 1 } = sensor;
  const drift = (Math.random() - 0.5) * fluctuation;
  const pull = (baseline - current) * 0.05;
  return round(clamp(current + drift + pull, min, max), decimals);
}

/**
 * With a small probability, return a value that has been knocked further from
 * baseline by a larger-than-normal excursion, simulating a transient real-world
 * event (a hard brake, a cold start, a momentary sensor glitch) that pushes a
 * reading into warning/critical territory. Returns `current` unchanged most ticks.
 *
 * @param {number} current  Current simulated value (post random-walk).
 * @param {import('./thresholds').SensorConfig} sensor
 * @param {number} [probability=0.02]  Chance per tick that a spike occurs.
 * @returns {number}
 */
export function applySpike(current, sensor, probability = 0.02) {
  if (Math.random() >= probability) return current;

  const { fluctuation, min, max, decimals = 1 } = sensor;
  const magnitude = fluctuation * (3 + Math.random() * 3);
  const direction = Math.random() < 0.5 ? -1 : 1;
  return round(clamp(current + direction * magnitude, min, max), decimals);
}

/**
 * Convenience composition of the two default behaviors above: the "ordinary"
 * tick for a sensor with no special-case physics.
 *
 * @param {number} current
 * @param {import('./thresholds').SensorConfig} sensor
 * @returns {number}
 */
export function tickDefault(current, sensor) {
  return applySpike(randomWalk(current, sensor), sensor);
}
