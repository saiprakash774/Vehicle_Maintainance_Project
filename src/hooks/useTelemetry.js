import { useEffect, useRef, useState } from 'react';
import { SENSORS } from '../utils/thresholds';
import { formatTimestamp } from '../utils/formatters';
import { tickPowertrain } from '../services/powertrainService';
import { tickChassis } from '../services/chassisService';
import { tickCabin } from '../services/cabinService';

/**
 * @typedef {Record<string, number> & { timestamp: Date|null }} Readings
 */

/**
 * @typedef {Object} TelemetryController
 * @property {Readings} readings        Latest reading for every sensor, plus a timestamp.
 * @property {boolean} isRunning        Whether the simulation is currently advancing.
 * @property {() => void} toggle        Pause/resume the simulation.
 * @property {string|null} lastUpdated  Formatted time of the most recent reading, or null.
 */

const INITIAL_READINGS = SENSORS.reduce(
  (acc, sensor) => ({ ...acc, [sensor.key]: sensor.baseline }),
  /** @type {Readings} */ ({ timestamp: null })
);

/**
 * Telemetry controller hook — the single point of aggregation for the three
 * domain simulation services (Powertrain, Chassis, Cabin).
 *
 * Owns one `setInterval` (deliberately not three — independent per-domain
 * intervals would drift relative to each other and triple the React render
 * count for no benefit) and, each tick, asks every domain service to advance
 * its own slice of the readings from the previous full snapshot, merging the
 * results into a single state update.
 *
 * Each domain service is a pure function `(prevReadings) => partialNextReadings`,
 * so the simulation logic itself stays fully decoupled from React and is
 * trivially unit-testable without mocking timers.
 *
 * @param {number} [intervalMs=1000]  How often to advance the simulation.
 * @returns {TelemetryController}
 */
export function useTelemetry(intervalMs = 1000) {
  const [readings, setReadings] = useState(INITIAL_READINGS);
  const [isRunning, setIsRunning] = useState(true);
  const readingsRef = useRef(readings);
  readingsRef.current = readings;

  useEffect(() => {
    if (!isRunning) return undefined;

    const id = setInterval(() => {
      const prev = readingsRef.current;
      const next = {
        ...prev,
        ...tickPowertrain(prev),
        ...tickChassis(prev),
        ...tickCabin(prev),
        timestamp: new Date(),
      };
      readingsRef.current = next;
      setReadings(next);
    }, intervalMs);

    return () => clearInterval(id);
  }, [isRunning, intervalMs]);

  return {
    readings,
    isRunning,
    toggle: () => setIsRunning((running) => !running),
    lastUpdated: readings.timestamp ? formatTimestamp(readings.timestamp) : null,
  };
}
