import { SENSOR_MAP } from './thresholds';

export const STATUS_META = {
  normal:   { label: 'Normal',   color: '#22c55e', bg: '#dcfce7' },
  warning:  { label: 'Warning',  color: '#f59e0b', bg: '#fef3c7' },
  critical: { label: 'Critical', color: '#ef4444', bg: '#fee2e2' },
};

export function getStatus(sensorKey, value) {
  const { normalRange, warningBands } = SENSOR_MAP[sensorKey];
  if (value >= normalRange[0] && value <= normalRange[1]) return 'normal';
  if (warningBands.some(([lo, hi]) => value >= lo && value <= hi)) return 'warning';
  return 'critical';
}
