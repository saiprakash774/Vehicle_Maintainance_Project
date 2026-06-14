import { STATUS_META } from '../utils/getStatus';

const SIZE = 160;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = Math.PI * R; // half-circle arc length

function valueToOffset(value, min, max) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return CIRCUMFERENCE * (1 - pct);
}

export default function Gauge({ value, min, max, status, unit }) {
  const { color } = STATUS_META[status] ?? STATUS_META.normal;
  const offset = valueToOffset(value, min, max);
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <svg
      width={SIZE}
      height={SIZE / 2 + STROKE}
      viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE}`}
      aria-label={`${value}${unit}`}
    >
      {/* Track */}
      <path
        d={`M ${STROKE / 2} ${cy} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${cy}`}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={`M ${STROKE / 2} ${cy} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
      />
      {/* Label */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill={color}
        style={{ transition: 'fill 0.4s ease' }}
      >
        {value}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">
        {unit}
      </text>
    </svg>
  );
}
