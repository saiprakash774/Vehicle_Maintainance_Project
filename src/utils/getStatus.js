import { THRESHOLDS } from './thresholds';

export function getEngineTempStatus(value) {
  const { normal, warning } = THRESHOLDS.engineTemp;
  if (value < normal.min || value > warning.max) return 'critical';
  if (value > normal.max) return 'warning';
  return 'normal';
}

export function getTirePressureStatus(value) {
  const { normal, warning, warningHigh } = THRESHOLDS.tirePressure;
  if (value < warning.min || value > warningHigh.max) return 'critical';
  if (value < normal.min || value > normal.max) return 'warning';
  return 'normal';
}

export const STATUS_META = {
  normal:   { label: 'Normal',   color: '#22c55e', bg: '#dcfce7' },
  warning:  { label: 'Warning',  color: '#f59e0b', bg: '#fef3c7' },
  critical: { label: 'Critical', color: '#ef4444', bg: '#fee2e2' },
};
