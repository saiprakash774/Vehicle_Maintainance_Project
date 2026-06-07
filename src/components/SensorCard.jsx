import Gauge from './Gauge';
import StatusBadge from './StatusBadge';
import { STATUS_META } from '../utils/getStatus';
import { SENSOR_MAP } from '../utils/thresholds';

export default function SensorCard({ sensorKey, value, status }) {
  const cfg = SENSOR_MAP[sensorKey];
  const { color } = STATUS_META[status] ?? STATUS_META.normal;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderTop: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        minWidth: 220,
        transition: 'border-color 0.4s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
          {cfg.label}
        </h2>
      </div>

      <Gauge
        value={value}
        min={cfg.min}
        max={cfg.max}
        status={status}
        unit={cfg.unit}
      />

      <StatusBadge status={status} />

      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
        Safe range: {cfg.normalRange[0]}–{cfg.normalRange[1]} {cfg.unit}
      </div>
    </div>
  );
}
