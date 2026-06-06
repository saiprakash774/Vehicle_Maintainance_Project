import { useEffect, useState } from 'react';
import { startSimulation, stopSimulation } from '../services/telemetryService';
import { getEngineTempStatus, getTirePressureStatus } from '../utils/getStatus';
import { formatTimestamp } from '../utils/formatters';
import { THRESHOLDS } from '../utils/thresholds';
import Header from '../components/Header';
import SensorCard from '../components/SensorCard';
import AlertBanner from '../components/AlertBanner';

const INITIAL = {
  engineTemp: THRESHOLDS.engineTemp.baseline,
  tirePressure: THRESHOLDS.tirePressure.baseline,
  timestamp: null,
};

function buildAlerts(engineTemp, tirePressure, engineStatus, tireStatus) {
  const alerts = [];
  if (engineStatus === 'critical') {
    alerts.push({
      status: 'critical',
      icon: '🔥',
      title: 'Engine Overheating',
      message: `Temperature is ${engineTemp}°C — immediate inspection required.`,
    });
  } else if (engineStatus === 'warning') {
    alerts.push({
      status: 'warning',
      icon: '⚠️',
      title: 'High Engine Temperature',
      message: `Temperature is ${engineTemp}°C — approaching critical threshold.`,
    });
  }
  if (tireStatus === 'critical') {
    alerts.push({
      status: 'critical',
      icon: '💨',
      title: 'Tire Pressure Critical',
      message: `Pressure is ${tirePressure} PSI — check tires immediately.`,
    });
  } else if (tireStatus === 'warning') {
    alerts.push({
      status: 'warning',
      icon: '⚠️',
      title: 'Tire Pressure Warning',
      message: `Pressure is ${tirePressure} PSI — outside optimal range.`,
    });
  }
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

  const engineStatus = getEngineTempStatus(readings.engineTemp);
  const tireStatus = getTirePressureStatus(readings.tirePressure);
  const alerts = buildAlerts(readings.engineTemp, readings.tirePressure, engineStatus, tireStatus);

  return (
    <main
      style={{
        maxWidth: 900,
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
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          marginTop: alerts.length > 0 ? 20 : 0,
        }}
      >
        <SensorCard
          title="Engine Temperature"
          icon="🌡️"
          sensorKey="engineTemp"
          value={readings.engineTemp}
          status={engineStatus}
        />
        <SensorCard
          title="Tire Pressure"
          icon="🛞"
          sensorKey="tirePressure"
          value={readings.tirePressure}
          status={tireStatus}
        />
      </div>
    </main>
  );
}
