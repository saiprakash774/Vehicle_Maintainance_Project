/**
 * High-priority overlay shown when the Highway Emergency Sequence reaches its
 * "critical" phase. Deliberately modal and undismissable except by explicit
 * acknowledgement a "pull over immediately" warning shouldn't be easy to
 * miss or auto-dismiss the way a passive banner could be.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onAcknowledge
 */
export default function EmergencyModal({ isOpen, onAcknowledge }) {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          borderTop: '6px solid #ef4444',
          padding: '32px 36px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <span style={{ fontSize: '2.75rem', animation: 'pulse 1.4s ease-in-out infinite' }}>🚨</span>
        <h2 id="emergency-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>
          Critical Warning: Coolant Depleted &amp; Engine Overheating
        </h2>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#374151' }}>
          Pull over safely immediately to prevent total engine seizure.
        </p>
        <button
          onClick={onAcknowledge}
          style={{
            marginTop: 8,
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#fff',
            backgroundColor: '#ef4444',
          }}
        >
          Pull Over &amp; Acknowledge
        </button>
      </div>
    </div>
  );
}
