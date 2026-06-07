import { SENSOR_MAP } from '../utils/thresholds';
import { round } from '../utils/formatters';

/**
 * @typedef {Object} EfficiencyReport
 * @property {number} baselineMpg   The vehicle's nominal fuel economy when everything is healthy.
 * @property {number} mpg           Current estimated MPG after applying any active drops.
 * @property {number} dropPercent   Total percentage knocked off the baseline (0 when healthy).
 * @property {boolean} isDegraded   Whether any efficiency-degrading condition is currently active.
 * @property {string|null} explanation  Human-readable cause string for the frontend, or null when healthy.
 */

export const BASELINE_MPG = 28;

/**
 * Flat MPG penalty applied while a Highway Emergency Sequence is active an
 * overheating engine under stress burns measurably more fuel than one cruising
 * at a healthy operating temperature, independent of (and additive with) any
 * tire-pressure or air-filter drag already in effect.
 */
const EMERGENCY_DROP_PERCENT = 15;

/**
 * How far past a degradation threshold a reading has to drift before it's
 * contributing the maximum drop keeps the 5-12% band realistic instead of
 * jumping straight to "worst case" the instant a sensor crosses the line.
 *
 * @param {number} value
 * @param {number} threshold
 * @param {number} extreme
 * @returns {number} 0-1
 */
function severity(value, threshold, extreme) {
  return Math.min(1, Math.max(0, (threshold - value) / (threshold - extreme)));
}

/**
 * Translate a 0-1 severity into a realistic MPG penalty between 5% and 12%.
 *
 * @param {number} sev
 * @returns {number}
 */
function dropForSeverity(sev) {
  return 5 + sev * 7;
}

/**
 * Derive a live fuel-efficiency report from the current sensor readings.
 *
 * Efficiency isn't simulated as its own random walk it's a direct
 * consequence of how the rest of the vehicle is doing. Under-inflated tires
 * increase rolling resistance, and a clogged cabin air filter forces the HVAC
 * (and, by extension, the engine) to work harder both are well-understood,
 * realistic drags on MPG, so we derive the number fresh from the live
 * readings every tick rather than maintaining separate simulation state.
 *
 * @param {Record<string, number>} readings  Latest reading per sensor key.
 * @param {Object} [options]
 * @param {boolean} [options.emergencyActive]  Whether a Highway Emergency Sequence is currently underway adds a flat penalty on top of any sensor-driven drag (see `EMERGENCY_DROP_PERCENT`).
 * @returns {EfficiencyReport}
 */
export function computeEfficiency(readings, options = {}) {
  const tireSensor = SENSOR_MAP.tirePressure;
  const filterSensor = SENSOR_MAP.cabinAirFilterPressure;

  const causes = [];
  let totalDropPercent = 0;

  if (options.emergencyActive) {
    totalDropPercent += EMERGENCY_DROP_PERCENT;
    causes.push('an active highway emergency the engine is overheating under load');
  }

  if (readings.tirePressure < tireSensor.normalRange[0]) {
    const sev = severity(readings.tirePressure, tireSensor.normalRange[0], tireSensor.min);
    totalDropPercent += dropForSeverity(sev);
    causes.push('low tire pressure');
  }

  if (readings.cabinAirFilterPressure > filterSensor.normalRange[1]) {
    const sev = Math.min(
      1,
      (readings.cabinAirFilterPressure - filterSensor.normalRange[1]) /
        (filterSensor.max - filterSensor.normalRange[1])
    );
    totalDropPercent += dropForSeverity(sev);
    causes.push('a clogged cabin air filter');
  }

  const dropPercent = round(totalDropPercent, 1);
  const mpg = round(BASELINE_MPG * (1 - dropPercent / 100), 1);
  const isDegraded = causes.length > 0;

  return {
    baselineMpg: BASELINE_MPG,
    mpg,
    dropPercent,
    isDegraded,
    explanation: isDegraded
      ? `Efficiency dropped by ${dropPercent}% due to ${causes.join(' and ')}.`
      : null,
  };
}
