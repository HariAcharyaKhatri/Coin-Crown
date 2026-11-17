import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { formatCoins, formatNumber } from '../../utils/formatters';
import { selectNetIncomePerMinute } from '../../store/selectors';
import { calculateClickPower, calculateUpgradeCost } from '../../engine/formulas/production';
import { AudioManager } from '../../audio/AudioManager';
import { HapticsManager } from '../../audio/HapticsManager';
import buildingsData from '../../data/buildings.json';
import balanceData from '../../data/balance.json';

export const DashboardScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);
  const setSelectedBuilding = useUIStore((s) => s.setSelectedBuilding);

  const netIncome = selectNetIncomePerMinute(gameState);
  const clickPower = calculateClickPower(gameState.playerLevel);

  const handleTapCollect = () => {
    dispatch({ type: 'CLICK_COLLECT' });
    AudioManager.playCoin();
    HapticsManager.tap();
  };

  const nextTier = gameState.realmTier + 1;
  const nextTierThreshold = (balanceData.tierThresholds as any)[nextTier] ?? 1000;
  const currentTierFloor = (balanceData.tierThresholds as any)[gameState.realmTier] ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner & Main Tap Button */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <Panel title="Estate Manor Sovereign" subtitle="Direct estate levy">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleTapCollect}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                fontSize: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <span style={{ fontSize: '48px' }}>🪙</span>
              <span>Tap Collect</span>
              <span style={{ fontSize: '13px', opacity: 0.85 }}>+{formatNumber(clickPower)} coin</span>
            </Button>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Lifetime Taps: {formatNumber(gameState.stats.clickCollectCount)}
            </p>
          </div>
        </Panel>

        <Panel title="Economic Ledger" subtitle="Current cashflow and reserves">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <NumberDisplay value={gameState.coins} label="Liquid Coin" icon="🪙" size="lg" />
            <NumberDisplay value={gameState.vault} label="Vault Reserves" icon="🏦" size="lg" />
            <NumberDisplay
              value={netIncome.netIncomePerMin}
              label="Net Cashflow / min"
              icon="📈"
              size="lg"
              trend={netIncome.netIncomePerMin >= 0 ? 'up' : 'down'}
            />
            <NumberDisplay value={gameState.population.current} label="Population" icon="👥" size="lg" />
          </div>

          <div style={{ marginTop: '20px' }}>
            <ProgressBar
              value={gameState.lifetimeCoins - currentTierFloor}
              max={nextTierThreshold - currentTierFloor}
              label={`Realm Tier ${gameState.realmTier} Progress (Next: ${formatCoins(nextTierThreshold)})`}
            />
          </div>
        </Panel>
      </div>

      {/* Buildings Overview */}
      <Panel
        title="Constructed Holdings"
        subtitle={`${Object.keys(gameState.buildings).length} total estates active`}
        headerAction={
          <Button variant="secondary" size="sm" onClick={() => setActiveScreen('buildings')}>
            Open Catalogue
          </Button>
        }
      >
        {Object.keys(gameState.buildings).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>You have no holdings erected yet.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' });
                AudioManager.playBuild();
              }}
            >
              Build First Wheat Field (50 🪙)
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {Object.values(gameState.buildings).map((inst) => {
              const def = buildingsData.find((b) => b.id === inst.defId);
              if (!def) return null;
              const upgradeCost = calculateUpgradeCost(def.purchaseCost, inst.level + 1);
              const canAfford = gameState.coins >= upgradeCost;

              return (
                <div
                  key={inst.instanceId}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{def.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Lvl {inst.level}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Condition: {Math.round(inst.condition)}% | Workers: {inst.assignedWorkerIds.length}/{def.workerSlots}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      disabled={!canAfford}
                      onClick={() => {
                        dispatch({ type: 'UPGRADE', instanceId: inst.instanceId });
                        AudioManager.playBuild();
                      }}
                    >
                      Upgrade ({formatNumber(upgradeCost)} 🪙)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedBuilding(inst.instanceId);
                        setActiveScreen('building_detail');
                      }}
                    >
                      Inspect
                    </Button>
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
