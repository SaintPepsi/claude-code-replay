import { redact } from './redact';

describe('redact', () => {
  it('redacts sk-ant- API key pattern', () => {
    const input = 'key is sk-ant-abcdefghij1234567890';
    const result = redact(input);
    expect(result).toBe('key is sk-ant-****[REDACTED]');
    expect(result).not.toContain('abcdefghij');
  });

  it('redacts sk- API key pattern', () => {
    const input = 'key is sk-abcdefghijklmnopqrstuvwxyz';
    const result = redact(input);
    expect(result).toBe('key is sk-****[REDACTED]');
    expect(result).not.toContain('abcdefghijklmnopqrstuvwxyz');
  });

  it('redacts AAAA base64 pattern', () => {
    const input = 'token AAAAabcdefghijklmnopqrstuv';
    const result = redact(input);
    expect(result).toBe('token AAAA...[REDACTED]');
    expect(result).not.toContain('abcdefghijklmnopqrstuv');
  });

  it('passes text without credentials through unchanged', () => {
    const input = 'This is normal text with no secrets.';
    expect(redact(input)).toBe(input);
  });

  it('returns empty string for empty input', () => {
    expect(redact('')).toBe('');
  });

  it('returns falsy values as-is', () => {
    expect(redact(null as unknown as string)).toBeNull();
    expect(redact(undefined as unknown as string)).toBeUndefined();
  });

  it('redacts multiple credentials in same string', () => {
    const input = 'first: sk-ant-abcdef1234567890 second: sk-abcdefghijklmnopqrstuvwxyz';
    const result = redact(input);
    expect(result).toBe('first: sk-ant-****[REDACTED] second: sk-****[REDACTED]');
  });

  it('does not redact short sk- patterns (under 20 chars)', () => {
    const input = 'sk-short';
    expect(redact(input)).toBe('sk-short');
  });

  it('does not redact short sk-ant- patterns (under 10 chars)', () => {
    const input = 'sk-ant-abc';
    expect(redact(input)).toBe('sk-ant-abc');
  });

  it('does not redact short AAAA patterns (under 20 chars)', () => {
    const input = 'AAAAshort';
    expect(redact(input)).toBe('AAAAshort');
  });
});
