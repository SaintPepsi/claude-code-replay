import type { ContentBlock, ToolResult } from '../../types';
import { escHtml } from '../../utils/escHtml';
import { redact } from '../../utils/redact';
import { getToolSummary, getToolCommand } from '../../parser/tool-summary';
import { div } from '../../utils/dom';
import { TOOL_PREVIEW_MAX_LENGTH } from '../../config';

export class ToolRenderer {
  renderToolCall(block: ContentBlock, target: HTMLElement | DocumentFragment): void {
    const summary = getToolSummary(block);
    const command = getToolCommand(block);
    const commandLines = command.split('\n');
    const previewLine = commandLines[0].substring(0, TOOL_PREVIEW_MAX_LENGTH);
    const extraLines = commandLines.length - 1;

    const toolEl = div('tool-call');
    toolEl.innerHTML = `
      <div class="tool-call-header">
        <span class="bullet">●</span>
        <span class="tool-call-name">${escHtml(block.name || '')}</span><span class="tool-call-paren">(</span><span class="tool-call-summary">${escHtml(summary)}</span><span class="tool-call-paren">)</span>
      </div>
      <div class="tool-call-body"><pre>${escHtml(redact(previewLine))}</pre></div>
      ${extraLines > 0 ? `<div class="tool-call-expand">… +${extraLines} lines (click to expand)</div>` : ''}
    `;
    target.appendChild(toolEl);
  }

  renderToolResult(result: ToolResult, target: HTMLElement | DocumentFragment): void {
    const resultText = result.stdout || result.content || '';
    const stderrText = result.stderr || '';
    const displayText = (resultText + (stderrText ? '\n' + stderrText : '')).trim();

    if (!displayText) return;

    const redacted = redact(displayText);
    const resultLines = redacted.split('\n');
    const previewText = resultLines[0].substring(0, TOOL_PREVIEW_MAX_LENGTH);
    const moreLines = resultLines.length - 1;

    const resultEl = div(`tool-result ${result.is_error ? 'error' : ''}`);
    resultEl.innerHTML = `
      <div class="tool-result-line">
        <span class="tool-result-connector">└</span>
        <span class="tool-result-preview">${escHtml(previewText)}</span>
      </div>
      ${moreLines > 0 ? `<div class="tool-result-expand">… +${moreLines} lines (click to expand)</div>` : ''}
      <div class="tool-result-body"><pre>${escHtml(redacted)}</pre></div>
    `;
    target.appendChild(resultEl);
  }
}
