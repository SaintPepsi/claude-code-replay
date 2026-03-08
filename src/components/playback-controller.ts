import type { Message, IRenderer } from '../types';
import { isTaskTool } from '../parser/tool-summary';
import { md } from '../utils/markdown';
import { div, span, toFragment } from '../utils/dom';
import {
  TEXT_BLOCK_DELAY_MS,
  TEXT_BLOCK_MIN_DELAY_MS,
  TOOL_CALL_DELAY_MS,
  TOOL_CALL_MIN_DELAY_MS,
  TOOL_RESULT_DELAY_MS,
  TOOL_RESULT_MIN_DELAY_MS,
  TASK_TOOL_DELAY_MS,
  TASK_TOOL_MIN_DELAY_MS,
  POST_ASSISTANT_DELAY_MS,
  POST_ASSISTANT_MIN_DELAY_MS,
  REALTIME_MAX_DELAY_MS,
  REALTIME_MIN_DELAY_MS,
  SPEEDS,
  DEFAULT_SPEED_INDEX,
} from '../config';
import { TaskManager } from './task-manager';
import { AnimationEngine } from './animation-engine';

/** Explicit playback states (TASK-207) — replaces ad-hoc boolean flags */
export enum PlaybackState {
  Idle = 'idle',
  Playing = 'playing',
  Paused = 'paused',
  Seeking = 'seeking',
}

export class PlaybackController {
  private messages: Message[] = [];
  private currentIndex = 0;
  private state: PlaybackState = PlaybackState.Idle;
  private speed = 1;
  private speedIdx = DEFAULT_SPEED_INDEX;
  private realTimeMode = false;
  private playGeneration = 0;
  private activeShowMessage: Promise<void> | null = null;

  private renderer: IRenderer;
  private taskManager: TaskManager;
  private animationEngine: AnimationEngine;

  // DOM refs
  private progressFill: HTMLElement;
  private msgCounter: HTMLElement;
  private statusDot: HTMLElement;
  private statusTextEl: HTMLElement;
  private speedDisplay: HTMLElement;
  private btnPlay: HTMLButtonElement;
  private btnRealtime: HTMLButtonElement;

  constructor(
    renderer: IRenderer,
    taskManager: TaskManager,
    elements: {
      progressFill: HTMLElement;
      msgCounter: HTMLElement;
      statusDot: HTMLElement;
      statusTextEl: HTMLElement;
      speedDisplay: HTMLElement;
      btnPlay: HTMLButtonElement;
      btnRealtime: HTMLButtonElement;
    },
    animationEngine?: AnimationEngine,
  ) {
    this.renderer = renderer;
    this.taskManager = taskManager;
    this.animationEngine = animationEngine || new AnimationEngine();
    this.progressFill = elements.progressFill;
    this.msgCounter = elements.msgCounter;
    this.statusDot = elements.statusDot;
    this.statusTextEl = elements.statusTextEl;
    this.speedDisplay = elements.speedDisplay;
    this.btnPlay = elements.btnPlay;
    this.btnRealtime = elements.btnRealtime;
  }

  setMessages(msgs: Message[]): void {
    this.messages = msgs;
    this.currentIndex = 0;
    this.transition(PlaybackState.Idle);
    this.updateProgress();
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  isPlaying(): boolean {
    return this.state === PlaybackState.Playing;
  }

  getState(): PlaybackState {
    return this.state;
  }

  private transition(to: PlaybackState): void {
    this.state = to;
  }

  private get playing(): boolean {
    return this.state === PlaybackState.Playing;
  }

  private set playing(value: boolean) {
    if (value) {
      this.transition(PlaybackState.Playing);
    } else if (this.state === PlaybackState.Playing) {
      this.transition(PlaybackState.Paused);
    }
  }

  private updateProgress(): void {
    const pct = this.messages.length > 0 ? (this.currentIndex / this.messages.length) * 100 : 0;
    this.progressFill.style.width = pct + '%';
    this.msgCounter.textContent = `${this.currentIndex}/${this.messages.length}`;
  }

  private updateStatus(state: string, text: string): void {
    this.statusDot.className = 'status-dot ' + state;
    this.statusTextEl.textContent = text;
  }

  updatePlayButton(): void {
    const isPlaying = this.playing;
    this.btnPlay.innerHTML = isPlaying ? '&#10074;&#10074; Pause' : '&#9654; Play';
    this.btnPlay.classList.toggle('active', isPlaying);
  }

  seekTo(targetIndex: number): void {
    targetIndex = Math.max(0, Math.min(targetIndex, this.messages.length));

    this.playGeneration++;
    this.transition(PlaybackState.Seeking);
    this.updatePlayButton();

    if (targetIndex <= this.currentIndex) {
      this.renderer.clear();
      this.taskManager.reset();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < targetIndex; i++) {
        this.renderer.renderMessageInstant(this.messages[i], frag);
      }
      this.renderer.appendFragment(frag);
    } else {
      const frag = document.createDocumentFragment();
      for (let i = this.currentIndex; i < targetIndex; i++) {
        this.renderer.renderMessageInstant(this.messages[i], frag);
      }
      this.renderer.appendFragment(frag);
    }

    this.currentIndex = targetIndex;
    this.updateProgress();
    this.transition(PlaybackState.Paused);
    this.updateStatus('paused', 'Paused');
    this.renderer.disableAutoScroll();
    this.renderer.scrollToLast();
  }

  getProgressIndex(e: MouseEvent, progressBar: HTMLElement): number {
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round(pct * this.messages.length);
  }

  private async showMessage(index: number, gen: number): Promise<void> {
    if (index >= this.messages.length) {
      this.playing = false;
      this.updatePlayButton();
      this.updateStatus('idle', 'Complete');
      return;
    }

    const cancelled = () => gen !== this.playGeneration;

    this.currentIndex = index;
    this.updateProgress();

    const msg = this.messages[index];

    if (msg.type === 'user') {
      this.updateStatus('active', 'Typing...');

      const el = div('msg-user');
      const prompt = span('user-prompt', '❯');
      const textSpan = span('user-text', '');

      el.appendChild(prompt);
      el.appendChild(textSpan);
      this.renderer.appendFragment(toFragment(el));
      this.renderer.autoScroll();

      const completed = await this.animationEngine.typeText(
        textSpan,
        msg.text,
        this.speed,
        cancelled,
        () => this.renderer.autoScroll(),
      );

      if (!completed) return;
    } else if (msg.type === 'assistant') {
      const startTime = Date.now();

      for (let bi = 0; bi < msg.content.length; bi++) {
        const block = msg.content[bi];

        if (cancelled()) {
          for (let ri = bi; ri < msg.content.length; ri++) {
            this.renderer.renderBlockInstant(msg.content[ri]);
          }
          break;
        }

        if (block.type === 'text' && block.text) {
          this.updateStatus('active', 'Responding...');

          const el = div('assistant-block bullet-text');
          el.innerHTML = '<span class="bullet">●</span>' + md(block.text);
          this.renderer.appendFragment(toFragment(el));
          this.renderer.autoScroll();
          if (cancelled()) continue;
          await new Promise((r) => setTimeout(r, Math.max(TEXT_BLOCK_MIN_DELAY_MS, TEXT_BLOCK_DELAY_MS / this.speed)));
        } else if (block.type === 'tool_use') {
          if (isTaskTool(block.name)) {
            this.taskManager.handleTaskTool(block);
            this.renderer.autoScroll();
            if (cancelled()) continue;
            await new Promise((r) => setTimeout(r, Math.max(TASK_TOOL_MIN_DELAY_MS, TASK_TOOL_DELAY_MS / this.speed)));
            continue;
          }

          this.renderer.renderToolCall(block);
          this.updateStatus('active', `${block.name}...`);
          if (cancelled()) {
            if (block.result) this.renderer.renderToolResult(block.result);
            continue;
          }
          await new Promise((r) => setTimeout(r, Math.max(TOOL_CALL_MIN_DELAY_MS, TOOL_CALL_DELAY_MS / this.speed)));

          if (block.result) {
            this.renderer.renderToolResult(block.result);
            if (cancelled()) continue;
            await new Promise((r) => setTimeout(r, Math.max(TOOL_RESULT_MIN_DELAY_MS, TOOL_RESULT_DELAY_MS / this.speed)));
          }
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const statusEl = div('status-line');
      statusEl.innerHTML = `<span class="status-icon">✱</span> Worked for ${elapsed}s`;
      this.renderer.appendFragment(toFragment(statusEl));
      this.renderer.autoScroll();

      if (cancelled()) return;
      this.updateStatus('idle', 'Idle');
      await new Promise((r) => setTimeout(r, Math.max(POST_ASSISTANT_MIN_DELAY_MS, POST_ASSISTANT_DELAY_MS / this.speed)));
    }

    if (cancelled()) return;
    this.currentIndex = index + 1;
    this.updateProgress();
  }

  private getRealTimeDelay(fromIndex: number, toIndex: number): number {
    if (!this.realTimeMode) return 0;
    const from = this.messages[fromIndex];
    const to = this.messages[toIndex];
    if (!from || !to || !from.timestamp || !to.timestamp) return 0;
    const delta = new Date(to.timestamp).getTime() - new Date(from.timestamp).getTime();
    return Math.min(REALTIME_MAX_DELAY_MS, Math.max(REALTIME_MIN_DELAY_MS, delta)) / this.speed;
  }

  private async playFrom(index: number, gen: number): Promise<void> {
    if (index >= this.messages.length) {
      this.playing = false;
      this.updatePlayButton();
      this.updateStatus('idle', 'Complete');
      return;
    }
    for (let i = index; i < this.messages.length; i++) {
      if (!this.playing || gen !== this.playGeneration) break;
      if (this.realTimeMode && i > index) {
        const delay = this.getRealTimeDelay(i - 1, i);
        if (delay > 0) {
          this.updateStatus('active', `Next in ${(delay / 1000).toFixed(1)}s...`);
          await new Promise((r) => setTimeout(r, delay));
          if (!this.playing || gen !== this.playGeneration) break;
        }
      }
      this.activeShowMessage = this.showMessage(i, gen);
      await this.activeShowMessage;
      this.activeShowMessage = null;
    }
  }

  async togglePlay(): Promise<void> {
    const gen = ++this.playGeneration;
    if (this.activeShowMessage) await this.activeShowMessage;
    if (gen !== this.playGeneration) return;
    this.playing = !this.playing;
    this.updatePlayButton();
    if (this.playing) {
      this.updateStatus('active', 'Playing...');
      this.renderer.enableAutoScroll();
      this.playFrom(this.currentIndex, gen).catch(() => {/* cancelled */});
    } else {
      this.updateStatus('paused', 'Paused');
    }
  }

  async step(): Promise<void> {
    const gen = ++this.playGeneration;
    if (this.activeShowMessage) await this.activeShowMessage;
    if (gen !== this.playGeneration) return;
    this.playing = true;
    this.updatePlayButton();
    this.renderer.enableAutoScroll();
    this.activeShowMessage = this.showMessage(this.currentIndex, gen);
    await this.activeShowMessage;
    this.activeShowMessage = null;
    if (gen === this.playGeneration) {
      this.playing = false;
      this.updatePlayButton();
      this.updateStatus('paused', 'Paused');
    }
  }

  slower(): void {
    if (this.speedIdx > 0) this.speedIdx--;
    this.speed = SPEEDS[this.speedIdx];
    this.speedDisplay.textContent = this.speed + 'x';
  }

  faster(): void {
    if (this.speedIdx < SPEEDS.length - 1) this.speedIdx++;
    this.speed = SPEEDS[this.speedIdx];
    this.speedDisplay.textContent = this.speed + 'x';
  }

  toggleRealtime(): void {
    this.realTimeMode = !this.realTimeMode;
    this.btnRealtime.classList.toggle('active', this.realTimeMode);
  }

  reset(): void {
    this.playGeneration++;
    this.messages = [];
    this.currentIndex = 0;
    this.transition(PlaybackState.Idle);
    this.updatePlayButton();
    this.updateProgress();
  }
}
