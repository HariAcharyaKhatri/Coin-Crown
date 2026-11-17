import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { NumberDisplay } from '../components/NumberDisplay';

export const UniversityScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  const universityCount = Object.values(gameState.buildings).filter(
    (b) => b.defId === 'bld.roy.university'
  ).length;

  const scholarCount = Object.values(gameState.workers).filter(
    (w) => w.profession === 'scholar'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Panel title="The University of Eldoria" subtitle="Higher scholarship, scientific arts, and architectural advances">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <NumberDisplay value={universityCount} label="Colleges Founded" icon="🏛️" size="lg" />
          <NumberDisplay value={scholarCount} label="Eminent Scholars" icon="🎓" size="lg" />
          <NumberDisplay value={universityCount * 5} label="Upgrade Cost Discount %" icon="📐" size="lg" />
        </div>

        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px' }}>Scholarly Advancements</h4>
          <p>• Each University in your domain permanently lowers building upgrade costs by 5%.</p>
          <p>• The presence of scholars inspires the populace, granting +4 satisfaction per college.</p>
        </div>
      </Panel>
    </div>
  );
};
