import { SENSORS, DOMAIN_MAP } from '../utils/thresholds';
import { getStatus } from '../utils/getStatus';
import { buildAlerts } from '../utils/alerts';
import SensorCard from './SensorCard';
import AlertBanner from './AlertBanner';

/**
 * Groups a domain's sensors (Powertrain / Chassis / Cabin) under a labeled
 * section header, with its own scoped, conditional maintenance-alert banner,
 * so a critical reading in Chassis doesn't get lost in a single dashboard-wide
 * feed alongside five unrelated Powertrain warnings.
 *
 * @param {Object} props
 * @param {'powertrain'|'chassis'|'cabin'} props.domain
 * @param {Record<string, number>} props.readings  Latest reading per sensor key.
 */
export default function DomainSection({ domain, readings }) {
  const meta = DOMAIN_MAP[domain];
  const sensors = SENSORS.filter((sensor) => sensor.domain === domain);

  const statuses = Object.fromEntries(
    sensors.map((sensor) => [sensor.key, getStatus(sensor.key, readings[sensor.key])])
  );
  const alerts = buildAlerts(sensors, readings, statuses);

  return (
    <section style={{ marginTop: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
          {meta.label}
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{meta.description}</span>
      </div>

      <AlertBanner alerts={alerts} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 20,
          marginTop: alerts.length > 0 ? 16 : 0,
        }}
      >
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.key}
            sensorKey={sensor.key}
            value={readings[sensor.key]}
            status={statuses[sensor.key]}
          />
        ))}
      </div>
    </section>
  );
}
