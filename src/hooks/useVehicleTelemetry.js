import { useEffect, useRef, useState } from 'react';
import { SENSORS } from '../utils/thresholds';
import { formatTimestamp } from '../utils/formatters';
import { ODOMETER_BASELINE_MILES } from '../services/schedulerService';
import { createSimulationAdapter } from '../services/adapters/simulationAdapter';

/** @typedef {import('../services/adapters/telemetryAdapter').Readings} Readings */

/**
 * @typedef {Object} EmergencyState
 * @property {'leak'|'overheat'|'critical'|null} phase  Current step of the scripted Highway Emergency Sequence, or `null` when idle.
 * @property {boolean} isModalOpen  Whether the critical-warning modal is currently shown.
 * @property {boolean} isActive     True from the moment the sequence starts until the modal is dismissed deliberately outlives `phase` reaching `null`, since "the crisis" isn't over just because the script timer ended. Drives things like the fuel-efficiency penalty.
 */

/**
 * @typedef {Object} VehicleTelemetryController
 * @property {Readings} readings
 * @property {boolean} isRunning
 * @property {() => void} toggle
 * @property {string|null} lastUpdated
 * @property {EmergencyState} emergency
 * @property {() => void} triggerEmergency      Start the Highway Emergency Sequence (no-op if one is already running).
 * @property {() => void} dismissEmergencyModal
 */

const INITIAL_READINGS = SENSORS.reduce(
  (acc, sensor) => ({ ...acc, [sensor.key]: sensor.baseline }),
  /** @type {Readings} */ ({ odometer: ODOMETER_BASELINE_MILES, timestamp: null })
);

/**
 * The single, unified interface the rest of the app consumes vehicle
 * telemetry through an Adapter Pattern boundary. This hook knows nothing
 * about *how* readings are produced; it only knows the `TelemetryAdapter`
 * contract (`connect`/`disconnect`) plus the optional emergency-sequence
 * capability a simulated source can offer (feature-detected, never assumed).
 *
 * Swapping the data source simulation today, a real OBD-II/CAN-bus bridge
 * streamed over WebSocket tomorrow means changing the single
 * `createSimulationAdapter(...)` call below to e.g.
 * `createObdWebSocketAdapter('ws://192.168.1.50:8080/telemetry')`; nothing
 * else in the app (services, components, pages) needs to change, because they
 * all consume the same `Readings` shape regardless of where it came from.
 *
 * @param {number} [intervalMs=1000]  How often the simulated source advances.
 * @returns {VehicleTelemetryController}
 */
export function useVehicleTelemetry(intervalMs = 1000) {
  const [readings, setReadings] = useState(INITIAL_READINGS);
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState(/** @type {'leak'|'overheat'|'critical'|null} */ (null));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lazily create the adapter exactly once. This is the one and only place
  // that names a concrete adapter see the swap note above.
  const adapterRef = useRef(/** @type {ReturnType<typeof createSimulationAdapter>|null} */ (null));
  if (adapterRef.current === null) {
    adapterRef.current = createSimulationAdapter(intervalMs);
  }

  useEffect(() => {
    if (!isRunning) return undefined;

    const adapter = adapterRef.current;
    adapter.connect(setReadings);
    return () => {
      adapter.disconnect();
      // Disconnecting cancels any in-flight emergency sequence at the adapter
      // level too reset the phase here so a pause mid-sequence can't leave
      // the indicator (and the MPG penalty it drives via `isActive`) stuck.
      setPhase(null);
    };
  }, [isRunning]);

  /** @param {'leak'|'overheat'|'critical'|null} nextPhase */
  function handlePhaseChange(nextPhase) {
    setPhase(nextPhase);
    if (nextPhase === 'critical') setIsModalOpen(true);
  }

  function triggerEmergency() {
    adapterRef.current.runEmergencySequence?.(handlePhaseChange);
  }

  function dismissEmergencyModal() {
    setIsModalOpen(false);
  }

  return {
    readings,
    isRunning,
    toggle: () => setIsRunning((running) => !running),
    lastUpdated: readings.timestamp ? formatTimestamp(readings.timestamp) : null,
    emergency: {
      phase,
      isModalOpen,
      isActive: phase !== null || isModalOpen,
    },
    triggerEmergency,
    dismissEmergencyModal,
  };
}
