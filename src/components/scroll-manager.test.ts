import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrollManager } from './scroll-manager';

// Mock ResizeObserver
const disconnectFn = vi.fn();
vi.stubGlobal('ResizeObserver', class {
  constructor(_cb: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() { disconnectFn(); }
});

describe('ScrollManager', () => {
  let container: HTMLElement;
  let content: HTMLElement;
  let sm: ScrollManager;

  beforeEach(() => {
    container = document.createElement('div');
    content = document.createElement('div');
    container.appendChild(content);

    // Set up scrollable dimensions
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true, writable: true });

    sm = new ScrollManager(container, content);
  });

  describe('scrollToBottom', () => {
    it('scrolls container to bottom when enabled', () => {
      sm.scrollToBottom();
      expect(container.scrollTop).toBe(1000);
    });

    it('does not scroll when disabled', () => {
      sm.disable();
      container.scrollTop = 100;
      sm.scrollToBottom();
      expect(container.scrollTop).toBe(100);
    });
  });

  describe('disable / enable', () => {
    it('disable prevents scrolling', () => {
      sm.disable();
      expect(sm.isEnabled()).toBe(false);
    });

    it('enable re-enables scrolling', () => {
      sm.disable();
      sm.enable();
      expect(sm.isEnabled()).toBe(true);
    });
  });

  describe('isEnabled', () => {
    it('returns true by default', () => {
      expect(sm.isEnabled()).toBe(true);
    });

    it('returns false after disable', () => {
      sm.disable();
      expect(sm.isEnabled()).toBe(false);
    });
  });

  describe('scrollToElement', () => {
    it('calls scrollIntoView on the element', () => {
      const el = document.createElement('div');
      el.scrollIntoView = vi.fn();
      sm.scrollToElement(el);
      expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    });
  });

  describe('destroy', () => {
    it('disconnects the ResizeObserver', () => {
      disconnectFn.mockClear();
      sm.destroy();
      expect(disconnectFn).toHaveBeenCalled();
    });

    it('removes the scroll event listener', () => {
      const removeListenerSpy = vi.spyOn(container, 'removeEventListener');
      sm.destroy();
      expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});
