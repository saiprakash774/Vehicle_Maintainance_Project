import { SENSOR_MAP } from './thresholds';

export const STATUS_META = {
  normal:   { label: 'Normal',   color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  warning:  { label: 'Warning',  color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  critical: { label: 'Critical', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
};

export function getStatus(sensorKey, value) {
  const { normalRange, warningBands } = SENSOR_MAP[sensorKey];
  if (value >= normalRange[0] && value <= normalRange[1]) return 'normal';
  if (warningBands.some(([lo, hi]) => value >= lo && value <= hi)) return 'warning';
  return 'critical';
}
