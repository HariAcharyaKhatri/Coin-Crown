import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { formatNumber, formatCoins } from '../../utils/formatters';
import { selectStorageUsage } from '../../store/selectors';
import itemsData from '../../data/items.json';

export const InventoryScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);
  const storageUsage = selectStorageUsage(gameState);

  const classes: Array<'bulk' | 'standard' | 'perishable' | 'precious'> = [
    'bulk',
    'standard',
    'perishable',
    'precious',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Royal Granary & Warehouses" subtitle="Stored stockpiles categorized by storage class">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {classes.map((cls) => {
            const usage = storageUsage[cls];
            return (
              <div
                key={cls}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {cls} Class
                </span>
                <ProgressBar
                  value={usage.used}
                  max={usage.max}
                  label={`${formatNumber(usage.used)} / ${formatNumber(usage.max)}`}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {classes.map((cls) => {
            const itemsInClass = itemsData.filter((i) => i.storageClass === cls);
            const ownedInClass = itemsInClass.filter((i) => (gameState.inventory[i.id] ?? 0) > 0);

            if (ownedInClass.length === 0) return null;

            return (
              <div key={cls}>
                <h4 style={{ textTransform: 'capitalize', color: 'var(--color-gold-light)', marginBottom: '8px' }}>
                  {cls} Goods
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {ownedInClass.map((item) => {
                    const qty = gameState.inventory[item.id] ?? 0;
                    const price = gameState.trade.marketPrices[item.id]?.currentPrice ?? item.baseValue;

                    return (
                      <div
                        key={item.id}
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
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          <span style={{ color: 'var(--color-gold)' }}>{formatNumber(qty)}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Market Price: {formatCoins(price)}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={() => dispatch({ type: 'SELL_ITEM', itemId: item.id, quantity: Math.min(10, qty) })}
                          >
                            Sell 10
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => dispatch({ type: 'SELL_ITEM', itemId: item.id, quantity: qty })}
                          >
                            Sell All
                          </Button>
                        </div>
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
