import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnimationEngine } from './animation-engine';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let textSpan: HTMLSpanElement;

  beforeEach(() => {
    engine = new AnimationEngine();
    textSpan = document.createElement('span');
  });

  describe('typeText', () => {
    it('returns true when animation completes without cancellation', async () => {
      const result = await engine.typeText(textSpan, 'hi', 16, () => false);
      expect(result).toBe(true);
      expect(textSpan.textContent).toBe('hi');
    });

    it('populates text content character by character', async () => {
      await engine.typeText(textSpan, 'hello', 16, () => false);
      expect(textSpan.textContent).toBe('hello');
    });

    it('returns false when cancelled during animation', async () => {
      let callCount = 0;
      const cancelled = () => {
        callCount++;
        return callCount > 1;
      };
      const result = await engine.typeText(textSpan, 'a long text that takes time', 1, cancelled);
      expect(result).toBe(false);
    });

    it('sets full text immediately when cancelled mid-animation', async () => {
      const text = 'complete text here';
      let callCount = 0;
      await engine.typeText(textSpan, text, 1, () => {
        callCount++;
        return callCount > 2;
      });
      expect(textSpan.textContent).toBe(text);
    });

    it('removes cursor element after completion', async () => {
      await engine.typeText(textSpan, 'test', 16, () => false);
      const cursor = textSpan.querySelector('.typing-cursor');
      expect(cursor).toBeNull();
    });

    it('adds and then removes typing cursor during animation', async () => {
      let cursorSeen = false;
      const onFrame = () => {
        if (textSpan.querySelector('.typing-cursor')) {
          cursorSeen = true;
        }
      };
      await engine.typeText(textSpan, 'ab', 16, () => false, onFrame);
      expect(cursorSeen).toBe(true);
      expect(textSpan.querySelector('.typing-cursor')).toBeNull();
    });

    it('calls onFrame callback during typing', async () => {
      const onFrame = vi.fn();
      await engine.typeText(textSpan, 'abc', 16, () => false, onFrame);
      expect(onFrame).toHaveBeenCalled();
    });

    it('handles empty text', async () => {
      const result = await engine.typeText(textSpan, '', 16, () => false);
      expect(result).toBe(true);
    });
  });

  describe('reduced motion', () => {
    it('sets text immediately when reduced motion is preferred', async () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      Object.defineProperty(window, 'matchMedia', { value: matchMedia, writable: true });

      const rmEngine = new AnimationEngine();
      const span = document.createElement('span');
      const result = await rmEngine.typeText(span, 'instant', 1, () => false);

      expect(result).toBe(true);
      expect(span.textContent).toBe('instant');

      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue({ matches: false }),
        writable: true,
      });
    });

    it('calls onFrame once with reduced motion', async () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      Object.defineProperty(window, 'matchMedia', { value: matchMedia, writable: true });

      const rmEngine = new AnimationEngine();
      const span = document.createElement('span');
      const onFrame = vi.fn();
      await rmEngine.typeText(span, 'test', 1, () => false, onFrame);
      expect(onFrame).toHaveBeenCalledTimes(1);

      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue({ matches: false }),
        writable: true,
      });
    });

    it('returns false when cancelled with reduced motion', async () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      Object.defineProperty(window, 'matchMedia', { value: matchMedia, writable: true });

      const rmEngine = new AnimationEngine();
      const span = document.createElement('span');
      const result = await rmEngine.typeText(span, 'test', 1, () => true);
      expect(result).toBe(false);

      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue({ matches: false }),
        writable: true,
      });
    });
  });
});
