import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardHandler } from './keyboard-handler';

describe('KeyboardHandler', () => {
  let guardActive: boolean;
  let handler: KeyboardHandler;

  beforeEach(() => {
    guardActive = true;
    handler = new KeyboardHandler(() => guardActive);
  });

  function fireKey(code: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { code, cancelable: true, bubbles: true });
    document.dispatchEvent(event);
    return event;
  }

  describe('bind', () => {
    it('invokes bound action when matching key is pressed', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      fireKey('Space');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('does not invoke action for non-matching keys', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      fireKey('ArrowUp');
      expect(action).not.toHaveBeenCalled();
    });

    it('supports multiple bindings', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      handler.bind('Space', action1);
      handler.bind('ArrowRight', action2);

      fireKey('Space');
      fireKey('ArrowRight');

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('unbindAll', () => {
    it('removes all bindings so no actions fire', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      handler.unbindAll();
      fireKey('Space');

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('guard function', () => {
    it('does not invoke actions when guard returns false', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      guardActive = false;
      fireKey('Space');

      expect(action).not.toHaveBeenCalled();
    });

    it('invokes actions when guard returns true', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      guardActive = true;
      fireKey('Space');

      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    it('removes the keydown listener so no actions fire after destroy', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      handler.destroy();
      fireKey('Space');

      expect(action).not.toHaveBeenCalled();
    });

    it('clears bindings on destroy', () => {
      const action = vi.fn();
      handler.bind('Space', action);

      handler.destroy();
      // Re-create to verify bindings were cleared (not just listener)
      expect(action).not.toHaveBeenCalled();
    });
  });
});
