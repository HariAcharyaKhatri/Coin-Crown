import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import buildingsData from '../../data/buildings.json';

export const PopulationScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  let totalHousingCapacity = 0;
  for (const inst of Object.values(gameState.buildings)) {
    const def = buildingsData.find((b) => b.id === inst.defId);
    if (def && def.housingCapacity > 0) {
      totalHousingCapacity += Math.floor(def.housingCapacity * (inst.condition / 100));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Panel title="Realm Demographics & Census" subtitle="Citizenry population, housing limits, and social mobility">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <NumberDisplay value={gameState.population.current} label="Current Citizens" icon="👥" size="xl" />
          <NumberDisplay value={totalHousingCapacity} label="Housing Capacity" icon="🏘️" size="lg" />
          <NumberDisplay value={gameState.population.employed} label="Employed Workers" icon="🔨" size="lg" />
          <NumberDisplay value={gameState.population.homeless} label="Homeless Drift" icon="⛺" size="lg" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <ProgressBar
            value={gameState.population.current}
            max={totalHousingCapacity}
            label={`Occupancy: ${Math.round(gameState.population.current)} / ${totalHousingCapacity}`}
            color="var(--color-gold)"
          />
        </div>

        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <h4 style={{ color: 'var(--color-gold-light)', marginBottom: '8px' }}>Demographic Dynamics</h4>
          <p>• Citizens naturally migrate toward your realm when housing and high satisfaction (&gt;70%) are maintained.</p>
          <p>• If public satisfaction drops below 30%, severe emigration ensues (-5% population per minute).</p>
        </div>
      </Panel>
    </div>
  );
};
