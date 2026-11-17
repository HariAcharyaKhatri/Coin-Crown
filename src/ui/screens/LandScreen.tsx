import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { formatCoins } from '../../utils/formatters';
import landData from '../../data/land.json';

export const LandScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const nextPlotCost = Math.round(
    landData.basePlotCost * Math.pow(landData.costMultiplierPerPlot, gameState.ownedPlots)
  );
  const canAfford = gameState.coins >= nextPlotCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel
        title="Territorial Plots"
        subtitle={`Owned: ${gameState.ownedPlots} plots across provinces`}
        headerAction={
          <Button
            variant="primary"
            size="md"
            disabled={!canAfford}
            onClick={() => {
              const newPlotId = `plot.${gameState.currentRegionId}.${Date.now()}`;
              dispatch({ type: 'BUY_PLOT', plotId: newPlotId });
            }}
          >
            Claim New Plot ({formatCoins(nextPlotCost)})
          </Button>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {landData.categories.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: c.color }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
          {Array.from({ length: Math.max(25, gameState.ownedPlots + 5) }).map((_, idx) => {
            const isOwned = idx < gameState.ownedPlots;
            const category = landData.categories[idx % landData.categories.length];

            return (
              <div
                key={idx}
                style={{
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isOwned ? category.color : 'rgba(255,255,255,0.03)',
                  border: isOwned ? '2px solid var(--color-gold)' : '1px dashed var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  color: isOwned ? '#fff' : 'var(--color-text-dim)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                <span>Plot #{idx + 1}</span>
                <span style={{ opacity: 0.85, fontSize: '10px' }}>{isOwned ? category.name : 'Unclaimed'}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
