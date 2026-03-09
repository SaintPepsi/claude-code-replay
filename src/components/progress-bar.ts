import type { Message } from '../types';

export class ProgressBar {
  private progressBar: HTMLElement;
  private progressTicks: HTMLElement;

  constructor(progressBar: HTMLElement, progressTicks: HTMLElement) {
    this.progressBar = progressBar;
    this.progressTicks = progressTicks;
  }

  buildTicks(messages: Message[]): void {
    this.progressTicks.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < messages.length; i++) {
      const tick = document.createElement('div');
      tick.className = 'progress-tick ' + (messages[i].type === 'user' ? 'tick-user' : 'tick-assistant');
      frag.appendChild(tick);
    }
    this.progressTicks.appendChild(frag);
  }

  clearTicks(): void {
    this.progressTicks.innerHTML = '';
  }

  getElement(): HTMLElement {
    return this.progressBar;
  }

  setDragging(dragging: boolean): void {
    this.progressBar.classList.toggle('dragging', dragging);
  }

  getProgressIndex(e: MouseEvent, messageCount: number): number {
    const rect = this.progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round(pct * messageCount);
  }
}
