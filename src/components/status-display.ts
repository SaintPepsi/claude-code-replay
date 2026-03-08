import { SPEEDS } from '../config';

export type StatusState = 'active' | 'paused' | 'idle';

/**
 * StatusDisplay — encapsulates all playback chrome DOM updates (REVIEW-9).
 * Extracted from PlaybackController to reduce its DOM coupling.
 */
export class StatusDisplay {
  private progressFill: HTMLElement;
  private msgCounter: HTMLElement;
  private statusDot: HTMLElement;
  private statusTextEl: HTMLElement;
  private speedDisplay: HTMLElement;
  private btnPlay: HTMLButtonElement;
  private btnRealtime: HTMLButtonElement;

  constructor(elements: {
    progressFill: HTMLElement;
    msgCounter: HTMLElement;
    statusDot: HTMLElement;
    statusTextEl: HTMLElement;
    speedDisplay: HTMLElement;
    btnPlay: HTMLButtonElement;
    btnRealtime: HTMLButtonElement;
  }) {
    this.progressFill = elements.progressFill;
    this.msgCounter = elements.msgCounter;
    this.statusDot = elements.statusDot;
    this.statusTextEl = elements.statusTextEl;
    this.speedDisplay = elements.speedDisplay;
    this.btnPlay = elements.btnPlay;
    this.btnRealtime = elements.btnRealtime;
  }

  updateProgress(currentIndex: number, total: number): void {
    const pct = total > 0 ? (currentIndex / total) * 100 : 0;
    this.progressFill.style.width = pct + '%';
    this.msgCounter.textContent = `${currentIndex}/${total}`;
  }

  updateStatus(state: StatusState, text: string): void {
    this.statusDot.className = 'status-dot ' + state;
    this.statusTextEl.textContent = text;
  }

  updatePlayButton(playing: boolean): void {
    this.btnPlay.innerHTML = playing ? '&#10074;&#10074; Pause' : '&#9654; Play';
    this.btnPlay.classList.toggle('active', playing);
  }

  updateSpeed(speedIdx: number): void {
    this.speedDisplay.textContent = SPEEDS[speedIdx] + 'x';
  }

  toggleRealtime(active: boolean): void {
    this.btnRealtime.classList.toggle('active', active);
  }
}
