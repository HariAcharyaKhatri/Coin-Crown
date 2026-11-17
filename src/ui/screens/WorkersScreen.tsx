import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { NumberDisplay } from '../components/NumberDisplay';
import { formatCoins } from '../../utils/formatters';
import workersData from '../../data/workers.json';
import buildingsData from '../../data/buildings.json';

export const WorkersScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');

  const workerList = Object.values(gameState.workers);
  const buildingsWithSlots = Object.values(gameState.buildings).filter((inst) => {
    const def = buildingsData.find((b) => b.id === inst.defId);
    return def && def.workerSlots > inst.assignedWorkerIds.length;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Guild of Laborers & Artisans" subtitle="Hire and assign specialized professions">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay value={workerList.length} label="Total Workforce" icon="👷" size="lg" />
          <NumberDisplay
            value={workerList.filter((w) => w.assignedBuildingInstanceId).length}
            label="Employed"
            icon="🔨"
            size="lg"
          />
          <NumberDisplay
            value={workerList.filter((w) => !w.assignedBuildingInstanceId).length}
            label="Unassigned"
            icon="⏳"
            size="lg"
          />
        </div>

        {/* Hire Section */}
        <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Recruit Guild Apprentices</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {workersData.map((wDef) => {
            const canAfford = gameState.coins >= wDef.hireCost;
            return (
              <div
                key={wDef.profession}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{wDef.name}</span>
                  <span style={{ color: 'var(--color-gold)' }}>{formatCoins(wDef.hireCost)}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {wDef.description}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                  Base Wage: {wDef.baseWage} coins/min
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => dispatch({ type: 'HIRE_WORKER', profession: wDef.profession })}
                  style={{ marginTop: 'auto' }}
                >
                  Hire
                </Button>
              </div>
            );
          })}
        </div>

        {/* Existing Workers List */}
        <h4 style={{ color: 'var(--color-gold-light)', marginBottom: '12px' }}>Your Workers ({workerList.length})</h4>
        {workerList.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No workers hired yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {workerList.map((w) => {
              const assignedInst = w.assignedBuildingInstanceId ? gameState.buildings[w.assignedBuildingInstanceId] : null;
              const assignedDef = assignedInst ? buildingsData.find((b) => b.id === assignedInst.defId) : null;

              return (
                <div
                  key={w.id}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{w.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-gold)' }}>Skill {w.skill}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Profession: {w.profession} | Assigned: {assignedDef ? assignedDef.name : 'None'}
                  </div>

                  {w.assignedBuildingInstanceId ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => dispatch({ type: 'UNASSIGN_WORKER', workerId: w.id })}
                    >
                      Unassign
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        style={{ flex: 1, fontSize: '12px' }}
                        value={selectedBuildingId}
                        onChange={(e) => setSelectedBuildingId(e.target.value)}
                      >
                        <option value="">Select Building...</option>
                        {buildingsWithSlots.map((b) => {
                          const def = buildingsData.find((bd) => bd.id === b.defId);
                          return (
                            <option key={b.instanceId} value={b.instanceId}>
                              {def?.name} (Lvl {b.level})
                            </option>
                          );
                        })}
                      </select>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!selectedBuildingId}
                        onClick={() => {
                          dispatch({ type: 'ASSIGN_WORKER', workerId: w.id, buildingInstanceId: selectedBuildingId });
                          setSelectedBuildingId('');
                        }}
                      >
                        Assign
                      </Button>
                    </div>
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
