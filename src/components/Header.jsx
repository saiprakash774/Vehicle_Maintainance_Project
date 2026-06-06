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
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          Vehicle Maintenance Monitor
        </h1>
        {lastUpdated && (
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
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
          backgroundColor: isRunning ? '#fef3c7' : '#dcfce7',
          color: isRunning ? '#92400e' : '#166534',
        }}
      >
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </header>
  );
}
