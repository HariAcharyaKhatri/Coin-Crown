import { GameEvent, GameEventType } from '../types/events';

type EventHandler<T = any> = (event: GameEvent<T>) => void;

class EventBusClass {
  private handlers = new Map<GameEventType, Set<EventHandler>>();

  public on<T = any>(type: GameEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const set = this.handlers.get(type)!;
    set.add(handler as EventHandler);

    return () => {
      set.delete(handler as EventHandler);
    };
  }

  public emit<T = any>(type: GameEventType, payload: T): void {
    const event: GameEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const listeners = this.handlers.get(type);
    if (listeners) {
      listeners.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event ${type}:`, err);
        }
      });
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}

export const EventBus = new EventBusClass();
