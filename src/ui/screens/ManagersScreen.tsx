import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { formatCoins } from '../../utils/formatters';
import managersData from '../../data/managers.json';

export const ManagersScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const managerList = Object.values(gameState.managers);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Noble Stewards & Overseers" subtitle="Hire specialized managers to oversee your enterprise">
        {/* Hire Section */}
        <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Available Overseers</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {managersData.map((mDef) => {
            const alreadyHired = managerList.some((m) => m.specialty === mDef.specialty);
            const canAfford = gameState.coins >= mDef.hireCost;

            return (
              <div
                key={mDef.id}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{mDef.name}</span>
                  <span style={{ color: 'var(--color-text-main)' }}>{formatCoins(mDef.hireCost)}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>
                  Specialty: {mDef.specialty}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {mDef.description}
                </p>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={alreadyHired || !canAfford}
                  onClick={() => dispatch({ type: 'HIRE_MANAGER', specialty: mDef.specialty, name: mDef.name })}
                  style={{ marginTop: 'auto' }}
                >
                  {alreadyHired ? 'Already in Service' : 'Appoint Overseer'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Existing Managers */}
        <h4 style={{ color: 'var(--color-gold-light)', marginBottom: '12px' }}>Appointed Managers</h4>
        {managerList.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No managers appointed yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {managerList.map((mgr) => {
              const upgradeCost = 1000 * Math.pow(2, mgr.tier);
              const canAfford = gameState.coins >= upgradeCost;

              return (
                <div
                  key={mgr.id}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{mgr.name}</span>
                    <span style={{ color: 'var(--color-gold)' }}>Tier {mgr.tier}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Specialty: {mgr.specialty} | Assigned: {mgr.assignedBuildingInstanceId ? 'Active' : 'Unassigned'}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => dispatch({ type: 'UPGRADE_MANAGER', managerId: mgr.id })}
                  >
                    Promote Tier ({formatCoins(upgradeCost)})
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};
