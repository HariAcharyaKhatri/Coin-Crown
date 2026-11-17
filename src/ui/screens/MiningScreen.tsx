import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { ProgressBar } from '../components/ProgressBar';
import { NumberDisplay } from '../components/NumberDisplay';
import { formatNumber } from '../../utils/formatters';
import buildingsData from '../../data/buildings.json';

export const MiningScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  const miningBuildings = Object.values(gameState.buildings).filter((inst) => {
    const def = buildingsData.find((b) => b.id === inst.defId);
    return def && def.category === 'mining';
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel
        title="Subterranean Mining & Smelting"
        subtitle="Mineral extraction, vein equilibrium, and foundry refining"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay value={miningBuildings.length} label="Active Excavations" icon="⛏️" size="lg" />
          <NumberDisplay value={gameState.stats.itemsProduced['item.raw.iron_ore'] ?? 0} label="Lifetime Iron Ore" icon="🪨" size="lg" />
          <NumberDisplay value={gameState.stats.itemsProduced['item.proc.gold_bar'] ?? 0} label="Gold Bars Smelted" icon="🏆" size="lg" />
        </div>

        {miningBuildings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No mines or smelters constructed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {miningBuildings.map((inst) => {
              const def = buildingsData.find((b) => b.id === inst.defId);
              if (!def) return null;
              const depositMax = def.depositMax ?? 20000;
              const depositRemaining = inst.depositRemaining ?? depositMax;

              return (
                <div
                  key={inst.instanceId}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{def.name}</span>
                    <span style={{ fontSize: '12px' }}>Lvl {inst.level}</span>
                  </div>

                  {def.depositMax && (
                    <div>
                      <ProgressBar
                        value={depositRemaining}
                        max={depositMax}
                        label={`Vein Reserve: ${formatNumber(depositRemaining)} / ${formatNumber(depositMax)}`}
                        color="var(--color-accent-blue)"
                      />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px', display: 'block' }}>
                        Replenishment rate maintains 20% sustainable capacity
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {def.baseOutput.map((o) => (
                      <div key={o.itemId}>Output: {o.amountPerMinute}/min {o.itemId.split('.').pop()}</div>
                    ))}
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
