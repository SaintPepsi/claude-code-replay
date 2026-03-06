import type { ContentBlock, Message, ToolResult, UserMessage, AssistantMessage } from '../types';
import { escHtml } from '../utils/escHtml';
import { redact } from '../utils/redact';
import { md } from '../utils/markdown';
import { getToolSummary, getToolCommand, isTaskTool } from '../parser/tool-summary';
import { div, span } from '../utils/dom';
import { TOOL_PREVIEW_MAX_LENGTH } from '../config';
import { TaskManager } from './task-manager';
import { ScrollManager } from './scroll-manager';

export class ChatRenderer {
  private chatInner: HTMLElement;
  private scrollManager: ScrollManager;
  private taskManager: TaskManager;
  private handleClick: (e: Event) => void;

  constructor(chat: HTMLElement, chatInner: HTMLElement, taskManager: TaskManager, scrollManager?: ScrollManager) {
    this.chatInner = chatInner;
    this.taskManager = taskManager;
    this.scrollManager = scrollManager || new ScrollManager(chat, chatInner);

    // Event delegation for toggling open/closed on tool-call and tool-result elements.
    // Replaces inline onclick handlers for CSP compliance.
    this.handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const header = target.closest('.tool-call-header, .tool-call-expand, .tool-result-line, .tool-result-expand');
      if (!header) return;
      const parent = header.closest('.tool-call, .tool-result');
      if (parent) parent.classList.toggle('open');
    };
    this.chatInner.addEventListener('click', this.handleClick);
  }

  autoScroll(): void {
    this.scrollManager.scrollToBottom();
  }

  disableAutoScroll(): void {
    this.scrollManager.disable();
  }

  enableAutoScroll(): void {
    this.scrollManager.enable();
  }

  scrollToLast(): void {
    const lastChild = this.chatInner.lastElementChild;
    if (lastChild) {
      this.scrollManager.scrollToElement(lastChild);
    }
  }

  clear(): void {
    this.chatInner.innerHTML = '';
  }

  renderToolCall(block: ContentBlock, target?: HTMLElement | DocumentFragment): void {
    target = target || this.chatInner;
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

  renderToolResult(result: ToolResult, target?: HTMLElement | DocumentFragment): void {
    target = target || this.chatInner;
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

  renderBlockInstant(block: ContentBlock, target?: HTMLElement | DocumentFragment): void {
    target = target || this.chatInner;
    if (block.type === 'text' && block.text) {
      const el = div('assistant-block bullet-text');
      el.innerHTML = '<span class="bullet">●</span>' + md(block.text);
      target.appendChild(el);
    } else if (block.type === 'tool_use') {
      if (isTaskTool(block.name)) {
        this.taskManager.handleTaskTool(block);
      } else {
        this.renderToolCall(block, target);
        if (block.result) this.renderToolResult(block.result, target);
      }
    }
    if (target === this.chatInner) this.autoScroll();
  }

  renderUserInstant(msg: UserMessage, target?: HTMLElement | DocumentFragment): void {
    target = target || this.chatInner;
    const el = div('msg-user');
    el.appendChild(span('user-prompt', '❯'));
    el.appendChild(span('user-text', msg.text));
    target.appendChild(el);
  }

  renderAssistantInstant(msg: AssistantMessage, target?: HTMLElement | DocumentFragment): void {
    target = target || this.chatInner;
    for (const block of msg.content) {
      this.renderBlockInstant(block, target);
    }
    const statusEl = div('status-line');
    statusEl.innerHTML = `<span class="status-icon">✱</span> Worked for 0s`;
    target.appendChild(statusEl);
  }

  renderMessageInstant(msg: Message, target?: HTMLElement | DocumentFragment): void {
    if (msg.type === 'user') this.renderUserInstant(msg, target);
    else if (msg.type === 'assistant') this.renderAssistantInstant(msg, target);
  }

  appendFragment(frag: DocumentFragment): void {
    this.chatInner.appendChild(frag);
  }

  destroy(): void {
    this.chatInner.removeEventListener('click', this.handleClick);
    this.scrollManager.destroy();
  }
}
