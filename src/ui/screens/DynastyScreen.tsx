import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { PrestigeEngine } from '../../engine/engines/PrestigeEngine';
import { getLegacyRankCost, MAX_LEGACY_RANK } from '../../engine/formulas/progression';
import { AudioManager } from '../../audio/AudioManager';
import prestigeNodesData from '../../data/prestige_nodes.json';

export const DynastyScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const canPrestige = PrestigeEngine.canPrestige(gameState);
  const sealsToGrant = PrestigeEngine.getSealsToGrant(gameState.lifetimeCoins);

  const branches = [
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'industry', name: 'Industry' },
    { id: 'mining', name: 'Mining' },
    { id: 'commerce', name: 'Commerce' },
    { id: 'governance', name: 'Governance' },
    { id: 'dynasty', name: 'Dynasty' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="The Eternal Dynasty & Legacy Tree" subtitle="Dynasty seals, legacy perks, and realm rebirth">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <NumberDisplay value={gameState.prestige.dynastySeals} label="Available Dynasty Seals" icon="💠" size="xl" />
          <NumberDisplay value={gameState.prestige.lifetimeSeals} label="Lifetime Seals Earned" icon="💎" size="lg" />
          <NumberDisplay value={gameState.prestige.prestigeCount} label="Dynasties Reborn" icon="🔄" size="lg" />
          <NumberDisplay value={sealsToGrant} label="Seals on Next Rebirth" icon="⚡" size="lg" />
        </div>

        {/* Prestige Rebirth Trigger */}
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '2px solid var(--color-gold)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ color: 'var(--color-gold)' }}>Rebirth of the Dynasty</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Pass your realm to the next sovereign heir. Reset standard holdings, coins, and inventories in exchange for permanent Dynasty Seals. Unlocked at Tier 8 Lordship (10,000,000+ lifetime coins).
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              disabled={!canPrestige}
              onClick={() => {
                dispatch({ type: 'PRESTIGE' });
                AudioManager.playFanfare();
              }}
            >
              Rebirth Dynasty (+{sealsToGrant} Dynasty Seals)
            </Button>
            {!canPrestige && (
              <span style={{ fontSize: '13px', color: 'var(--color-accent-red)' }}>
                Requires Realm Tier 8 and 10,000,000+ Lifetime Coins
              </span>
            )}
          </div>
        </div>

        {/* 60-Rank Legacy Tree */}
        <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px' }}>The 60-Rank Legacy Tree</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {branches.map((b) => {
            const nodes = prestigeNodesData.filter((n) => n.branch === b.id);
            return (
              <div
                key={b.id}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <h4 style={{ textTransform: 'uppercase', color: 'var(--color-gold-light)', marginBottom: '12px' }}>
                  Branch: {b.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {nodes.map((node) => {
                    const currentRank = gameState.prestige.legacyTree[node.id] ?? 0;
                    const nextCost = getLegacyRankCost(currentRank);
                    const canAfford = nextCost !== null && gameState.prestige.dynastySeals >= nextCost;

                    return (
                      <div
                        key={node.id}
                        style={{
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>{node.name}</span>
                          <span style={{ color: 'var(--color-gold)' }}>
                            Rank {currentRank} / {MAX_LEGACY_RANK}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          {node.description}
                        </p>
                        <ProgressBar
                          value={currentRank}
                          max={MAX_LEGACY_RANK}
                          color="var(--color-gold)"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!canAfford || currentRank >= MAX_LEGACY_RANK}
                          onClick={() => {
                            dispatch({ type: 'UPGRADE_LEGACY', nodeId: node.id });
                            AudioManager.playCoin();
                          }}
                          style={{ marginTop: 'auto' }}
                        >
                          {currentRank >= MAX_LEGACY_RANK
                            ? 'Maxed Rank'
                            : `Upgrade Rank (+1) for ${nextCost} Seals`}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
