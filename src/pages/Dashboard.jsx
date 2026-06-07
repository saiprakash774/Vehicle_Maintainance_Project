import { useOutletContext } from 'react-router-dom';
import { DOMAINS } from '../utils/thresholds';
import Header from '../components/Header';
import FuelAnalyticsWidget from '../components/FuelAnalyticsWidget';
import DomainSection from '../components/DomainSection';
import EmergencyModal from '../components/EmergencyModal';

const PHASE_META = {
  leak: { label: '🧊 Coolant leak detected level dropping', color: '#f59e0b', bg: '#fef3c7' },
  overheat: { label: '🌡️ Engine overheating temperatures climbing', color: '#f97316', bg: '#ffedd5' },
  critical: { label: '🚨 Critical pull over immediately', color: '#ef4444', bg: '#fee2e2' },
};

/**
 * The live telemetry cockpit Header, simulation/emergency controls, the fuel
 * widget, and every domain's sensor grid. The maintenance scheduler and the
 * project story now live on their own routed pages (`/scheduler`, `/about`);
 * this page stays focused on "what is the vehicle doing right now."
 *
 * Telemetry itself is owned by `AppLayout` (so it survives navigation) and
 * threaded down through the route's `Outlet` context see `useVehicleTelemetry`.
 *
 * @typedef {import('../hooks/useVehicleTelemetry').VehicleTelemetryController} VehicleTelemetryController
 */
export default function Dashboard() {
  const {
    readings,
    isRunning,
    toggle,
    lastUpdated,
    emergency,
    triggerEmergency,
    dismissEmergencyModal,
  } = /** @type {VehicleTelemetryController} */ (useOutletContext());

  const phaseMeta = emergency.phase ? PHASE_META[emergency.phase] : null;

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <Header lastUpdated={lastUpdated} isRunning={isRunning} onToggle={toggle} />

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            🚦 Emergency Simulation
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#9ca3af', maxWidth: 460 }}>
            Run a scripted 15-second highway crisis a coolant leak that escalates into engine
            overheating to see how the cockpit surfaces a real emergency as it unfolds.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {phaseMeta && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: phaseMeta.color,
                backgroundColor: phaseMeta.bg,
                whiteSpace: 'nowrap',
              }}
            >
              {phaseMeta.label}
            </span>
          )}
          <button
            onClick={triggerEmergency}
            disabled={!isRunning || emergency.phase !== null}
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              cursor: !isRunning || emergency.phase !== null ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#fff',
              backgroundColor: !isRunning || emergency.phase !== null ? '#fca5a5' : '#ef4444',
              whiteSpace: 'nowrap',
            }}
          >
            🚨 Simulate Highway Emergency Sequence
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
          marginTop: 20,
        }}
      >
        <FuelAnalyticsWidget readings={readings} emergencyActive={emergency.isActive} />
      </div>

      {DOMAINS.map((domain) => (
        <DomainSection key={domain.key} domain={domain.key} readings={readings} />
      ))}

      <EmergencyModal isOpen={emergency.isModalOpen} onAcknowledge={dismissEmergencyModal} />
    </main>
  );
}
