import { useTheme } from '../contexts/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 10,
        border: `1px solid var(--color-border)`,
        background: 'var(--color-surface-alt)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
