import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { NumberDisplay } from '../components/NumberDisplay';
import { SEASON_MULTIPLIERS } from '../../engine/constants';
import buildingsData from '../../data/buildings.json';

export const AgricultureScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  const agriBuildings = Object.values(gameState.buildings).filter((inst) => {
    const def = buildingsData.find((b) => b.id === inst.defId);
    return def && def.category === 'agriculture';
  });

  const seasonMultiplier = SEASON_MULTIPLIERS[gameState.season.currentSeason];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel
        title="Agrarian Domain"
        subtitle={`Fields, pastures, and seasonal cycles in ${gameState.currentRegionId}`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay value={agriBuildings.length} label="Farming Estates" icon="🚜" size="lg" />
          <NumberDisplay value={seasonMultiplier * 100} label="Seasonal Yield Mult" icon="☀️" size="lg" />
          <NumberDisplay
            value={gameState.season.totalSeasonsElapsed}
            label="Seasons Elapsed"
            icon="🍂"
            size="lg"
          />
        </div>

        <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Agricultural Holdings</h4>
        {agriBuildings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No agricultural holdings constructed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {agriBuildings.map((inst) => {
              const def = buildingsData.find((b) => b.id === inst.defId);
              if (!def) return null;
              return (
                <div
                  key={inst.instanceId}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{def.name}</span>
                    <span style={{ fontSize: '12px' }}>Lvl {inst.level}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Produces: {def.baseOutput.map((o) => `${o.amountPerMinute}/min ${o.itemId.split('.').pop()}`).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};
