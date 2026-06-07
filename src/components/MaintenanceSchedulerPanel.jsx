import { useState } from 'react';
import { URGENCY_META, getTaskCountdown } from '../services/schedulerService';
import { formatDate, formatTimestamp, toDateInputValue } from '../utils/formatters';

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

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  cursor: 'pointer',
};

/**
 * One color-coded countdown card per tracked reminder visually mirrors
 * `SensorCard` (white card, colored left border, pill badge) so it reads as
 * part of the same dashboard rather than a bolted-on widget. Carries its own
 * "Mark Completed" / "Reschedule" controls; the inline date form is local UI
 * state (`isRescheduling`/`draftDate`) that only ever produces a committed
 * change by calling back up to `onReschedule`, never mutating `task` itself.
 *
 * @param {Object} props
 * @param {import('../services/schedulerService').TaskCountdown} props.task
 * @param {(key: string) => void} props.onConfirmCheck
 * @param {(key: string, newDate: string) => void} props.onReschedule
 */
function TaskCard({ task, onConfirmCheck, onReschedule }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [draftDate, setDraftDate] = useState(() => toDateInputValue(task.nextDueDate));

  const meta = URGENCY_META[task.urgency];
  const tracksMileage = task.trackingMode === 'mileage';
  const minDate = toDateInputValue(task.nextDueDate);

  function openRescheduleForm() {
    setDraftDate(minDate);
    setIsRescheduling(true);
  }

  function submitReschedule(event) {
    event.preventDefault();
    if (!draftDate) return;
    onReschedule(task.key, draftDate);
    setIsRescheduling(false);
  }

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
        <span>
          Last serviced: {formatDate(task.lastServicedDate)}
          {tracksMileage ? ` · ${task.lastServicedMileage.toLocaleString()} mi` : ''}
        </span>
        <span>
          Next due: {formatDate(task.nextDueDate)}
          {tracksMileage ? ` · ${task.nextDueMileage.toLocaleString()} mi` : ''}
        </span>
      </div>

      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: meta.color }}>
        {describeCountdown(task.daysRemaining, 'days')}
        {tracksMileage ? <>&nbsp;·&nbsp;{describeCountdown(task.milesRemaining, 'mi')}</> : null}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
        <button type="button" style={actionButtonStyle} onClick={() => onConfirmCheck(task.key)}>
          ✅ Mark Completed
        </button>
        <button
          type="button"
          style={actionButtonStyle}
          onClick={() => (isRescheduling ? setIsRescheduling(false) : openRescheduleForm())}
        >
          📅 Reschedule
        </button>
      </div>

      {isRescheduling && (
        <form onSubmit={submitReschedule} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <input
            type="date"
            value={draftDate}
            min={minDate}
            onChange={(event) => setDraftDate(event.target.value)}
            style={{
              fontSize: '0.8rem',
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              color: '#374151',
            }}
          />
          <button
            type="submit"
            style={{ ...actionButtonStyle, background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' }}
          >
            Confirm New Date
          </button>
          <button type="button" style={actionButtonStyle} onClick={() => setIsRescheduling(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Tracks calendar- and mileage-based service intervals (plus calendar-only
 * regulatory and billing reminders) against the live simulated odometer the
 * part of the "invisible maintenance gap" story that sensors alone can't
 * cover. Interactive: each card can be marked completed or rescheduled, and
 * the panel surfaces the moment the underlying data last changed via the
 * "System Status Last Updated" line, sourced from `useMaintenanceScheduler`.
 *
 * @param {Object} props
 * @param {import('../services/schedulerService').MaintenanceTask[]} props.tasks
 * @param {number} props.odometer  Current simulated odometer reading (miles).
 * @param {Date} props.lastUpdated
 * @param {(key: string) => void} props.onConfirmCheck
 * @param {(key: string, newDate: string) => void} props.onReschedule
 */
export default function MaintenanceSchedulerPanel({ tasks, odometer, lastUpdated, onConfirmCheck, onReschedule }) {
  const countdowns = tasks.map((task) => getTaskCountdown(task, odometer));

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
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', fontWeight: 600, color: '#6366f1' }}>
          System Status Last Updated: {formatTimestamp(lastUpdated)}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {countdowns.map((task) => (
          <TaskCard key={task.key} task={task} onConfirmCheck={onConfirmCheck} onReschedule={onReschedule} />
        ))}
      </div>
    </div>
  );
}
