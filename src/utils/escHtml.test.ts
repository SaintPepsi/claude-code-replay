import { escHtml } from './escHtml';

describe('escHtml', () => {
  it('returns basic text unchanged', () => {
    expect(escHtml('hello world')).toBe('hello world');
  });

  it('escapes < and >', () => {
    expect(escHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes ampersands', () => {
    expect(escHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes double quotes', () => {
    expect(escHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('escapes single quotes', () => {
    expect(escHtml("it's")).toBe("it&#39;s");
  });

  it('escapes script tags', () => {
    const result = escHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('returns empty string for empty input', () => {
    expect(escHtml('')).toBe('');
  });

  it('handles multiple special characters together', () => {
    const result = escHtml('<a href="x">&</a>');
    expect(result).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });

  it('handles newlines and whitespace', () => {
    expect(escHtml('line1\nline2')).toBe('line1\nline2');
  });
});
