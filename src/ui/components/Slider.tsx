import React from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  displayValue?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  displayValue,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {(label || displayValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
          {label && <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
          {displayValue && <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{displayValue}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--color-gold)',
          cursor: 'pointer',
          height: '24px',
        }}
      />
    </div>
  );
};
