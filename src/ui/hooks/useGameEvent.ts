import { useEffect } from 'react';
import { EventBus } from '../../engine/events/EventBus';
import { GameEventType, GameEvent } from '../../engine/types/events';

export function useGameEvent<T = any>(type: GameEventType, handler: (event: GameEvent<T>) => void) {
  useEffect(() => {
    return EventBus.on(type, handler);
  }, [type, handler]);
}
