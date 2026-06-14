import { formatTimestamp } from '../utils/formatters';

const ACTION_META = {
  Completed: { color: 'var(--color-success-strong)', bg: 'var(--color-success-bg)' },
  Rescheduled: { color: 'var(--color-blue)', bg: 'var(--color-blue-bg)' },
};

/**
 * A scrollable audit trail of every "Mark Completed" / "Reschedule" action
 * taken from the scheduler: the running record of what the driver actually
 * did, as distinct from `MaintenanceSchedulerPanel`'s forward-looking
 * countdowns and the Service History panel's per-task last-done snapshot.
 * Fed by `useMaintenanceScheduler`'s `historyLog` (newest first).
 *
 * @param {Object} props
 * @param {import('../services/schedulerService').ServiceHistoryEntry[]} props.entries
 */
export default function ActivityLogPanel({ entries }) {
  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderTop: '4px solid var(--color-purple)',
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>📜</span>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Recent Activity
          </h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
          Every reminder you mark completed or reschedule lands here, newest first.
        </p>
      </div>

      {entries.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          No activity yet. Mark a reminder completed or reschedule one to start the log.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: 260,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {entries.map((entry) => {
            const meta = ACTION_META[entry.action];
            return (
              <li
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: 'var(--color-surface-alt)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: '1.1rem' }}>{entry.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{entry.taskName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                      {formatTimestamp(entry.timestamp)} · {entry.mileage.toLocaleString()} mi
                    </span>
                  </div>
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
                  {entry.action.toUpperCase()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
