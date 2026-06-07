import { SENSOR_MAP } from '../utils/thresholds';
import { round } from '../utils/formatters';
import { clamp, tickDefault } from '../utils/simulation';

/**
 * @typedef {Object} ChassisReadings
 * @property {number} tirePressure
 * @property {number} brakePadWear
 * @property {number} brakeFluidPressure
 * @property {number} brakeFluidMoisture
 */

const STANDARD_KEYS = ['tirePressure', 'brakePadWear', 'brakeFluidPressure'];

/**
 * Brake fluid is hygroscopic: it absorbs ambient moisture through hoses and
 * seals over time, so its water content only ever creeps upward in normal
 * operation (it's serviced, not "dried out", to bring it back down). On top of
 * that constant drift we add a bump proportional to how far this tick's brake
 * fluid pressure deviated from baseline: a pressure spike is our proxy for a
 * hard-braking event, which generates heat that accelerates moisture ingress
 * through the seals.
 *
 * @param {number} current                  Current moisture reading.
 * @param {number} nextBrakeFluidPressure   This tick's freshly computed pressure.
 * @returns {number}
 */
function tickBrakeFluidMoisture(current, nextBrakeFluidPressure) {
  const sensor = SENSOR_MAP.brakeFluidMoisture;
  const pressureSensor = SENSOR_MAP.brakeFluidPressure;

  const baseDrift = sensor.driftRate * (0.5 + Math.random());
  const noise = (Math.random() - 0.5) * sensor.fluctuation * 0.5;

  const pressureDeviation = Math.abs(nextBrakeFluidPressure - pressureSensor.baseline);
  const heatBump = pressureDeviation > pressureSensor.fluctuation * 2
    ? pressureDeviation * 0.0006
    : 0;

  return round(
    clamp(current + baseDrift + noise + heatBump, sensor.min, sensor.max),
    sensor.decimals ?? 1
  );
}

/**
 * Pure tick function for the Chassis domain (wheels, brakes & suspension).
 * Given the previous full readings object, returns the next values for just
 * the sensors this service owns.
 *
 * @param {Record<string, number>} prev
 * @returns {ChassisReadings}
 */
export function tickChassis(prev) {
  /** @type {Record<string, number>} */
  const next = {};

  for (const key of STANDARD_KEYS) {
    next[key] = tickDefault(prev[key], SENSOR_MAP[key]);
  }

  next.brakeFluidMoisture = tickBrakeFluidMoisture(
    prev.brakeFluidMoisture,
    next.brakeFluidPressure
  );

  return /** @type {ChassisReadings} */ (next);
}
