import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { formatCoins } from '../../utils/formatters';
import { calculateUpgradeCost, calculateDemolitionRefund } from '../../engine/formulas/production';
import { AudioManager } from '../../audio/AudioManager';
import buildingsData from '../../data/buildings.json';

export const BuildingDetailScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);
  const selectedBuildingId = useUIStore((s) => s.selectedBuildingInstanceId);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);

  const inst = selectedBuildingId ? gameState.buildings[selectedBuildingId] : null;
  const def = inst ? buildingsData.find((b) => b.id === inst.defId) : null;

  if (!inst || !def) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <Panel title="No Building Selected">
          <p>Please select a building from your Dashboard or Buildings Catalogue.</p>
          <Button variant="primary" onClick={() => setActiveScreen('dashboard')}>
            Back to Dashboard
          </Button>
        </Panel>
      </div>
    );
  }

  const upgradeCost = calculateUpgradeCost(def.purchaseCost, inst.level + 1);
  const canAffordUpgrade = gameState.coins >= upgradeCost && inst.level < 25;
  const refundAmount = calculateDemolitionRefund(def.purchaseCost);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Panel
        title={def.name}
        subtitle={`${def.category.toUpperCase()} • Level ${inst.level}`}
        headerAction={
          <Button variant="secondary" size="sm" onClick={() => setActiveScreen('dashboard')}>
            Back
          </Button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay value={inst.level} label="Level" icon="⭐" size="lg" />
          <NumberDisplay value={inst.condition} label="Structural Integrity" icon="🛡️" size="lg" />
          <NumberDisplay value={def.workerSlots} label="Worker Capacity" icon="👷" size="lg" />
          <NumberDisplay value={def.baseIncomePerMinute} label="Base Income / min" icon="🪙" size="lg" />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <ProgressBar
            value={inst.condition}
            max={100}
            label={`Building Condition: ${Math.round(inst.condition)}%`}
            color={inst.condition > 50 ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}
          />
        </div>

        {/* Worker Management */}
        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px' }}>
            Assigned Workers ({inst.assignedWorkerIds.length} / {def.workerSlots})
          </h4>
          {inst.assignedWorkerIds.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No workers assigned.</p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {inst.assignedWorkerIds.map((wId) => {
                const w = gameState.workers[wId];
                return (
                  <div
                    key={wId}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span>{w?.name ?? wId} (Skill {w?.skill ?? 1})</span>
                    <button
                      onClick={() => dispatch({ type: 'UNASSIGN_WORKER', workerId: wId })}
                      style={{ color: 'var(--color-accent-red)', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {inst.assignedWorkerIds.length < def.workerSlots && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveScreen('workers')}
            >
              + Manage & Assign Workers
            </Button>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            disabled={!canAffordUpgrade}
            onClick={() => {
              dispatch({ type: 'UPGRADE', instanceId: inst.instanceId });
              AudioManager.playBuild();
            }}
          >
            Upgrade to Lvl {inst.level + 1} ({formatCoins(upgradeCost)})
          </Button>

          {inst.condition < 100 && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => dispatch({ type: 'REPAIR_BUILDING', instanceId: inst.instanceId })}
            >
              Repair Structure
            </Button>
          )}

          <Button
            variant="danger"
            size="md"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              dispatch({ type: 'DEMOLISH', instanceId: inst.instanceId });
              setActiveScreen('dashboard');
            }}
          >
            Demolish (Refund {formatCoins(refundAmount)})
          </Button>
        </div>
      </Panel>
    </div>
  );
};
