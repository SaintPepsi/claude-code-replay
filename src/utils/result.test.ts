import { describe, it, expect } from 'vitest';
import { ok, err, map, flatMap, mapError, unwrapOr } from './result';

describe('Result utilities', () => {
  describe('ok', () => {
    it('creates a success result', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it('works with string values', () => {
      const result = ok('hello');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe('hello');
    });

    it('works with object values', () => {
      const result = ok({ name: 'test' });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual({ name: 'test' });
    });
  });

  describe('err', () => {
    it('creates an error result', () => {
      const result = err('something went wrong');
      expect(result.ok).toBe(false);
      expect(result).toEqual({ ok: false, error: 'something went wrong' });
    });

    it('works with Error objects', () => {
      const error = new Error('fail');
      const result = err(error);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(error);
    });
  });

  describe('map', () => {
    it('transforms the value of an ok result', () => {
      const result = map(ok(5), (x) => x * 2);
      expect(result).toEqual({ ok: true, value: 10 });
    });

    it('passes through an err result unchanged', () => {
      const result = map(err('bad'), (x: number) => x * 2);
      expect(result).toEqual({ ok: false, error: 'bad' });
    });
  });

  describe('flatMap', () => {
    it('chains ok results', () => {
      const result = flatMap(ok(5), (x) => ok(x * 3));
      expect(result).toEqual({ ok: true, value: 15 });
    });

    it('short-circuits on err input', () => {
      const result = flatMap(err('fail'), (_x: number) => ok(99));
      expect(result).toEqual({ ok: false, error: 'fail' });
    });

    it('propagates err from the chained function', () => {
      const result = flatMap(ok(5), (_x) => err('chained error'));
      expect(result).toEqual({ ok: false, error: 'chained error' });
    });
  });

  describe('mapError', () => {
    it('transforms the error of an err result', () => {
      const result = mapError(err('bad'), (e) => `wrapped: ${e}`);
      expect(result).toEqual({ ok: false, error: 'wrapped: bad' });
    });

    it('passes through an ok result unchanged', () => {
      const result = mapError(ok(42), (e: string) => `wrapped: ${e}`);
      expect(result).toEqual({ ok: true, value: 42 });
    });
  });

  describe('unwrapOr', () => {
    it('returns the value for ok results', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42);
    });

    it('returns the default for err results', () => {
      expect(unwrapOr(err('fail'), 0)).toBe(0);
    });
  });
});
