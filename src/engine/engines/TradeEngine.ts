import { GameState, StatePatch, TradeRoute, MarketEvent } from '../types/state';
import { calculateMarketPrice, revertSupplyDemand } from '../formulas/market';
import itemsData from '../../data/items.json';
import regionsData from '../../data/regions.json';

export class TradeEngine {
  private tickCounter = 0;

  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      this.tickCounter++;
      const deltaSec = deltaMs / 1000;
      let revenueGranted = 0;

      // Update trade routes
      const updatedRoutes: TradeRoute[] = [];
      for (const route of state.trade.routes) {
        if (!route.active) continue;
        const newElapsed = route.elapsedSeconds + deltaSec;
        if (newElapsed >= route.durationSeconds) {
          // Completed route run
          revenueGranted += route.profitPerRun;
          updatedRoutes.push({
            ...route,
            elapsedSeconds: 0,
          });
        } else {
          updatedRoutes.push({
            ...route,
            elapsedSeconds: newElapsed,
          });
        }
      }

      // Check expiring market events
      const now = Date.now();
      const activeEvents: MarketEvent[] = state.trade.activeEvents.filter(
        (e) => e.expiresAt > now
      );

      // Mean reversion every 60 ticks (1 minute)
      const shouldRevert = this.tickCounter % 60 === 0;
      const updatedPrices = { ...state.trade.marketPrices };

      for (const item of itemsData) {
        let priceData = updatedPrices[item.id];
        if (!priceData) {
          // Initialize if missing
          const eq = item.baseValue * 10;
          priceData = {
            supply: eq,
            demand: eq,
            equilibriumSupply: eq,
            equilibriumDemand: eq,
            currentPrice: item.baseValue,
          };
        }

        let newSupply = priceData.supply;
        let newDemand = priceData.demand;

        if (shouldRevert) {
          newSupply = revertSupplyDemand(priceData.supply, priceData.equilibriumSupply, 0.02);
          newDemand = revertSupplyDemand(priceData.demand, priceData.equilibriumDemand, 0.02);
        }

        // Active event multiplier
        let eventMult = 1.0;
        for (const evt of activeEvents) {
          if (evt.affectedItems.includes(item.id)) {
            eventMult *= evt.multiplier;
          }
        }

        // Region bonus
        const currentRegion = regionsData.find((r) => r.id === state.currentRegionId);
        const regionMult =
          item.category === 'luxury' ? currentRegion?.perks.luxurySaleMult ?? 1.0 : 1.0;

        const price = calculateMarketPrice(
          item.baseValue,
          newSupply,
          newDemand,
          eventMult,
          regionMult
        );

        updatedPrices[item.id] = {
          ...priceData,
          supply: Math.round(newSupply * 100) / 100,
          demand: Math.round(newDemand * 100) / 100,
          currentPrice: Math.round(price * 100) / 100,
        };
      }

      return (prevState: GameState) => ({
        coins: prevState.coins + revenueGranted,
        lifetimeCoins: prevState.lifetimeCoins + revenueGranted,
        trade: {
          ...prevState.trade,
          routes: updatedRoutes,
          totalRevenue: prevState.trade.totalRevenue + revenueGranted,
          marketPrices: updatedPrices,
          activeEvents,
        },
      });
    } catch (err) {
      console.error('[TradeEngine] Error during tick:', err);
      return null;
    }
  }
}
