import { NavLink, Outlet } from 'react-router-dom';
import { useVehicleTelemetry } from '../../hooks/useVehicleTelemetry';
import ThemeToggle from '../ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/scheduler', label: 'Scheduler', icon: '🗓️' },
  { to: '/about', label: 'About', icon: '📖' },
];

const linkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 16px',
  borderRadius: 10,
  fontSize: '0.9rem',
  fontWeight: 600,
  textDecoration: 'none',
  color: isActive ? 'var(--color-info-strong)' : 'var(--color-text-muted)',
  backgroundColor: isActive ? 'var(--color-info-bg)' : 'transparent',
});

/**
 * The navigable app shell: a brand header, a route-aware nav (sidebar on wide
 * viewports, top bar on narrow ones via the `.app-shell`/`.app-sidebar`
 * classes in `index.css`), and an `<Outlet/>` for whichever page is routed.
 *
 * This is also where the single `useVehicleTelemetry` subscription lives.
 * Routed pages come and go, but the underlying vehicle doesn't reset every
 * time you switch tabs so the layout (which stays mounted for the whole
 * session) owns the one adapter connection and threads it down to whichever
 * page is active via `Outlet`'s context. Pages read it with `useOutletContext`
 * rather than each calling the hook themselves, which would spin up
 * independent simulations that drift out of sync with one another.
 */
export default function AppLayout() {
  const telemetry = useVehicleTelemetry();

  return (
    <div className="app-shell">
      <aside
        className="app-sidebar"
        style={{
          display: 'flex',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '24px 16px',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', minWidth: 0 }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🚗</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.25 }}>
            Vehicle Maintenance Monitor
          </span>
        </div>
        <nav className="app-sidebar-nav" style={{ display: 'flex', gap: 6 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} style={linkStyle}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <ThemeToggle />
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet context={telemetry} />
      </div>
    </div>
  );
}
