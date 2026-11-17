import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { formatCoins } from '../../utils/formatters';
import { AudioManager } from '../../audio/AudioManager';
import buildingsData from '../../data/buildings.json';

export const BuildingsScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All 65 Buildings' },
    { id: 'residential', label: 'Residential (10)' },
    { id: 'agriculture', label: 'Agriculture (14)' },
    { id: 'industrial', label: 'Industrial (11)' },
    { id: 'mining', label: 'Mining (9)' },
    { id: 'commercial', label: 'Commercial (10)' },
    { id: 'royal', label: 'Royal (11)' },
  ];

  const filteredBuildings = buildingsData.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Crown & Coin Architectural Registry" subtitle="All 65 sovereign holdings across the 6 realms">
        <Tabs tabs={categories} activeTab={activeCategory} onChange={setActiveCategory} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {filteredBuildings.map((b) => {
            const ownedCount = Object.values(gameState.buildings).filter((inst) => inst.defId === b.id).length;
            const canAfford = gameState.coins >= b.purchaseCost;
            const tierMet = gameState.realmTier >= b.realmTier;
            const depsMet = b.dependencies.every((depId) =>
              Object.values(gameState.buildings).some((inst) => inst.defId === depId)
            );
            const canBuild = canAfford && tierMet && depsMet;

            return (
              <div
                key={b.id}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: ownedCount > 0 ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--color-gold)' }}>{b.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                      {b.category} • Tier {b.realmTier} • {b.landCategory}
                    </span>
                  </div>
                  {ownedCount > 0 && (
                    <span
                      style={{
                        background: 'rgba(229, 178, 76, 0.2)',
                        color: 'var(--color-gold)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      Owned: {ownedCount}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {b.baseOutput.length > 0 && (
                    <div>
                      Produces:{' '}
                      {b.baseOutput.map((o) => `${o.amountPerMinute}/min ${o.itemId.split('.').pop()}`).join(', ')}
                    </div>
                  )}
                  {b.baseIncomePerMinute > 0 && <div>Base Income: {b.baseIncomePerMinute} coins/min</div>}
                  {b.baseMaintenancePerMinute > 0 && <div>Maintenance: {b.baseMaintenancePerMinute} coins/min</div>}
                  {b.workerSlots > 0 && <div>Worker Slots: {b.workerSlots} ({b.workerProfession})</div>}
                  {b.housingCapacity > 0 && <div>Housing Capacity: +{b.housingCapacity}</div>}
                  {b.taxBasePerMinute > 0 && <div>Tax Base: {b.taxBasePerMinute} /min</div>}
                </div>

                {!tierMet && (
                  <div style={{ fontSize: '11px', color: 'var(--color-accent-red)' }}>
                    Requires Realm Tier {b.realmTier}
                  </div>
                )}
                {!depsMet && (
                  <div style={{ fontSize: '11px', color: 'var(--color-accent-red)' }}>
                    Requires dependency: {b.dependencies.join(', ')}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={!canBuild}
                    onClick={() => {
                      dispatch({ type: 'BUILD', defId: b.id });
                      AudioManager.playBuild();
                    }}
                  >
                    Construct ({formatCoins(b.purchaseCost)})
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
