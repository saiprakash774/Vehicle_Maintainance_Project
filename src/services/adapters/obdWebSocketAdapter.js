import { SENSORS } from '../../utils/thresholds';
import { ODOMETER_BASELINE_MILES } from '../schedulerService';

/** @typedef {import('./telemetryAdapter').Readings} Readings */

const SENSOR_KEYS = SENSORS.map((s) => s.key);

/**
 * Parse one incoming telemetry message from a real OBD-II → CAN-bus → WebSocket
 * bridge into the app's `Readings` shape.
 *
 * The wire format such a bridge would emit is a flat JSON object keyed by PID
 * name, plus an odometer reading and an ISO timestamp, e.g.:
 * ```json
 * { "engineTemp": 91.4, "oilTemp": 102.0, ..., "odometer": 55012.3, "timestamp": "2026-01-01T12:00:00Z" }
 * ```
 * Unknown keys are ignored and missing sensor keys simply stay absent this
 * keeps the adapter tolerant of a bridge that reports a subset of PIDs (a real
 * vehicle won't always expose every channel the dashboard knows about).
 *
 * @param {string} raw  Raw `MessageEvent.data` payload (JSON text).
 * @returns {Readings|null}  `null` when the payload can't be parsed as telemetry.
 */
function parseReading(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;

  /** @type {Readings} */
  const reading = /** @type {any} */ ({
    odometer: typeof payload.odometer === 'number' ? payload.odometer : ODOMETER_BASELINE_MILES,
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
  });

  for (const key of SENSOR_KEYS) {
    if (typeof payload[key] === 'number') {
      reading[key] = payload[key];
    }
  }

  return reading;
}

/**
 * Concrete `TelemetryAdapter` that sources live readings from a real vehicle
 * via a WebSocket bridge the same kind of `ws://` endpoint an OBD-II adapter
 * on the car's CAN bus would publish JSON telemetry to (see the "Real-World
 * Hardware Bridge" section on the About page for the full pipeline).
 *
 * This is a complete, working implementation of the `TelemetryAdapter`
 * contract not a stub to concretely demonstrate the adapter pattern's
 * payoff: pointing `useVehicleTelemetry` at `createObdWebSocketAdapter(url)`
 * instead of `createSimulationAdapter()` is the *only* change required to move
 * this dashboard from a simulated demo to a live vehicle, because every other
 * layer (services, hooks, components, pages) consumes the same `Readings` shape
 * regardless of where it came from.
 *
 * @param {string} url  The bridge's WebSocket URL, e.g. `'ws://192.168.1.50:8080/telemetry'`.
 * @returns {import('./telemetryAdapter').TelemetryAdapter}
 */
export function createObdWebSocketAdapter(url) {
  /** @type {WebSocket|null} */
  let socket = null;

  /** @param {(reading: Readings) => void} onReading */
  function connect(onReading) {
    socket = new WebSocket(url);

    socket.addEventListener('message', (event) => {
      const reading = parseReading(event.data);
      if (reading) onReading(reading);
    });
  }

  function disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  return { connect, disconnect };
}
