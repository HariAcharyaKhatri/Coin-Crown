import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Slider } from '../components/Slider';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { formatPercent } from '../../utils/formatters';
import { calculateTaxSatisfactionMultiplier, calculateUnrestPenalty } from '../../engine/formulas/taxation';

export const TaxScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const taxRate = gameState.population.taxRate;
  const satMult = calculateTaxSatisfactionMultiplier(taxRate);
  const unrestPenalty = calculateUnrestPenalty(gameState.population.unrest);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Panel title="Tax Edicts & Civic Unrest" subtitle="Balance realm revenues against citizen satisfaction">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <NumberDisplay value={gameState.population.satisfaction} label="Satisfaction Index" icon="😊" size="lg" />
          <NumberDisplay value={gameState.population.unrest} label="Civil Unrest" icon="🔥" size="lg" trend={gameState.population.unrest > 50 ? 'down' : 'neutral'} />
          <NumberDisplay value={satMult * 100} label="Yield Efficiency" icon="📊" size="lg" />
          <NumberDisplay value={unrestPenalty * 100} label="Output Penalty" icon="⚠️" size="lg" />
        </div>

        {/* Tax Slider */}
        <div style={{ background: 'var(--color-bg-elevated)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px' }}>Crown Tax Edict</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Neutral tithe rate is 15.0%. Higher rates spur tax income but breed discontent and rebellion.
          </p>
          <Slider
            value={taxRate}
            min={0.00}
            max={0.50}
            step={0.01}
            displayValue={formatPercent(taxRate)}
            onChange={(val) => dispatch({ type: 'SET_TAX_RATE', rate: val })}
          />
        </div>

        {/* Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ProgressBar
            value={gameState.population.satisfaction}
            max={100}
            label={`Public Satisfaction: ${Math.round(gameState.population.satisfaction)}% (Target: >70%)`}
            color="var(--color-accent-green)"
          />

          <ProgressBar
            value={gameState.population.unrest}
            max={100}
            label={`Civil Rebellion Unrest: ${Math.round(gameState.population.unrest)}% (Thresholds: 25%, 50%, 75%)`}
            color="var(--color-accent-red)"
          />
        </div>
      </Panel>
    </div>
  );
};
