import { useEffect, useState } from 'react';
import { startSimulation, stopSimulation } from '../services/telemetryService';
import { getStatus } from '../utils/getStatus';
import { formatTimestamp } from '../utils/formatters';
import { SENSORS } from '../utils/thresholds';
import Header from '../components/Header';
import SensorCard from '../components/SensorCard';
import AlertBanner from '../components/AlertBanner';

const INITIAL = SENSORS.reduce(
  (acc, sensor) => ({ ...acc, [sensor.key]: sensor.baseline }),
  { timestamp: null }
);

function buildAlerts(readings, statuses) {
  const alerts = [];
  SENSORS.forEach((sensor) => {
    const status = statuses[sensor.key];
    if (status === 'normal') return;
    alerts.push({
      status,
      icon: status === 'critical' ? '🚨' : '⚠️',
      title: `${sensor.label} — ${status === 'critical' ? 'Critical' : 'Warning'}`,
      message:
        status === 'critical'
          ? `Reading is ${readings[sensor.key]} ${sensor.unit} — schedule maintenance immediately.`
          : `Reading is ${readings[sensor.key]} ${sensor.unit} — outside the optimal range.`,
    });
  });
  return alerts;
}

export default function Dashboard() {
  const [readings, setReadings] = useState(INITIAL);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isRunning) {
      startSimulation((data) => setReadings(data));
    } else {
      stopSimulation();
    }
    return () => stopSimulation();
  }, [isRunning]);

  const statuses = Object.fromEntries(
    SENSORS.map((sensor) => [sensor.key, getStatus(sensor.key, readings[sensor.key])])
  );
  const alerts = buildAlerts(readings, statuses);

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Header
        lastUpdated={readings.timestamp ? formatTimestamp(readings.timestamp) : null}
        isRunning={isRunning}
        onToggle={() => setIsRunning((r) => !r)}
      />

      <AlertBanner alerts={alerts} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 20,
          marginTop: alerts.length > 0 ? 20 : 0,
        }}
      >
        {SENSORS.map((sensor) => (
          <SensorCard
            key={sensor.key}
            sensorKey={sensor.key}
            value={readings[sensor.key]}
            status={statuses[sensor.key]}
          />
        ))}
      </div>
    </main>
  );
}
