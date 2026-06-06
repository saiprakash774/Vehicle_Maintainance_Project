import { STATUS_META } from '../utils/getStatus';

export default function StatusBadge({ status }) {
  const { label, color, bg } = STATUS_META[status] ?? STATUS_META.normal;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color,
        backgroundColor: bg,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          animation: status !== 'normal' ? 'pulse 1.4s ease-in-out infinite' : 'none',
        }}
      />
      {label.toUpperCase()}
    </span>
  );
}
