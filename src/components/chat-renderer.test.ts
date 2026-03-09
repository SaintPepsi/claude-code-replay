import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatRenderer } from './chat-renderer';
import { TaskManager } from './task-manager';
import type { ContentBlock, UserMessage, AssistantMessage, ToolResult } from '../types';

// We need to mock ResizeObserver since jsdom doesn't support it
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

describe('ChatRenderer', () => {
  let chat: HTMLElement;
  let chatInner: HTMLElement;
  let taskPanel: HTMLElement;
  let taskManager: TaskManager;
  let renderer: ChatRenderer;

  beforeEach(() => {
    chat = document.createElement('div');
    chatInner = document.createElement('div');
    chat.appendChild(chatInner);
    taskPanel = document.createElement('div');
    taskManager = new TaskManager(taskPanel);
    renderer = new ChatRenderer(chat, chatInner, taskManager);
  });

  it('renderUserInstant creates .msg-user element with prompt and user text', () => {
    const msg: UserMessage = { type: 'user', text: 'Hello world', timestamp: '' };
    renderer.renderUserInstant(msg);

    const el = chatInner.querySelector('.msg-user') as HTMLElement;
    expect(el).not.toBeNull();

    const prompt = el.querySelector('.user-prompt') as HTMLElement;
    expect(prompt.textContent).toBe('❯');

    const textSpan = el.querySelector('.user-text') as HTMLElement;
    expect(textSpan.textContent).toBe('Hello world');
  });

  it('renderAssistantInstant creates blocks for each content item plus status line', () => {
    const msg: AssistantMessage = {
      type: 'assistant',
      content: [
        { type: 'text', text: 'Some response' },
        { type: 'text', text: 'Another paragraph' },
      ],
      timestamp: '',
    };
    renderer.renderAssistantInstant(msg);

    const blocks = chatInner.querySelectorAll('.assistant-block');
    expect(blocks.length).toBe(2);

    const statusLine = chatInner.querySelector('.status-line') as HTMLElement;
    expect(statusLine).not.toBeNull();
    expect(statusLine.textContent).toContain('Worked for');
  });

  it('renderToolCall creates .tool-call element with name and summary', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'Bash',
      input: { command: 'ls -la', description: 'List files' },
    };
    renderer.renderToolCall(block);

    const toolEl = chatInner.querySelector('.tool-call') as HTMLElement;
    expect(toolEl).not.toBeNull();

    const name = toolEl.querySelector('.tool-call-name') as HTMLElement;
    expect(name.textContent).toBe('Bash');

    const summary = toolEl.querySelector('.tool-call-summary') as HTMLElement;
    expect(summary.textContent).toBe('List files');
  });

  it('renderToolResult creates .tool-result element with preview', () => {
    const result: ToolResult = {
      stdout: 'file1.txt\nfile2.txt\nfile3.txt',
      is_error: false,
    };
    renderer.renderToolResult(result);

    const resultEl = chatInner.querySelector('.tool-result') as HTMLElement;
    expect(resultEl).not.toBeNull();

    const preview = resultEl.querySelector('.tool-result-preview') as HTMLElement;
    expect(preview.textContent).toBe('file1.txt');
  });

  it('renderToolResult skips if displayText is empty', () => {
    const result: ToolResult = { content: '', is_error: false };
    renderer.renderToolResult(result);

    const resultEl = chatInner.querySelector('.tool-result');
    expect(resultEl).toBeNull();
  });

  it('renderBlockInstant handles text blocks', () => {
    const block: ContentBlock = { type: 'text', text: 'Hello' };
    renderer.renderBlockInstant(block);

    const el = chatInner.querySelector('.assistant-block.bullet-text') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.innerHTML).toContain('●');
  });

  it('renderBlockInstant handles tool_use blocks', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'Read',
      input: { file_path: '/tmp/test.ts' },
    };
    renderer.renderBlockInstant(block);

    const toolEl = chatInner.querySelector('.tool-call') as HTMLElement;
    expect(toolEl).not.toBeNull();
  });

  it('renderBlockInstant delegates task tools to TaskManager', () => {
    const spy = vi.spyOn(taskManager, 'handleTaskTool');
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Do something' },
    };
    renderer.renderBlockInstant(block);

    expect(spy).toHaveBeenCalledWith(block);
    // Task tool should NOT create a .tool-call element in chat
    expect(chatInner.querySelector('.tool-call')).toBeNull();
  });

  it('clear empties chatInner', () => {
    renderer.renderUserInstant({ type: 'user', text: 'test', timestamp: '' });
    expect(chatInner.children.length).toBeGreaterThan(0);

    renderer.clear();
    expect(chatInner.innerHTML).toBe('');
  });

  it('autoScroll scrolls to bottom when enabled', () => {
    // Mock scrollHeight and clientHeight
    Object.defineProperty(chat, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(chat, 'clientHeight', { value: 500, configurable: true });

    renderer.enableAutoScroll();
    renderer.autoScroll();

    expect(chat.scrollTop).toBe(1000);
  });

  it('renderToolResult marks error results with error class', () => {
    const result: ToolResult = {
      stdout: 'Error: something failed',
      is_error: true,
    };
    renderer.renderToolResult(result);

    const resultEl = chatInner.querySelector('.tool-result') as HTMLElement;
    expect(resultEl).not.toBeNull();
    expect(resultEl.classList.contains('error')).toBe(true);
  });

  it('renderToolResult shows stderr combined with stdout', () => {
    const result: ToolResult = {
      stdout: 'out',
      stderr: 'err',
      is_error: false,
    };
    renderer.renderToolResult(result);

    const body = chatInner.querySelector('.tool-result-body pre') as HTMLElement;
    expect(body.textContent).toContain('out');
    expect(body.textContent).toContain('err');
  });

  it('event delegation toggles open class on tool-call-header click', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'Bash',
      input: { command: 'ls -la' },
    };
    renderer.renderToolCall(block);

    const header = chatInner.querySelector('.tool-call-header') as HTMLElement;
    const toolEl = chatInner.querySelector('.tool-call') as HTMLElement;

    expect(toolEl.classList.contains('open')).toBe(false);
    header.click();
    expect(toolEl.classList.contains('open')).toBe(true);
    header.click();
    expect(toolEl.classList.contains('open')).toBe(false);
  });

  it('event delegation toggles open class on tool-result-line click', () => {
    const result: ToolResult = {
      stdout: 'line1\nline2\nline3',
      is_error: false,
    };
    renderer.renderToolResult(result);

    const line = chatInner.querySelector('.tool-result-line') as HTMLElement;
    const resultEl = chatInner.querySelector('.tool-result') as HTMLElement;

    expect(resultEl.classList.contains('open')).toBe(false);
    line.click();
    expect(resultEl.classList.contains('open')).toBe(true);
  });

  it('destroy removes click delegation listener', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'Read',
      input: { file_path: '/test' },
    };
    renderer.renderToolCall(block);

    renderer.destroy();

    // After destroy, clicking should not toggle open
    const header = chatInner.querySelector('.tool-call-header') as HTMLElement;
    const toolEl = chatInner.querySelector('.tool-call') as HTMLElement;
    header.click();
    expect(toolEl.classList.contains('open')).toBe(false);
  });

  it('renderToolCall shows expand hint for multi-line commands', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'Edit',
      input: { file_path: '/test.ts', old_string: 'line1\nline2\nline3' },
    };
    renderer.renderToolCall(block);

    const expand = chatInner.querySelector('.tool-call-expand') as HTMLElement;
    expect(expand).not.toBeNull();
    expect(expand.textContent).toContain('lines');
  });

  it('renderMessageInstant handles assistant messages with tool_use and result', () => {
    const msg: AssistantMessage = {
      type: 'assistant',
      content: [
        {
          type: 'tool_use',
          name: 'Bash',
          input: { command: 'echo hi' },
          result: { stdout: 'hi', is_error: false },
        },
      ],
      timestamp: '',
    };
    renderer.renderMessageInstant(msg);

    expect(chatInner.querySelector('.tool-call')).not.toBeNull();
    expect(chatInner.querySelector('.tool-result')).not.toBeNull();
    expect(chatInner.querySelector('.status-line')).not.toBeNull();
  });
});
