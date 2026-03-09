import { md } from './markdown';

describe('md', () => {
  describe('fenced code blocks', () => {
    it('renders code block with language', () => {
      const input = '```js\nconsole.log("hi");\n```';
      const result = md(input);
      expect(result).toContain('<pre><code>');
      expect(result).toContain('console.log');
      expect(result).toContain('</code></pre>');
    });

    it('renders code block without language', () => {
      const input = '```\nsome code\n```';
      const result = md(input);
      expect(result).toContain('<pre><code>some code</code></pre>');
    });

    it('escapes HTML inside code blocks', () => {
      const input = '```\n<div>test</div>\n```';
      const result = md(input);
      expect(result).toContain('&lt;div&gt;');
      expect(result).not.toContain('<div>test</div>');
    });
  });

  describe('inline code', () => {
    it('renders inline code with backticks', () => {
      const result = md('use `const` here');
      expect(result).toContain('<code>const</code>');
    });
  });

  describe('bold', () => {
    it('renders **text** as strong', () => {
      const result = md('this is **bold** text');
      expect(result).toContain('<strong>bold</strong>');
    });
  });

  describe('italic', () => {
    it('renders *text* as em', () => {
      const result = md('this is *italic* text');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('headers', () => {
    it('renders h1', () => {
      const result = md('# Title');
      expect(result).toContain('<h1>Title</h1>');
    });

    it('renders h2', () => {
      const result = md('## Subtitle');
      expect(result).toContain('<h2>Subtitle</h2>');
    });

    it('renders h3', () => {
      const result = md('### Section');
      expect(result).toContain('<h3>Section</h3>');
    });
  });

  describe('blockquotes', () => {
    it('renders > as blockquote', () => {
      const result = md('> quoted text');
      expect(result).toContain('<blockquote>quoted text</blockquote>');
    });
  });

  describe('unordered lists', () => {
    it('renders - items as li', () => {
      const result = md('- item one\n- item two');
      expect(result).toContain('<li>item one</li>');
      expect(result).toContain('<li>item two</li>');
    });

    it('renders * items as li', () => {
      const result = md('* item one\n* item two');
      expect(result).toContain('<li>item one</li>');
      expect(result).toContain('<li>item two</li>');
    });

    it('wraps li elements in ul', () => {
      const result = md('- item one\n- item two');
      expect(result).toContain('<ul>');
      expect(result).toContain('</ul>');
    });
  });

  describe('links', () => {
    it('renders [label](url) as anchor tag', () => {
      const result = md('[click here](https://example.com)');
      expect(result).toContain('href=');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('>click here</a>');
    });

    it('handles URLs with & in them', () => {
      const result = md('[link](https://example.com?a=1&b=2)');
      expect(result).toContain('example.com');
      expect(result).toContain('a=1');
      expect(result).toContain('b=2');
    });

    it('allows https URLs', () => {
      const result = md('[link](https://example.com)');
      expect(result).toContain('<a ');
    });

    it('allows http URLs', () => {
      const result = md('[link](http://example.com)');
      expect(result).toContain('<a ');
    });

    it('allows mailto URLs', () => {
      const result = md('[email](mailto:test@example.com)');
      expect(result).toContain('<a ');
    });

    it('allows relative URLs starting with /', () => {
      const result = md('[page](/about)');
      expect(result).toContain('<a ');
    });

    it('allows anchor URLs starting with #', () => {
      const result = md('[section](#top)');
      expect(result).toContain('<a ');
    });

    it('rejects data: URLs', () => {
      const result = md('[click](data:text/html,<script>alert(1)</script>)');
      expect(result).not.toContain('<a ');
      expect(result).toContain('click');
    });

    it('rejects ftp: URLs', () => {
      const result = md('[click](ftp://evil.com/payload)');
      expect(result).not.toContain('<a ');
    });
  });

  describe('XSS prevention', () => {
    it('strips javascript: protocol links', () => {
      const result = md('[click](javascript:alert(1))');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('<a ');
      expect(result).toContain('click');
    });

    it('strips javascript: with mixed case', () => {
      const result = md('[click](JavaScript:alert(1))');
      expect(result).not.toContain('<a ');
    });

    it('strips javascript: with leading whitespace', () => {
      const result = md('[click](  javascript:alert(1))');
      expect(result).not.toContain('<a ');
    });

    it('prevents attribute breakout via quotes in URL', () => {
      const result = md('[click](https://evil.com"onmouseover="alert(1))');
      // The " is escaped before link matching, so no raw " appears in href attribute
      expect(result).not.toContain('href="https://evil.com"');
      // The rendered href contains escaped entities, not raw quotes
      expect(result).not.toMatch(/href="[^"]*"[^"]*onmouseover/);
    });

    it('adds rel="noopener noreferrer" to links', () => {
      const result = md('[link](https://example.com)');
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('tables', () => {
    it('renders markdown tables as HTML tables', () => {
      const input = '| Name | Age |\n|------|-----|\n| Alice | 30 |';
      const result = md(input);
      expect(result).toContain('<table>');
      expect(result).toContain('<td>Name</td>');
      expect(result).toContain('<td>Age</td>');
      expect(result).toContain('<td>Alice</td>');
      expect(result).toContain('<td>30</td>');
    });

    it('strips separator rows', () => {
      const input = '| H1 | H2 |\n|---|---|\n| A | B |';
      const result = md(input);
      expect(result).not.toContain('<td>---</td>');
    });
  });

  describe('line breaks', () => {
    it('converts single newlines to <br>', () => {
      const result = md('line1\nline2');
      expect(result).toContain('line1<br>line2');
    });

    it('converts double newlines to paragraph breaks', () => {
      const result = md('para1\n\npara2');
      expect(result).toContain('</p><p>');
    });
  });

  describe('empty input', () => {
    it('returns empty string for empty input', () => {
      expect(md('')).toBe('');
    });

    it('returns empty string for null/undefined input', () => {
      expect(md(null as unknown as string)).toBe('');
      expect(md(undefined as unknown as string)).toBe('');
    });
  });

  describe('credential redaction', () => {
    it('redacts credentials in markdown output', () => {
      const input = 'API key: sk-ant-abcdefghij1234567890';
      const result = md(input);
      expect(result).not.toContain('abcdefghij1234567890');
      expect(result).toContain('REDACTED');
    });
  });
});
