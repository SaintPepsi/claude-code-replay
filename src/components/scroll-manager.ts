import { AUTO_SCROLL_THRESHOLD_PX } from '../config';

/**
 * ScrollManager — SRP extraction of scroll behavior from ChatRenderer.
 * Handles auto-scroll pinning, programmatic scrolls, and resize observation.
 */
export class ScrollManager {
  private enabled = true;
  private programmatic = false;
  private container: HTMLElement;
  private content: HTMLElement;
  private observer: ResizeObserver;
  private handleScroll: () => void;

  constructor(container: HTMLElement, content: HTMLElement) {
    this.container = container;
    this.content = content;

    this.handleScroll = () => {
      if (this.programmatic) return;
      const distFromBottom =
        this.container.scrollHeight - this.container.scrollTop - this.container.clientHeight;
      this.enabled = distFromBottom < AUTO_SCROLL_THRESHOLD_PX;
    };

    this.container.addEventListener('scroll', this.handleScroll);

    this.observer = new ResizeObserver(() => {
      if (!this.enabled) return;
      this.programmatic = true;
      this.container.scrollTop = this.container.scrollHeight;
      this.programmatic = false;
    });
    this.observer.observe(this.content);
  }

  scrollToBottom(): void {
    if (!this.enabled) return;
    this.programmatic = true;
    this.container.scrollTop = this.container.scrollHeight;
    this.programmatic = false;
  }

  scrollToElement(element: Element): void {
    this.programmatic = true;
    element.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    this.programmatic = false;
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  destroy(): void {
    this.container.removeEventListener('scroll', this.handleScroll);
    this.observer.disconnect();
  }
}
