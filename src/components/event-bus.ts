/**
 * Typed EventBus — DIP extraction for component communication.
 * Replaces direct DOM coupling between components with a publish/subscribe pattern.
 */

export interface AppEvents {
  'file:loaded': { messageCount: number; model: string; branch: string };
  'playback:play': void;
  'playback:pause': void;
  'playback:step': void;
  'playback:seek': { index: number };
  'playback:speed-change': { speed: number };
  'playback:complete': void;
  'playback:progress': { current: number; total: number };
  'ui:new-file': void;
  'status:update': { state: string; text: string };
}

type EventCallback<T> = (data: T) => void;

export class EventBus {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  on<K extends keyof AppEvents>(event: K, callback: EventCallback<AppEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const cb = callback as EventCallback<unknown>;
    this.listeners.get(event)!.add(cb);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  emit<K extends keyof AppEvents>(event: K, data: AppEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data);
      }
    }
  }

  off<K extends keyof AppEvents>(event: K): void {
    this.listeners.delete(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}
