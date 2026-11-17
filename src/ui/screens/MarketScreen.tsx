import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { formatCoins, formatNumber } from '../../utils/formatters';
import itemsData from '../../data/items.json';

export const MarketScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [tradeAmount, setTradeAmount] = useState<number>(10);

  const tabs = [
    { id: 'all', label: 'All Commodities' },
    { id: 'raw', label: 'Raw Resources' },
    { id: 'processed', label: 'Processed Goods' },
    { id: 'luxury', label: 'Luxury & Rare' },
  ];

  const filteredItems = itemsData.filter((i) => {
    if (activeTab === 'all') return true;
    return i.category === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Panel title="Grand Market Exchange" subtitle="Dynamic supply and demand driven commodity exchange">
        {/* Active Market Events */}
        {gameState.trade.activeEvents.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {gameState.trade.activeEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  background: 'rgba(229, 178, 76, 0.15)',
                  border: '1px solid var(--color-gold)',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'var(--color-gold-light)',
                }}
              >
                📢 <strong>{evt.name}</strong> ({evt.multiplier}x price on affected goods)
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
            <span>Batch Size:</span>
            {[1, 10, 50, 100].map((amt) => (
              <Button
                key={amt}
                variant={tradeAmount === amt ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTradeAmount(amt)}
              >
                {amt}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredItems.map((item) => {
            const priceData = gameState.trade.marketPrices[item.id];
            const currentPrice = priceData?.currentPrice ?? item.baseValue;
            const supply = priceData?.supply ?? item.baseValue * 10;
            const demand = priceData?.demand ?? item.baseValue * 10;
            const ownedQty = gameState.inventory[item.id] ?? 0;
            const totalBuyCost = currentPrice * tradeAmount;
            const canAfford = gameState.coins >= totalBuyCost;
            const canSell = ownedQty >= tradeAmount;

            return (
              <div
                key={item.id}
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
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{formatCoins(currentPrice)}</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Supply: {formatNumber(supply)} | Demand: {formatNumber(demand)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                  In Storage: {formatNumber(ownedQty)}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={!canAfford}
                    onClick={() => dispatch({ type: 'BUY_ITEM', itemId: item.id, quantity: tradeAmount })}
                  >
                    Buy {tradeAmount} ({formatCoins(totalBuyCost)})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled={!canSell}
                    onClick={() => dispatch({ type: 'SELL_ITEM', itemId: item.id, quantity: tradeAmount })}
                  >
                    Sell {tradeAmount}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
