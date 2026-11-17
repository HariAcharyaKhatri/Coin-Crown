import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  color = 'var(--color-gold)',
  height = 8,
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          <span>{label}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
