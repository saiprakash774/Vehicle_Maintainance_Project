import { STATUS_META } from '../utils/getStatus';

export default function AlertBanner({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxHeight: 320,
        overflowY: 'auto',
        paddingRight: 4,
      }}
    >
      {alerts.map((alert, i) => {
        const { color, bg } = STATUS_META[alert.status];
        return (
          <div
            key={i}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: bg,
              borderLeft: `4px solid ${color}`,
              fontSize: '0.875rem',
              color: '#1f2937',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{alert.icon}</span>
            <span>
              <strong>{alert.title}</strong> {alert.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
