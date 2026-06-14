export default function Header({ lastUpdated, isRunning, onToggle }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Vehicle Maintenance Monitor
        </h1>
        {lastUpdated && (
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          backgroundColor: isRunning ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
          color: isRunning ? 'var(--color-warning-strong)' : 'var(--color-success-deep)',
        }}
      >
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </header>
  );
}
