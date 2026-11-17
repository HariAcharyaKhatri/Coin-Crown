import { useGameStore } from '../../store/gameStore';
import { GameAction } from '../../engine/types/actions';

export function useGameAction() {
  const dispatch = useGameStore((s) => s.dispatch);
  return (action: GameAction) => dispatch(action);
}
