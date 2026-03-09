import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressBar } from './progress-bar';
import type { Message } from '../types';

describe('ProgressBar', () => {
  let progressBar: HTMLElement;
  let progressTicks: HTMLElement;
  let pb: ProgressBar;

  beforeEach(() => {
    progressBar = document.createElement('div');
    progressTicks = document.createElement('div');
    pb = new ProgressBar(progressBar, progressTicks);
  });

  it('buildTicks creates correct number of tick elements', () => {
    const messages: Message[] = [
      { type: 'user', text: 'hello', timestamp: '' },
      { type: 'assistant', content: [], timestamp: '' },
      { type: 'user', text: 'world', timestamp: '' },
    ];
    pb.buildTicks(messages);
    expect(progressTicks.children.length).toBe(3);
  });

  it('buildTicks assigns tick-user class for user messages', () => {
    const messages: Message[] = [
      { type: 'user', text: 'hi', timestamp: '' },
    ];
    pb.buildTicks(messages);
    const tick = progressTicks.children[0] as HTMLElement;
    expect(tick.className).toBe('progress-tick tick-user');
  });

  it('buildTicks assigns tick-assistant class for assistant messages', () => {
    const messages: Message[] = [
      { type: 'assistant', content: [], timestamp: '' },
    ];
    pb.buildTicks(messages);
    const tick = progressTicks.children[0] as HTMLElement;
    expect(tick.className).toBe('progress-tick tick-assistant');
  });

  it('clearTicks removes all tick elements', () => {
    const messages: Message[] = [
      { type: 'user', text: 'a', timestamp: '' },
      { type: 'assistant', content: [], timestamp: '' },
    ];
    pb.buildTicks(messages);
    expect(progressTicks.children.length).toBe(2);

    pb.clearTicks();
    expect(progressTicks.children.length).toBe(0);
    expect(progressTicks.innerHTML).toBe('');
  });

  it('setDragging toggles dragging class', () => {
    expect(progressBar.classList.contains('dragging')).toBe(false);

    pb.setDragging(true);
    expect(progressBar.classList.contains('dragging')).toBe(true);

    pb.setDragging(false);
    expect(progressBar.classList.contains('dragging')).toBe(false);
  });

  it('getElement returns the progress bar element', () => {
    expect(pb.getElement()).toBe(progressBar);
  });
});
