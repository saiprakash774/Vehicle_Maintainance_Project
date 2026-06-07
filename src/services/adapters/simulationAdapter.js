import { SENSORS } from '../../utils/thresholds';
import { tickPowertrain } from '../powertrainService';
import { tickChassis } from '../chassisService';
import { tickCabin } from '../cabinService';
import { ODOMETER_BASELINE_MILES, tickOdometer } from '../schedulerService';

/** @typedef {import('./telemetryAdapter').Readings} Readings */

const INITIAL_READINGS = SENSORS.reduce(
  (acc, sensor) => ({ ...acc, [sensor.key]: sensor.baseline }),
  /** @type {Readings} */ ({ odometer: ODOMETER_BASELINE_MILES, timestamp: null })
);

/**
 * Concrete `TelemetryAdapter` that simulates a vehicle using the existing pure
 * domain tick functions (`tickPowertrain`/`tickChassis`/`tickCabin`/`tickOdometer`).
 * Owns its own mutable `state` between ticks the "previous reading" those
 * random walks need to drift from. A real device-stream adapter wouldn't need
 * this; the device itself remembers its own state and simply reports it.
 *
 * @param {number} [intervalMs=1000]
 * @returns {import('./telemetryAdapter').TelemetryAdapter}
 */
export function createSimulationAdapter(intervalMs = 1000) {
  let state = INITIAL_READINGS;
  let intervalId = null;

  /** @param {(reading: Readings) => void} onReading */
  function connect(onReading) {
    intervalId = setInterval(() => {
      const next = {
        ...state,
        ...tickPowertrain(state),
        ...tickChassis(state),
        ...tickCabin(state),
        odometer: tickOdometer(state.odometer),
        timestamp: new Date(),
      };
      state = next;
      onReading(next);
    }, intervalMs);
  }

  function disconnect() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { connect, disconnect };
}
