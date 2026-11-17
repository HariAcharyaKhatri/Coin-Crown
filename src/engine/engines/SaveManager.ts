import { GameState } from '../types/state';
import { SaveService } from '../../persistence/SaveService';
import { EventBus } from '../events/EventBus';

export class SaveManager {
  private tickCounter = 0;
  private readonly AUTOSAVE_INTERVAL_TICKS = 30; // 30 seconds

  public async maybeAutosave(state: GameState): Promise<void> {
    this.tickCounter++;
    if (this.tickCounter >= this.AUTOSAVE_INTERVAL_TICKS) {
      this.tickCounter = 0;
      await this.save(state);
    }
  }

  public async save(state: GameState): Promise<void> {
    try {
      await SaveService.save(state);
      EventBus.emit('SAVE_COMPLETED', { timestamp: Date.now() });
    } catch (err) {
      console.error('[SaveManager] Failed to autosave state:', err);
      EventBus.emit('ERROR_OCCURRED', { context: 'SaveManager.save', error: err });
    }
  }

  public resetCounter(): void {
    this.tickCounter = 0;
  }
}
