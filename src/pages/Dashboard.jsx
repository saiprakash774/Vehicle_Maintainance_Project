import { useTelemetry } from '../hooks/useTelemetry';
import { DOMAINS } from '../utils/thresholds';
import Header from '../components/Header';
import DomainSection from '../components/DomainSection';

export default function Dashboard() {
  const { readings, isRunning, toggle, lastUpdated } = useTelemetry();

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Header lastUpdated={lastUpdated} isRunning={isRunning} onToggle={toggle} />

      {DOMAINS.map((domain) => (
        <DomainSection key={domain.key} domain={domain.key} readings={readings} />
      ))}
    </main>
  );
}
