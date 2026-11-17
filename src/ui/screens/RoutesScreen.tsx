import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { NumberDisplay } from '../components/NumberDisplay';
import { formatCoins } from '../../utils/formatters';
import regionsData from '../../data/regions.json';
import itemsData from '../../data/items.json';

export const RoutesScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const dispatch = useGameStore((s) => s.dispatch);

  const [destRegion, setDestRegion] = useState(regionsData[1]?.id ?? 'reg.riverford');
  const [selectedItem, setSelectedItem] = useState(itemsData[0]?.id ?? 'item.raw.wheat');

  const maxRoutes = gameState.trade.maxRoutes || 1;
  const canAddRoute = gameState.trade.routes.length < maxRoutes;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Panel title="Caravan Trade Routes" subtitle="Inter-provincial commerce networks">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <NumberDisplay
            value={gameState.trade.routes.length}
            label={`Active Routes (${gameState.trade.routes.length} / ${maxRoutes})`}
            icon="⛵"
            size="lg"
          />
          <NumberDisplay
            value={gameState.trade.totalRevenue}
            label="Cumulative Trade Revenue"
            icon="🪙"
            size="lg"
          />
        </div>

        {/* Dispatch Route Form */}
        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Charter New Trade Route</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Destination</label>
              <select
                value={destRegion}
                onChange={(e) => setDestRegion(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {regionsData.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Trade Cargo</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {itemsData.slice(0, 15).map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!canAddRoute}
            onClick={() => {
              dispatch({
                type: 'ESTABLISH_ROUTE',
                route: {
                  originRegionId: gameState.currentRegionId,
                  destinationRegionId: destRegion,
                  itemId: selectedItem,
                  quantity: 20,
                },
              });
            }}
          >
            Dispatch Caravan
          </Button>
        </div>

        {/* Active Routes */}
        <h4 style={{ color: 'var(--color-gold-light)', marginBottom: '12px' }}>Active Caravans</h4>
        {gameState.trade.routes.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No trade caravans currently on route.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gameState.trade.routes.map((route) => {
              const destName = regionsData.find((r) => r.id === route.destinationRegionId)?.name ?? route.destinationRegionId;
              const itemName = itemsData.find((i) => i.id === route.itemId)?.name ?? route.itemId;

              return (
                <div
                  key={route.id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{itemName} to {destName}</span>
                    <span style={{ color: 'var(--color-accent-green)', fontWeight: 700 }}>
                      +{formatCoins(route.profitPerRun)} / run
                    </span>
                  </div>
                  <ProgressBar
                    value={route.elapsedSeconds}
                    max={route.durationSeconds}
                    label={`Travel: ${Math.round(route.elapsedSeconds)}s / ${route.durationSeconds}s`}
                    color="var(--color-gold)"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => dispatch({ type: 'CANCEL_ROUTE', routeId: route.id })}
                    >
                      Recall Caravan
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
