import './feedback.css';

export default function LoadingIndicator({ label = 'Cargando…', fullScreen = false, overlay = false, compact = false }) {
  return <span className={`ad-loading${fullScreen ? ' ad-loading-page' : ''}${overlay ? ' ad-loading-overlay' : ''}${compact ? ' ad-loading-compact' : ''}`} role="status" aria-live="polite">
    <span className="ad-loading-spinner" aria-hidden="true"/><span className={compact ? 'ad-loading-sr' : ''}>{label}</span>
  </span>;
}
