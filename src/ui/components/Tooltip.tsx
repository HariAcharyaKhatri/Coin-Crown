import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-bright)',
            color: 'var(--color-text-main)',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: 'var(--font-size-sm)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
