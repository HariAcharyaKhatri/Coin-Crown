import { GameState, StatePatch } from '../types/state';
import { SEASON_LENGTH_MS, SEASONS, Season } from '../constants';
import { EventBus } from '../events/EventBus';

export class FarmingEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      let progress = state.season.seasonProgressMs + deltaMs;
      let seasonIndex = SEASONS.indexOf(state.season.currentSeason);
      let seasonsElapsed = state.season.totalSeasonsElapsed;
      let newSeason = state.season.currentSeason;

      if (progress >= SEASON_LENGTH_MS) {
        progress -= SEASON_LENGTH_MS;
        const prevSeason = newSeason;
        seasonIndex = (seasonIndex + 1) % SEASONS.length;
        newSeason = SEASONS[seasonIndex] as Season;
        seasonsElapsed += 1;

        EventBus.emit('SEASON_CHANGED', {
          previousSeason: prevSeason,
          currentSeason: newSeason,
        });
      }

      return () => ({
        season: {
          currentSeason: newSeason,
          seasonProgressMs: progress,
          totalSeasonsElapsed: seasonsElapsed,
        },
      });
    } catch (err) {
      console.error('[FarmingEngine] Error during tick:', err);
      return null;
    }
  }
}
