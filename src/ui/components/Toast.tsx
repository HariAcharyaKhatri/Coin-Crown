import React from 'react';
import { useUIStore } from '../../store/uiStore';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 2000,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-gold)',
            color: 'var(--color-text-main)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            pointerEvents: 'auto',
            cursor: 'pointer',
            maxWidth: '320px',
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};
