import { SENSORS, SENSOR_MAP } from '../../utils/thresholds';
import { round } from '../../utils/formatters';
import { clamp } from '../../utils/simulation';
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
 * The "Highway Emergency" demo script three five-second phases that briefly
 * override a handful of sensors so warning/critical states surface on demand
 * instead of waiting for the random walk to wander there.
 *
 * Each override is either:
 *  - `{ target }`  linearly interpolate from the value the sensor had the
 *                    moment the phase started toward `target` over the phase's
 *                    duration ("rapidly climbs/drops toward...").
 *  - `{ hold }`    stay near a fixed value with small noise, no interpolation
 *                    (the "critical" phase: things have already gone wrong and
 *                    are simply staying that way until the driver reacts).
 *
 * Targets land just past each sensor's critical threshold (`coolantLevel` < 50,
 * `engineTemp` > 110, `oilTemp` > 125) with margin, so the dashboard
 * unambiguously reads "critical" throughout the back half of the sequence.
 */
const EMERGENCY_PHASES = [
  {
    key: 'leak',
    durationMs: 5000,
    overrides: { coolantLevel: { target: 35 } },
  },
  {
    key: 'overheat',
    durationMs: 5000,
    overrides: { engineTemp: { target: 118 }, oilTemp: { target: 132 } },
  },
  {
    key: 'critical',
    durationMs: 5000,
    overrides: {
      coolantLevel: { hold: 35 },
      engineTemp: { hold: 118 },
      oilTemp: { hold: 132 },
    },
  },
];

const lerp = (start, end, t) => start + (end - start) * t;

/**
 * Concrete `TelemetryAdapter` that simulates a vehicle using the existing pure
 * domain tick functions (`tickPowertrain`/`tickChassis`/`tickCabin`/`tickOdometer`).
 * Owns its own mutable `state` between ticks the "previous reading" those
 * random walks need to drift from. A real device-stream adapter wouldn't need
 * this; the device itself remembers its own state and simply reports it.
 *
 * Also exposes `runEmergencySequence`, an adapter-specific capability *beyond*
 * the base `TelemetryAdapter` contract only a simulated source can be told
 * to "act out" a scripted scenario. `useVehicleTelemetry` feature-detects it
 * via `adapter.runEmergencySequence?.(...)` rather than relying on every
 * adapter implementing it.
 *
 * @param {number} [intervalMs=1000]
 * @returns {import('./telemetryAdapter').TelemetryAdapter & {
 *   runEmergencySequence: (onPhaseChange: (phase: string|null) => void) => boolean
 * }}
 */
export function createSimulationAdapter(intervalMs = 1000) {
  let state = INITIAL_READINGS;
  let intervalId = null;
  /** @type {{ onPhaseChange: (phase: string|null) => void, phaseIndex: number, phaseStartedAt: number, phaseStartValues: Record<string, number>, timeoutId: ReturnType<typeof setTimeout> } | null} */
  let emergency = null;

  /**
   * Apply the active emergency phase's scripted overrides on top of an
   * otherwise-normal tick. Returns `reading` unchanged when no sequence is running.
   *
   * @param {Readings} reading
   * @returns {Readings}
   */
  function applyEmergencyOverrides(reading) {
    if (!emergency) return reading;

    const phase = EMERGENCY_PHASES[emergency.phaseIndex];
    const t = clamp((Date.now() - emergency.phaseStartedAt) / phase.durationMs, 0, 1);
    const overridden = { ...reading };

    for (const [key, spec] of Object.entries(phase.overrides)) {
      const sensor = SENSOR_MAP[key];
      const decimals = sensor.decimals ?? 1;

      if ('target' in spec) {
        overridden[key] = round(lerp(emergency.phaseStartValues[key], spec.target, t), decimals);
      } else {
        const noise = (Math.random() - 0.5) * sensor.fluctuation;
        overridden[key] = round(clamp(spec.hold + noise, sensor.min, sensor.max), decimals);
      }
    }

    return overridden;
  }

  /**
   * Advance to the given phase index, capturing each overridden sensor's
   * current value as the interpolation start point, notifying the hook, and
   * scheduling the next transition. Index past the end ends the sequence.
   *
   * @param {number} index
   */
  function startPhase(index) {
    if (index >= EMERGENCY_PHASES.length) {
      emergency.onPhaseChange(null);
      emergency = null;
      return;
    }

    const phase = EMERGENCY_PHASES[index];
    const phaseStartValues = {};
    for (const key of Object.keys(phase.overrides)) {
      phaseStartValues[key] = state[key];
    }

    const onPhaseChange = emergency.onPhaseChange;
    emergency = {
      onPhaseChange,
      phaseIndex: index,
      phaseStartedAt: Date.now(),
      phaseStartValues,
      timeoutId: setTimeout(() => startPhase(index + 1), phase.durationMs),
    };
    onPhaseChange(phase.key);
  }

  /**
   * Kick off the 15-second scripted sequence. No-ops (returns `false`) if one
   * is already running the dashboard shouldn't be able to stack overlapping
   * crises. Returns `true` when the sequence actually starts.
   *
   * @param {(phase: string|null) => void} onPhaseChange  Called with 'leak' | 'overheat' | 'critical', then `null` when the script ends and normal physics resume.
   * @returns {boolean}
   */
  function runEmergencySequence(onPhaseChange) {
    if (emergency) return false;
    emergency = /** @type {any} */ ({ onPhaseChange });
    startPhase(0);
    return true;
  }

  /** @param {(reading: Readings) => void} onReading */
  function connect(onReading) {
    intervalId = setInterval(() => {
      const ticked = {
        ...state,
        ...tickPowertrain(state),
        ...tickChassis(state),
        ...tickCabin(state),
        odometer: tickOdometer(state.odometer),
        timestamp: new Date(),
      };
      const next = applyEmergencyOverrides(ticked);
      state = next;
      onReading(next);
    }, intervalMs);
  }

  function disconnect() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (emergency) {
      clearTimeout(emergency.timeoutId);
      emergency = null;
    }
  }

  return { connect, disconnect, runEmergencySequence };
}
