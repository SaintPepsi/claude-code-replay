import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from './event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on and emit', () => {
    it('calls the listener when the event is emitted', () => {
      const listener = vi.fn();
      bus.on('playback:play', listener);

      bus.emit('playback:play', undefined as void);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('passes event data to the listener', () => {
      const listener = vi.fn();
      bus.on('playback:progress', listener);

      bus.emit('playback:progress', { current: 5, total: 10 });
      expect(listener).toHaveBeenCalledWith({ current: 5, total: 10 });
    });

    it('supports multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      bus.on('playback:pause', listener1);
      bus.on('playback:pause', listener2);

      bus.emit('playback:pause', undefined as void);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('does not call listeners for different events', () => {
      const listener = vi.fn();
      bus.on('playback:play', listener);

      bus.emit('playback:pause', undefined as void);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe (return value of on)', () => {
    it('removes the specific listener when called', () => {
      const listener = vi.fn();
      const unsub = bus.on('playback:step', listener);

      unsub();
      bus.emit('playback:step', undefined as void);
      expect(listener).not.toHaveBeenCalled();
    });

    it('does not affect other listeners on the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub1 = bus.on('playback:play', listener1);
      bus.on('playback:play', listener2);

      unsub1();
      bus.emit('playback:play', undefined as void);
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('removes all listeners for a specific event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      bus.on('playback:play', listener1);
      bus.on('playback:play', listener2);

      bus.off('playback:play');
      bus.emit('playback:play', undefined as void);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('does not affect listeners on other events', () => {
      const playListener = vi.fn();
      const pauseListener = vi.fn();
      bus.on('playback:play', playListener);
      bus.on('playback:pause', pauseListener);

      bus.off('playback:play');
      bus.emit('playback:pause', undefined as void);

      expect(pauseListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('removes all listeners for all events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      bus.on('playback:play', listener1);
      bus.on('playback:pause', listener2);

      bus.clear();

      bus.emit('playback:play', undefined as void);
      bus.emit('playback:pause', undefined as void);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('emit with no listeners', () => {
    it('does not throw when emitting an event with no listeners', () => {
      expect(() => bus.emit('playback:complete', undefined as void)).not.toThrow();
    });
  });
});
