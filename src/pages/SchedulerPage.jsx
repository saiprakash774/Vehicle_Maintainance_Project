import { useOutletContext } from 'react-router-dom';
import { useMaintenanceScheduler } from '../hooks/useMaintenanceScheduler';
import { formatDate } from '../utils/formatters';
import MaintenanceSchedulerPanel from '../components/MaintenanceSchedulerPanel';
import ActivityLogPanel from '../components/ActivityLogPanel';

/**
 * The preventative scheduling center pairs the live odometer-driven
 * countdowns with a service-history snapshot and a running activity log, so
 * "what's coming due," "what was done last," and "what did I just do about
 * it" read as three views of one record rather than separate subsystems.
 *
 * Reads the live odometer from `AppLayout`'s shared telemetry subscription via
 * `Outlet` context (see `useVehicleTelemetry`), and owns the one
 * `useMaintenanceScheduler` subscription that drives every panel below.
 */
export default function SchedulerPage() {
  const { readings } = /** @type {import('../hooks/useVehicleTelemetry').VehicleTelemetryController} */ (useOutletContext());
  const { tasks, historyLog, lastUpdated, reschedule, confirmManualCheck } = useMaintenanceScheduler(readings.odometer);

  const serviceHistory = [...tasks].sort(
    (a, b) => b.lastServicedDate.getTime() - a.lastServicedDate.getTime()
  );

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          🗓️ Preventative Scheduling Center
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#6b7280', maxWidth: 720 }}>
          Calendar- and mileage-based service intervals, tracked against the live odometer the
          part of the "invisible maintenance gap" story sensors alone can't cover. A coolant
          sensor can warn you the level is low; nothing on the dashboard can sense that an oil
          change is six weeks overdue except a record like this one.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <MaintenanceSchedulerPanel
          tasks={tasks}
          odometer={readings.odometer}
          lastUpdated={lastUpdated}
          onConfirmCheck={confirmManualCheck}
          onReschedule={reschedule}
        />

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            borderTop: '4px solid #0ea5e9',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.4rem' }}>📋</span>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Service History
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
              Most recent service per tracked task, newest first.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {serviceHistory.map((task) => (
              <div
                key={task.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{task.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{task.label}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'right' }}>
                  {formatDate(task.lastServicedDate)}
                  {task.trackingMode === 'mileage' ? ` · ${task.lastServicedMileage.toLocaleString()} mi` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActivityLogPanel entries={historyLog} />
    </main>
  );
}
