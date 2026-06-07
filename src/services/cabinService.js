import { SENSOR_MAP } from '../utils/thresholds';
import { round } from '../utils/formatters';
import { clamp } from '../utils/simulation';

/**
 * @typedef {Object} CabinReadings
 * @property {number} cabinAirFilterPressure
 */

/**
 * A cabin air filter accumulates debris over its service life, so the
 * differential pressure across it only ever trends upward between
 * replacements, mirroring the coolant micro-leak in the powertrain service,
 * this is steady one-directional degradation plus a little sensor noise,
 * never a random walk back toward baseline.
 *
 * @param {number} current
 * @returns {number}
 */
function tickCabinAirFilterPressure(current) {
  const sensor = SENSOR_MAP.cabinAirFilterPressure;
  const clogging = sensor.clogRate * (0.5 + Math.random());
  const noise = (Math.random() - 0.5) * sensor.fluctuation * 0.5;
  return round(clamp(current + clogging + noise, sensor.min, sensor.max), sensor.decimals ?? 1);
}

/**
 * Pure tick function for the Cabin domain (HVAC & interior comfort systems).
 * Given the previous full readings object, returns the next values for just
 * the sensors this service owns.
 *
 * @param {Record<string, number>} prev
 * @returns {CabinReadings}
 */
export function tickCabin(prev) {
  return {
    cabinAirFilterPressure: tickCabinAirFilterPressure(prev.cabinAirFilterPressure),
  };
}
