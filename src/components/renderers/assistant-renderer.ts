import type { AssistantMessage, ContentBlock } from '../../types';
import { md } from '../../utils/markdown';
import { div } from '../../utils/dom';
import { ToolRenderer } from './tool-renderer';
import { TaskManager } from '../task-manager';
import { isTaskTool } from '../../parser/tool-summary';

export class AssistantRenderer {
  private toolRenderer: ToolRenderer;
  private taskManager: TaskManager;

  constructor(toolRenderer: ToolRenderer, taskManager: TaskManager) {
    this.toolRenderer = toolRenderer;
    this.taskManager = taskManager;
  }

  renderBlock(block: ContentBlock, target: HTMLElement | DocumentFragment, autoScroll?: () => void): void {
    if (block.type === 'text' && block.text) {
      const el = div('assistant-block bullet-text');
      el.innerHTML = '<span class="bullet">●</span>' + md(block.text);
      target.appendChild(el);
    } else if (block.type === 'tool_use') {
      if (isTaskTool(block.name)) {
        this.taskManager.handleTaskTool(block);
      } else {
        this.toolRenderer.renderToolCall(block, target);
        if (block.result) this.toolRenderer.renderToolResult(block.result, target);
      }
    }
    if (autoScroll) autoScroll();
  }

  renderAssistant(msg: AssistantMessage, target: HTMLElement | DocumentFragment): void {
    for (const block of msg.content) {
      this.renderBlock(block, target);
    }
    const statusEl = div('status-line');
    statusEl.innerHTML = `<span class="status-icon">✱</span> Worked for 0s`;
    target.appendChild(statusEl);
  }
}
