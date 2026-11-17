import { useGameStore } from '../../store/gameStore';
import { GameState } from '../../engine/types/state';

export function useGameState<T>(selector: (state: GameState) => T): T {
  return useGameStore((s) => selector(s.gameState));
}
