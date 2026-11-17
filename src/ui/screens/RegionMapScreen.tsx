import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import regionsData from '../../data/regions.json';

export const RegionMapScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="The 10 Realms of Eldoria" subtitle="Sovereign provinces and continental frontiers">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {regionsData.map((reg) => {
            const isCurrent = gameState.currentRegionId === reg.id;
            const isUnlocked = gameState.unlockedRegions.includes(reg.id) || gameState.realmTier >= reg.tier;

            return (
              <div
                key={reg.id}
                style={{
                  background: isCurrent ? 'rgba(229, 178, 76, 0.1)' : 'var(--color-bg-elevated)',
                  border: isCurrent ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: isCurrent ? 'var(--color-gold)' : 'var(--color-text-main)' }}>{reg.name}</h3>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: isUnlocked ? 'var(--color-accent-green)' : 'var(--color-bg-base)',
                      color: '#fff',
                    }}
                  >
                    Tier {reg.tier} {isCurrent ? '(Active)' : isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                  {reg.description}
                </p>

                <div style={{ fontSize: '12px', color: 'var(--color-gold-light)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Provincial Perks:</strong>
                  {Object.entries(reg.perks).map(([k, v]) => (
                    <span key={k}>• {k}: {String(v)}</span>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  {isCurrent ? (
                    <Button variant="secondary" size="sm" fullWidth disabled>
                      Current Province
                    </Button>
                  ) : isUnlocked ? (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => dispatch({ type: 'SWITCH_REGION', regionId: reg.id })}
                    >
                      Relocate Seat
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" fullWidth disabled>
                      Requires Realm Tier {reg.tier}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
