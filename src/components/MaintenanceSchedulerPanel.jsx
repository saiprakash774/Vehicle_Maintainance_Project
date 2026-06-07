import { MAINTENANCE_TASKS, URGENCY_META, getTaskCountdown } from '../services/schedulerService';
import { formatDate } from '../utils/formatters';

/**
 * Format a remaining-quantity countdown for display, handling the
 * already-overdue case ("Overdue by …") distinctly from the upcoming case
 * ("… remaining").
 *
 * @param {number} amount
 * @param {string} unit
 * @returns {string}
 */
function describeCountdown(amount, unit) {
  if (amount <= 0) return `Overdue by ${Math.abs(amount).toLocaleString()} ${unit}`;
  return `${amount.toLocaleString()} ${unit} remaining`;
}

/**
 * One color-coded countdown card per tracked maintenance task visually
 * mirrors `SensorCard` (white card, colored top border, pill badge) so it
 * reads as part of the same dashboard rather than a bolted-on widget.
 *
 * @param {Object} props
 * @param {import('../services/schedulerService').TaskCountdown} props.task
 */
function TaskCard({ task }) {
  const meta = URGENCY_META[task.urgency];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${meta.color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>{task.icon}</span>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
            {task.label}
          </h3>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: meta.color,
            backgroundColor: meta.bg,
            whiteSpace: 'nowrap',
          }}
        >
          {meta.label.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span>Last serviced: {formatDate(task.lastServicedDate)} · {task.lastServicedMileage.toLocaleString()} mi</span>
        <span>Next due: {formatDate(task.nextDueDate)} · {task.nextDueMileage.toLocaleString()} mi</span>
      </div>

      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: meta.color }}>
        {describeCountdown(task.daysRemaining, 'days')} &nbsp;·&nbsp; {describeCountdown(task.milesRemaining, 'mi')}
      </div>
    </div>
  );
}

/**
 * Tracks calendar- and mileage-based service intervals against the live
 * simulated odometer the part of the "invisible maintenance gap" story that
 * sensors alone can't cover (you can't sense an overdue oil change).
 *
 * @param {Object} props
 * @param {number} props.odometer  Current simulated odometer reading (miles).
 */
export default function MaintenanceSchedulerPanel({ odometer }) {
  const countdowns = MAINTENANCE_TASKS.map((task) => getTaskCountdown(task, odometer));

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderTop: '4px solid #6366f1',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>🗓️</span>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            Maintenance Scheduler
          </h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
          Odometer: {Math.round(odometer).toLocaleString()} mi
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {countdowns.map((task) => (
          <TaskCard key={task.key} task={task} />
        ))}
      </div>
    </div>
  );
}
