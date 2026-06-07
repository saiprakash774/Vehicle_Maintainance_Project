import { SENSOR_MAP } from '../utils/thresholds';
import { round } from '../utils/formatters';
import { clamp, randomWalk, tickDefault } from '../utils/simulation';

/**
 * @typedef {Object} PowertrainReadings
 * @property {number} engineTemp
 * @property {number} oilTemp
 * @property {number} transmissionFluidTemp
 * @property {number} batteryVoltage
 * @property {number} emissions
 * @property {number} vibration
 * @property {number} coolantLevel
 * @property {number} coolantThermalEfficiency
 */

const STANDARD_KEYS = [
  'engineTemp',
  'oilTemp',
  'transmissionFluidTemp',
  'batteryVoltage',
  'emissions',
  'vibration',
];

/**
 * Coolant level only ever trends downward between services — real cooling
 * systems develop slow seal/hose micro-leaks that don't self-heal. We model
 * this as a small constant loss per tick (scaled by a little randomness for
 * realism) rather than a random walk pulled toward baseline.
 *
 * @param {number} current
 * @returns {number}
 */
function tickCoolantLevel(current) {
  const sensor = SENSOR_MAP.coolantLevel;
  const loss = sensor.leakRate * (0.5 + Math.random());
  const noise = (Math.random() - 0.5) * sensor.fluctuation * 0.5;
  return round(clamp(current - loss + noise, sensor.min, sensor.max), sensor.decimals ?? 1);
}

/**
 * Thermal efficiency is coupled to coolant level: as coolant is lost, the
 * system's ability to regulate engine heat degrades. We apply a small penalty
 * proportional to how far `coolantLevel` has dropped below its baseline on top
 * of the sensor's normal random walk — a simple but realistic cross-parameter
 * relationship within the same domain.
 *
 * @param {number} current               Current efficiency reading.
 * @param {number} nextCoolantLevel       This tick's freshly computed coolant level.
 * @returns {number}
 */
function tickCoolantThermalEfficiency(current, nextCoolantLevel) {
  const sensor = SENSOR_MAP.coolantThermalEfficiency;
  const coolantSensor = SENSOR_MAP.coolantLevel;

  const coolantDeficit = Math.max(0, coolantSensor.baseline - nextCoolantLevel);
  const penalty = coolantDeficit * 0.15; // each % of lost coolant trims ~0.15% efficiency

  const walked = randomWalk(current, sensor);
  return round(clamp(walked - penalty, sensor.min, sensor.max), sensor.decimals ?? 1);
}

/**
 * Pure tick function for the Powertrain domain (engine, drivetrain, electrical
 * & emissions systems). Given the previous full readings object, returns the
 * next values for just the sensors this service owns.
 *
 * @param {Record<string, number>} prev  Previous readings, keyed by sensor key.
 * @returns {PowertrainReadings}
 */
export function tickPowertrain(prev) {
  /** @type {Record<string, number>} */
  const next = {};

  for (const key of STANDARD_KEYS) {
    next[key] = tickDefault(prev[key], SENSOR_MAP[key]);
  }

  next.coolantLevel = tickCoolantLevel(prev.coolantLevel);
  next.coolantThermalEfficiency = tickCoolantThermalEfficiency(
    prev.coolantThermalEfficiency,
    next.coolantLevel
  );

  return /** @type {PowertrainReadings} */ (next);
}
