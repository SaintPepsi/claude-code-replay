import { describe, it, expect, beforeEach } from 'vitest';
import { StatusDisplay } from './status-display';

describe('StatusDisplay', () => {
  let display: StatusDisplay;
  let elements: {
    progressFill: HTMLElement;
    msgCounter: HTMLElement;
    statusDot: HTMLElement;
    statusTextEl: HTMLElement;
    speedDisplay: HTMLElement;
    btnPlay: HTMLButtonElement;
    btnRealtime: HTMLButtonElement;
  };

  beforeEach(() => {
    elements = {
      progressFill: document.createElement('div'),
      msgCounter: document.createElement('div'),
      statusDot: document.createElement('div'),
      statusTextEl: document.createElement('div'),
      speedDisplay: document.createElement('div'),
      btnPlay: document.createElement('button'),
      btnRealtime: document.createElement('button'),
    };
    display = new StatusDisplay(elements);
  });

  describe('updateProgress', () => {
    it('sets progress fill width as percentage', () => {
      display.updateProgress(5, 10);
      expect(elements.progressFill.style.width).toBe('50%');
    });

    it('sets counter text', () => {
      display.updateProgress(3, 20);
      expect(elements.msgCounter.textContent).toBe('3/20');
    });

    it('handles zero total', () => {
      display.updateProgress(0, 0);
      expect(elements.progressFill.style.width).toBe('0%');
      expect(elements.msgCounter.textContent).toBe('0/0');
    });
  });

  describe('updateStatus', () => {
    it('sets status dot class', () => {
      display.updateStatus('active', 'Playing...');
      expect(elements.statusDot.className).toBe('status-dot active');
    });

    it('sets status text', () => {
      display.updateStatus('paused', 'Paused');
      expect(elements.statusTextEl.textContent).toBe('Paused');
    });

    it('sets idle state', () => {
      display.updateStatus('idle', 'Complete');
      expect(elements.statusDot.className).toBe('status-dot idle');
    });
  });

  describe('updatePlayButton', () => {
    it('shows pause when playing', () => {
      display.updatePlayButton(true);
      expect(elements.btnPlay.innerHTML).toContain('Pause');
      expect(elements.btnPlay.classList.contains('active')).toBe(true);
    });

    it('shows play when paused', () => {
      display.updatePlayButton(false);
      expect(elements.btnPlay.innerHTML).toContain('Play');
      expect(elements.btnPlay.classList.contains('active')).toBe(false);
    });
  });

  describe('updateSpeed', () => {
    it('displays speed value', () => {
      display.updateSpeed(2); // SPEEDS[2] = 1
      expect(elements.speedDisplay.textContent).toBe('1x');
    });

    it('displays fast speed', () => {
      display.updateSpeed(5); // SPEEDS[5] = 8
      expect(elements.speedDisplay.textContent).toBe('8x');
    });
  });

  describe('toggleRealtime', () => {
    it('adds active class when enabled', () => {
      display.toggleRealtime(true);
      expect(elements.btnRealtime.classList.contains('active')).toBe(true);
    });

    it('removes active class when disabled', () => {
      display.toggleRealtime(true);
      display.toggleRealtime(false);
      expect(elements.btnRealtime.classList.contains('active')).toBe(false);
    });
  });
});
