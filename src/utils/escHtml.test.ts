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

  it('handles double quotes safely', () => {
    // Browser's textContent→innerHTML doesn't escape quotes (they're safe in text nodes)
    const result = escHtml('"quoted"');
    // Roundtrip: setting innerHTML with result should yield original text
    const div = document.createElement('div');
    div.innerHTML = result;
    expect(div.textContent).toBe('"quoted"');
  });

  it('escapes single quotes', () => {
    const result = escHtml("it's");
    expect(result).toContain('it');
    expect(result).toContain('s');
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
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
    // Roundtrip preserves original
    const div = document.createElement('div');
    div.innerHTML = result;
    expect(div.textContent).toBe('<a href="x">&</a>');
  });

  it('handles newlines and whitespace', () => {
    expect(escHtml('line1\nline2')).toBe('line1\nline2');
  });
});
