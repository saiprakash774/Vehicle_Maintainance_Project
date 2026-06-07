import { useOutletContext } from 'react-router-dom';
import { DOMAINS } from '../utils/thresholds';
import Header from '../components/Header';
import FuelAnalyticsWidget from '../components/FuelAnalyticsWidget';
import DomainSection from '../components/DomainSection';

/**
 * The live telemetry cockpit Header, the fuel widget, and every domain's
 * sensor grid. The maintenance scheduler and the project story (including the
 * interactive highway-crisis demo) now live on their own routed pages
 * (`/scheduler`, `/about`); this page stays focused on "what is the vehicle
 * doing right now."
 *
 * Telemetry itself is owned by `AppLayout` (so it survives navigation) and
 * threaded down through the route's `Outlet` context see `useVehicleTelemetry`.
 *
 * @typedef {import('../hooks/useVehicleTelemetry').VehicleTelemetryController} VehicleTelemetryController
 */
export default function Dashboard() {
  const { readings, isRunning, toggle, lastUpdated } =
    /** @type {VehicleTelemetryController} */ (useOutletContext());

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <Header lastUpdated={lastUpdated} isRunning={isRunning} onToggle={toggle} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
          marginTop: 20,
        }}
      >
        <FuelAnalyticsWidget readings={readings} />
      </div>

      {DOMAINS.map((domain) => (
        <DomainSection key={domain.key} domain={domain.key} readings={readings} />
      ))}
    </main>
  );
}
