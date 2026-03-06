import { escHtml } from './escHtml';
import { redact } from './redact';

export function md(text: string): string {
  if (!text) return '';
  text = redact(text);

  // 1. Extract fenced code blocks into placeholders (before escaping)
  const codeBlocks: string[] = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_: string, _lang: string, code: string) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escHtml(code.trim())}</code></pre>`);
    return `\x00CODEBLOCK${idx}\x00`;
  });

  // 2. Escape all remaining HTML
  text = escHtml(text);

  // 3. Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 4. Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 5. Italic
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // 6. Headers
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 7. Blockquotes
  text = text.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // 8. Unordered lists
  text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');

  // 9. Tables
  text = text.replace(/^\|(.+)\|$/gm, (_match: string, inner: string) => {
    const cells = inner.split('|').map((c: string) => c.trim());
    if (cells.every((c: string) => /^[-:]+$/.test(c))) return '';
    return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>';
  });
  if (text.includes('<tr>')) {
    text = text.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>');
  }

  // 10. Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_: string, label: string, url: string) => {
    return `<a href="${url.replace(/&amp;/g, '&')}" target="_blank">${label}</a>`;
  });

  // 11. Line breaks
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  if (!text.startsWith('<')) text = '<p>' + text + '</p>';
  text = text.replace(/<p>\s*<\/p>/g, '');

  // 12. Restore code block placeholders
  text = text.replace(/\x00CODEBLOCK(\d+)\x00/g, (_: string, idx: string) => codeBlocks[parseInt(idx)]);

  return text;
}
