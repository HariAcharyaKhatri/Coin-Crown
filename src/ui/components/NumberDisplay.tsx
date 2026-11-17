import React from 'react';
import { formatNumber } from '../../utils/formatters';

interface NumberDisplayProps {
  value: number;
  label?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  trend?: 'up' | 'down' | 'neutral';
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
  value,
  label,
  icon,
  size = 'md',
  trend,
}) => {
  const fontSizes = {
    sm: 'var(--font-size-sm)',
    md: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
  };

  const trendColors = {
    up: 'var(--color-accent-green)',
    down: 'var(--color-accent-red)',
    neutral: 'var(--color-text-muted)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {label && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon && <span>{icon}</span>}
        <span
          style={{
            fontSize: fontSizes[size],
            fontWeight: 700,
            color: trend ? trendColors[trend] : 'var(--color-gold)',
          }}
        >
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
};
