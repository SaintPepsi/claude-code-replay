/**
 * Railway-oriented Result type for explicit error handling.
 * Replaces try/catch with composable, type-safe error propagation.
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) return ok(fn(result.value));
  return result;
}

export function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (result.ok) return fn(result.value);
  return result;
}

export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.ok) return err(fn(result.error));
  return result;
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) return result.value;
  return defaultValue;
}

/** Safely parse JSON without throwing. Returns Result. */
// eslint-disable-next-line -- try-catch required: JSON.parse has no non-throwing API
export function safeJsonParse(text: string): Result<unknown, string> {
  try { return ok(JSON.parse(text)); } catch (e) { return err(e instanceof Error ? e.message : 'parse error'); }
}
