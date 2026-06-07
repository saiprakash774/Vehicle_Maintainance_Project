import { useEffect, useRef, useState } from 'react';
import { clamp } from '../utils/simulation';
import { round } from '../utils/formatters';

const TICK_MS = 100;
const LEAK_PHASE_END_MS = 5000;
const OVERHEAT_PHASE_END_MS = 10000;

const BASELINE = { coolant: 100, engineTemp: 92, fuelEfficiency: 28 };
const TARGETS = { coolant: 38, engineTemp: 124, fuelEfficiency: 23.8 };

const ENGINE_TEMP_RANGE = [70, 130];
const EFFICIENCY_RANGE = [18, 30];

const lerp = (start, end, t) => start + (end - start) * t;
const percentInRange = (value, [min, max]) => clamp(((value - min) / (max - min)) * 100, 0, 100);

const PHASE_META = {
  leak: {
    caption: 'Status: Silent leak begins. Standard dashboards ignore this phase.',
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },
  overheat: {
    caption: 'Status: Engine heat rising rapidly. Damage is imminent.',
    color: '#f97316',
    bg: '#ffedd5',
  },
  critical: {
    caption: 'Status: Critical threshold reached. Proactive alert engaged.',
    color: '#ef4444',
    bg: '#fee2e2',
  },
};

/**
 * Derive the demo's three readouts, and which phase they place us in, purely
 * from elapsed time. That makes the whole sequence a stateless function of
 * one number: trivial to animate (advance the number), trivial to reset (set
 * it back to zero), and impossible for the readouts to drift out of sync with
 * each other the way three independently-ticking timers could.
 *
 * @param {number} elapsedMs
 */
function deriveSimState(elapsedMs) {
  const leakProgress = clamp(elapsedMs / LEAK_PHASE_END_MS, 0, 1);
  const overheatProgress = clamp(
    (elapsedMs - LEAK_PHASE_END_MS) / (OVERHEAT_PHASE_END_MS - LEAK_PHASE_END_MS),
    0,
    1
  );

  let phase = null;
  if (elapsedMs > 0 && elapsedMs < LEAK_PHASE_END_MS) phase = 'leak';
  else if (elapsedMs >= LEAK_PHASE_END_MS && elapsedMs < OVERHEAT_PHASE_END_MS) phase = 'overheat';
  else if (elapsedMs >= OVERHEAT_PHASE_END_MS) phase = 'critical';

  return {
    phase,
    coolant: round(lerp(BASELINE.coolant, TARGETS.coolant, leakProgress), 1),
    engineTemp: round(lerp(BASELINE.engineTemp, TARGETS.engineTemp, overheatProgress), 1),
    fuelEfficiency: round(lerp(BASELINE.fuelEfficiency, TARGETS.fuelEfficiency, overheatProgress), 1),
  };
}

const coolantColor = (value) => (value >= 70 ? '#22c55e' : value >= 45 ? '#f59e0b' : '#ef4444');
const engineTempColor = (value) => (value <= 100 ? '#22c55e' : value <= 115 ? '#f59e0b' : '#ef4444');
const efficiencyColor = (value) => {
  const dropPercent = ((BASELINE.fuelEfficiency - value) / BASELINE.fuelEfficiency) * 100;
  return dropPercent < 5 ? '#22c55e' : dropPercent < 12 ? '#f59e0b' : '#ef4444';
};

function MetricReadout({ icon, label, value, unit, percent, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8rem', color: '#6b7280' }}>
        <span>{icon} {label}</span>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color }}>{value}{unit}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginTop: 6 }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 999,
            transition: 'width 0.25s ease, background-color 0.25s ease',
          }}
        />
      </div>
    </div>
  );
}

const actionButtonBaseStyle = {
  padding: '13px 26px',
  borderRadius: 12,
  border: 'none',
  fontWeight: 700,
  fontSize: '0.9rem',
};

/**
 * A self-contained, narrative-driven demo: a compressed ten-second replay of
 * the "silent leak that becomes a highway emergency" story, played out on
 * three readouts this widget builds and owns entirely on its own (no
 * connection to `useVehicleTelemetry`, the live dashboard's vehicle keeps
 * driving, undisturbed, while a visitor explores this page). Every value is
 * derived from a single `elapsedMs` counter via `deriveSimState`, advanced by
 * one `setInterval` and reset by clearing it, so the sequence stays easy to
 * reason about and can never be left in an inconsistent in-between state.
 */
export default function HighwaySimulationWidget() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef(/** @type {ReturnType<typeof setInterval>|null} */ (null));

  useEffect(
    () => () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    },
    []
  );

  function trigger() {
    if (isRunning) return;
    setIsModalOpen(false);
    setElapsedMs(0);
    setIsRunning(true);

    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= OVERHEAT_PHASE_END_MS) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setElapsedMs(OVERHEAT_PHASE_END_MS);
        setIsModalOpen(true);
        return;
      }
      setElapsedMs(elapsed);
    }, TICK_MS);
  }

  function reset() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsModalOpen(false);
    setElapsedMs(0);
  }

  const sim = deriveSimState(elapsedMs);
  const phaseMeta = sim.phase ? PHASE_META[sim.phase] : null;
  const canReset = isRunning || isModalOpen;

  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '28px 32px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderTop: '4px solid #6366f1',
        marginTop: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🛣️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            See the Tech in Action: The Highway Simulation
          </h2>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', maxWidth: 760 }}>
          Reading about a slow leak is one thing; watching a dashboard react to one in real time is
          another. Press the button below to run a compressed, ten-second replay of the highway
          scenario from the story above, and watch these three readouts respond exactly the way the
          live cockpit would: early, specific, and well before anything would look like an
          emergency on a stock dashboard.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
        <MetricReadout
          icon="🧊"
          label="Coolant Level"
          value={sim.coolant}
          unit="%"
          percent={sim.coolant}
          color={coolantColor(sim.coolant)}
        />
        <MetricReadout
          icon="🌡️"
          label="Engine Temperature"
          value={sim.engineTemp}
          unit="°C"
          percent={percentInRange(sim.engineTemp, ENGINE_TEMP_RANGE)}
          color={engineTempColor(sim.engineTemp)}
        />
        <MetricReadout
          icon="⛽"
          label="Fuel Efficiency"
          value={sim.fuelEfficiency}
          unit=" MPG"
          percent={percentInRange(sim.fuelEfficiency, EFFICIENCY_RANGE)}
          color={efficiencyColor(sim.fuelEfficiency)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 38,
          padding: phaseMeta ? '8px 16px' : 0,
          borderRadius: 10,
          backgroundColor: phaseMeta ? phaseMeta.bg : 'transparent',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: phaseMeta ? 600 : 400,
            color: phaseMeta ? phaseMeta.color : '#9ca3af',
            fontStyle: phaseMeta ? 'normal' : 'italic',
          }}
        >
          {phaseMeta
            ? phaseMeta.caption
            : 'Status: All systems normal. Trigger the simulation to watch a developing problem surface in real time.'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <button
          type="button"
          onClick={trigger}
          disabled={isRunning}
          style={{
            ...actionButtonBaseStyle,
            color: '#fff',
            backgroundColor: isRunning ? '#fca5a5' : '#ef4444',
            boxShadow: isRunning ? 'none' : '0 6px 18px rgba(239, 68, 68, 0.35)',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          🚨 Trigger Simulated Highway Leak
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!canReset}
          style={{
            ...actionButtonBaseStyle,
            color: canReset ? '#374151' : '#d1d5db',
            backgroundColor: '#fff',
            border: `1px solid ${canReset ? '#e5e7eb' : '#f3f4f6'}`,
            cursor: canReset ? 'pointer' : 'not-allowed',
          }}
        >
          ↺ Reset Simulation
        </button>
      </div>

      {isModalOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="highway-sim-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              borderTop: '6px solid #ef4444',
              padding: '32px 36px',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <span style={{ fontSize: '2.75rem', animation: 'pulse 1.4s ease-in-out infinite' }}>🚨</span>
            <h2 id="highway-sim-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#991b1b' }}>
              PROACTIVE WARNING: Critical Coolant Drain
            </h2>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#374151' }}>
              System recommends immediate highway pull-off.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 8,
                padding: '12px 28px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#fff',
                backgroundColor: '#ef4444',
              }}
            >
              Acknowledge &amp; Reset Simulation
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
