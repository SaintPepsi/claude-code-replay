import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlaybackController } from './playback-controller';
import { ChatRenderer } from './chat-renderer';
import { TaskManager } from './task-manager';
import type { Message } from '../types';

// Mock ResizeObserver for ChatRenderer constructor
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

function createElements() {
  return {
    progressFill: document.createElement('div'),
    msgCounter: document.createElement('span'),
    statusDot: document.createElement('span'),
    statusTextEl: document.createElement('span'),
    speedDisplay: document.createElement('span'),
    btnPlay: document.createElement('button') as HTMLButtonElement,
    btnRealtime: document.createElement('button') as HTMLButtonElement,
  };
}

function sampleMessages(): Message[] {
  return [
    { type: 'user', text: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
    {
      type: 'assistant',
      content: [{ type: 'text', text: 'Hi there' }],
      timestamp: '2024-01-01T00:00:01Z',
    },
    { type: 'user', text: 'Do something', timestamp: '2024-01-01T00:00:02Z' },
  ];
}

describe('PlaybackController', () => {
  let chat: HTMLElement;
  let chatInner: HTMLElement;
  let taskPanel: HTMLElement;
  let taskManager: TaskManager;
  let renderer: ChatRenderer;
  let elements: ReturnType<typeof createElements>;
  let controller: PlaybackController;

  beforeEach(() => {
    chat = document.createElement('div');
    chatInner = document.createElement('div');
    chat.appendChild(chatInner);
    taskPanel = document.createElement('div');
    taskManager = new TaskManager(taskPanel);
    renderer = new ChatRenderer(chat, chatInner, taskManager);
    elements = createElements();
    controller = new PlaybackController(renderer, taskManager, elements);
  });

  it('setMessages stores messages and resets index', () => {
    const msgs = sampleMessages();
    controller.setMessages(msgs);
    expect(controller.getMessageCount()).toBe(3);
    expect(controller.getCurrentIndex()).toBe(0);
    expect(controller.isPlaying()).toBe(false);
  });

  it('getCurrentIndex returns 0 initially', () => {
    expect(controller.getCurrentIndex()).toBe(0);
  });

  it('getMessageCount returns correct count', () => {
    expect(controller.getMessageCount()).toBe(0);
    controller.setMessages(sampleMessages());
    expect(controller.getMessageCount()).toBe(3);
  });

  it('slower decreases speed', () => {
    // Default speedIdx=2 (1x)
    controller.slower();
    expect(elements.speedDisplay.textContent).toBe('0.5x');

    controller.slower();
    expect(elements.speedDisplay.textContent).toBe('0.25x');

    // Should not go below minimum
    controller.slower();
    expect(elements.speedDisplay.textContent).toBe('0.25x');
  });

  it('faster increases speed', () => {
    // Default speedIdx=2 (1x)
    controller.faster();
    expect(elements.speedDisplay.textContent).toBe('2x');

    controller.faster();
    expect(elements.speedDisplay.textContent).toBe('4x');

    controller.faster();
    expect(elements.speedDisplay.textContent).toBe('8x');

    controller.faster();
    expect(elements.speedDisplay.textContent).toBe('16x');

    // Should not go above maximum
    controller.faster();
    expect(elements.speedDisplay.textContent).toBe('16x');
  });

  it('toggleRealtime toggles active class', () => {
    expect(elements.btnRealtime.classList.contains('active')).toBe(false);

    controller.toggleRealtime();
    expect(elements.btnRealtime.classList.contains('active')).toBe(true);

    controller.toggleRealtime();
    expect(elements.btnRealtime.classList.contains('active')).toBe(false);
  });

  it('reset clears state', () => {
    controller.setMessages(sampleMessages());
    controller.reset();

    expect(controller.getMessageCount()).toBe(0);
    expect(controller.getCurrentIndex()).toBe(0);
    expect(controller.isPlaying()).toBe(false);
  });

  it('seekTo with forward seek renders messages without clearing', () => {
    const msgs = sampleMessages();
    controller.setMessages(msgs);

    const clearSpy = vi.spyOn(renderer, 'clear');
    const appendSpy = vi.spyOn(renderer, 'appendFragment');

    controller.seekTo(2);

    expect(clearSpy).not.toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(controller.getCurrentIndex()).toBe(2);
    expect(controller.isPlaying()).toBe(false);
    expect(elements.statusTextEl.textContent).toBe('Paused');
  });

  it('seekTo with backward seek rebuilds from scratch', () => {
    const msgs = sampleMessages();
    controller.setMessages(msgs);

    // First seek forward
    controller.seekTo(3);

    const clearSpy = vi.spyOn(renderer, 'clear');
    const resetSpy = vi.spyOn(taskManager, 'reset');

    // Now seek backward
    controller.seekTo(1);

    expect(clearSpy).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
    expect(controller.getCurrentIndex()).toBe(1);
  });

  it('seekTo clamps to valid range', () => {
    controller.setMessages(sampleMessages());

    controller.seekTo(-5);
    expect(controller.getCurrentIndex()).toBe(0);

    controller.seekTo(100);
    expect(controller.getCurrentIndex()).toBe(3);
  });

  it('updatePlayButton shows play/pause correctly', () => {
    // Initially not playing - reset sets playing=false and calls updatePlayButton
    controller.reset();
    expect(elements.btnPlay.innerHTML).toContain('Play');
    expect(elements.btnPlay.classList.contains('active')).toBe(false);
  });

  it('updatePlayButton shows pause when playing', async () => {
    controller.setMessages(sampleMessages());
    // togglePlay sets playing=true
    const playPromise = controller.togglePlay();
    expect(elements.btnPlay.innerHTML).toContain('Pause');
    expect(elements.btnPlay.classList.contains('active')).toBe(true);

    // Stop playback to clean up
    controller.reset();
    await playPromise.catch(() => {});
  });

  it('seekTo updates progress fill and message counter', () => {
    controller.setMessages(sampleMessages());
    controller.seekTo(2);

    const expectedPct = (2 / 3) * 100;
    expect(elements.progressFill.style.width).toBe(expectedPct + '%');
    expect(elements.msgCounter.textContent).toBe('2/3');
  });

  it('reset clears progress display', () => {
    controller.setMessages(sampleMessages());
    controller.seekTo(2);
    // Verify progress is set
    expect(elements.msgCounter.textContent).toBe('2/3');

    controller.reset();
    expect(elements.progressFill.style.width).toBe('0%');
    expect(elements.msgCounter.textContent).toBe('0/0');
  });

  it('seekTo updates status to Paused', () => {
    controller.setMessages(sampleMessages());
    controller.seekTo(1);

    expect(elements.statusDot.className).toBe('status-dot paused');
    expect(elements.statusTextEl.textContent).toBe('Paused');
  });
});
