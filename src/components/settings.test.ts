import { describe, it, expect, beforeEach } from 'vitest';
import { Settings } from './settings';

function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

describe('Settings', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  describe('defaults', () => {
    it('autoPlayOnLoad defaults to false', () => {
      const settings = new Settings(storage);
      expect(settings.autoPlayOnLoad).toBe(false);
    });
  });

  describe('persistence', () => {
    it('writes autoPlayOnLoad to localStorage on change', () => {
      const settings = new Settings(storage);
      settings.autoPlayOnLoad = true;

      const stored = JSON.parse(storage.getItem('claude-replay-settings')!);
      expect(stored.autoPlayOnLoad).toBe(true);
    });

    it('reads autoPlayOnLoad from localStorage on init', () => {
      storage.setItem('claude-replay-settings', JSON.stringify({ autoPlayOnLoad: true }));
      const settings = new Settings(storage);
      expect(settings.autoPlayOnLoad).toBe(true);
    });

    it('persists false value correctly', () => {
      const settings = new Settings(storage);
      settings.autoPlayOnLoad = true;
      settings.autoPlayOnLoad = false;

      const stored = JSON.parse(storage.getItem('claude-replay-settings')!);
      expect(stored.autoPlayOnLoad).toBe(false);
    });

    it('survives corrupted localStorage data', () => {
      storage.setItem('claude-replay-settings', 'not-json');
      const settings = new Settings(storage);
      expect(settings.autoPlayOnLoad).toBe(false);
    });

    it('uses defaults when localStorage has wrong types', () => {
      storage.setItem('claude-replay-settings', JSON.stringify({ autoPlayOnLoad: 'yes' }));
      const settings = new Settings(storage);
      expect(settings.autoPlayOnLoad).toBe(false);
    });

    it('uses defaults when localStorage is empty', () => {
      const settings = new Settings(storage);
      expect(settings.autoPlayOnLoad).toBe(false);
      expect(storage.getItem('claude-replay-settings')).toBeNull();
    });

    it('value persists across Settings instances', () => {
      const s1 = new Settings(storage);
      s1.autoPlayOnLoad = true;

      const s2 = new Settings(storage);
      expect(s2.autoPlayOnLoad).toBe(true);
    });
  });
});
