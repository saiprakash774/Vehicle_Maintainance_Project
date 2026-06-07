import { useMemo } from 'react';
import { computeEfficiency } from '../services/efficiencyService';

/**
 * Derives and displays a live fuel-efficiency report from the current
 * readings. Recomputed via `useMemo` whenever `readings` changes efficiency
 * has no simulation state of its own, it's a direct consequence of how the
 * rest of the vehicle is doing (see `efficiencyService`).
 *
 * @param {Object} props
 * @param {Record<string, number>} props.readings
 * @param {boolean} [props.emergencyActive]  Whether a Highway Emergency Sequence is currently underway folded into the report as an additional flat penalty (see `efficiencyService`).
 */
export default function FuelAnalyticsWidget({ readings, emergencyActive = false }) {
  const efficiency = useMemo(
    () => computeEfficiency(readings, { emergencyActive }),
    [readings, emergencyActive]
  );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderTop: `4px solid ${efficiency.isDegraded ? '#ef4444' : '#22c55e'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.4rem' }}>⛽</span>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
          Fuel Analytics
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 700, color: efficiency.isDegraded ? '#ef4444' : '#111827' }}>
          {efficiency.mpg}
        </span>
        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          MPG &nbsp;·&nbsp; baseline {efficiency.baselineMpg} MPG
        </span>
      </div>

      {efficiency.isDegraded && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 10,
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            fontSize: '0.875rem',
            color: '#1f2937',
          }}
        >
          <span style={{ fontSize: '1.1rem', animation: 'pulse 1.4s ease-in-out infinite' }}>🚨</span>
          <span>
            <strong>Sudden Mileage Drop Detected</strong> {efficiency.explanation}
          </span>
        </div>
      )}

      {!efficiency.isDegraded && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
          Tire pressure and cabin air filter are within range efficiency is at baseline.
        </p>
      )}
    </div>
  );
}
