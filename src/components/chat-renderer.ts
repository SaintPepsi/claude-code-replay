import type { ContentBlock, Message, ToolResult, UserMessage, AssistantMessage, IRenderer } from '../types';
import { TaskManager } from './task-manager';
import { ScrollManager } from './scroll-manager';
import { UserRenderer } from './renderers/user-renderer';
import { AssistantRenderer } from './renderers/assistant-renderer';
import { ToolRenderer } from './renderers/tool-renderer';

export class ChatRenderer implements IRenderer {
  private chatInner: HTMLElement;
  private scrollManager: ScrollManager;
  private handleClick: (e: Event) => void;

  private userRenderer: UserRenderer;
  private assistantRenderer: AssistantRenderer;
  private toolRenderer: ToolRenderer;

  constructor(chat: HTMLElement, chatInner: HTMLElement, taskManager: TaskManager, scrollManager?: ScrollManager) {
    this.chatInner = chatInner;
    this.scrollManager = scrollManager || new ScrollManager(chat, chatInner);

    // Sub-renderers (TASK-205)
    this.toolRenderer = new ToolRenderer();
    this.userRenderer = new UserRenderer();
    this.assistantRenderer = new AssistantRenderer(this.toolRenderer, taskManager);

    // Event delegation for toggling open/closed on tool-call and tool-result elements.
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
    this.toolRenderer.renderToolCall(block, target || this.chatInner);
  }

  renderToolResult(result: ToolResult, target?: HTMLElement | DocumentFragment): void {
    this.toolRenderer.renderToolResult(result, target || this.chatInner);
  }

  renderBlockInstant(block: ContentBlock, target?: HTMLElement | DocumentFragment): void {
    const t = target || this.chatInner;
    this.assistantRenderer.renderBlock(block, t, t === this.chatInner ? () => this.autoScroll() : undefined);
  }

  renderUserInstant(msg: UserMessage, target?: HTMLElement | DocumentFragment): void {
    this.userRenderer.renderUser(msg, target || this.chatInner);
  }

  renderAssistantInstant(msg: AssistantMessage, target?: HTMLElement | DocumentFragment): void {
    this.assistantRenderer.renderAssistant(msg, target || this.chatInner);
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
