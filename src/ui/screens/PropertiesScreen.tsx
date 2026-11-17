import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import buildingsData from '../../data/buildings.json';

export const PropertiesScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const resBuildings = Object.values(gameState.buildings).filter((inst) => {
    const def = buildingsData.find((b) => b.id === inst.defId);
    return def && def.category === 'residential';
  });

  let totalRentPerMin = 0;
  for (const inst of resBuildings) {
    const def = buildingsData.find((b) => b.id === inst.defId);
    if (def && def.baseIncomePerMinute > 0) {
      totalRentPerMin += def.baseIncomePerMinute * Math.pow(1.45, inst.level - 1) * (0.4 + 0.6 * (inst.condition / 100));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Residential Estates & Tenant Rents" subtitle="Housing portfolio condition and tenant yields">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay value={resBuildings.length} label="Residential Properties" icon="🏡" size="lg" />
          <NumberDisplay value={totalRentPerMin} label="Gross Rent / min" icon="🪙" size="lg" />
          <NumberDisplay value={gameState.population.homeless} label="Homeless Peasants" icon="⛺" size="lg" />
        </div>

        {resBuildings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No residential holdings constructed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {resBuildings.map((inst) => {
              const def = buildingsData.find((b) => b.id === inst.defId);
              if (!def) return null;

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
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{def.name}</span>
                    <span style={{ fontSize: '12px' }}>Lvl {inst.level}</span>
                  </div>

                  <ProgressBar
                    value={inst.condition}
                    max={100}
                    label={`Condition: ${Math.round(inst.condition)}%`}
                    color={inst.condition > 50 ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}
                  />

                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Capacity: +{def.housingCapacity} residents | Rent: {def.baseIncomePerMinute} coins/min
                  </div>

                  {inst.condition < 100 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => dispatch({ type: 'REPAIR_BUILDING', instanceId: inst.instanceId })}
                      style={{ marginTop: 'auto' }}
                    >
                      Renovate & Repair
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};
