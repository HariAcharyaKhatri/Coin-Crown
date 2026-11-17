import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { NumberDisplay } from '../components/NumberDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { formatCoins } from '../../utils/formatters';
import { AudioManager } from '../../audio/AudioManager';

export const TreasuryScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const canCollect = gameState.treasury.balance > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Panel title="The Royal Treasury Chamber" subtitle="Sovereign reserves, tithing vaults, and provincial tax ledgers">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <NumberDisplay value={gameState.treasury.balance} label="Accumulated Taxes" icon="💰" size="xl" />
          <NumberDisplay value={gameState.treasury.cap} label="Vault Capacity" icon="🏛️" size="lg" />
          <NumberDisplay value={gameState.treasury.lifetimeTaxCollected} label="Lifetime Tax Yield" icon="📜" size="lg" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <ProgressBar
            value={gameState.treasury.balance}
            max={gameState.treasury.cap}
            label={`Treasury Vault Fullness: ${formatCoins(gameState.treasury.balance)} / ${formatCoins(gameState.treasury.cap)}`}
            color="var(--color-gold)"
            height={12}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="primary"
            size="lg"
            disabled={!canCollect}
            onClick={() => {
              dispatch({ type: 'COLLECT_TAX' });
              AudioManager.playFanfare();
            }}
          >
            Collect Tax Revenues ({formatCoins(gameState.treasury.balance)})
          </Button>
        </div>
      </Panel>
    </div>
  );
};
