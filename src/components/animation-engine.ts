import { TYPING_CHUNK_SIZE, TYPING_CHAR_DELAY_MS, TYPING_POST_DELAY_MS } from '../config';

/**
 * AnimationEngine — encapsulates character-by-character typing reveal animation (TASK-208).
 * Extracted from PlaybackController to separate animation concerns from playback sequencing.
 */
export class AnimationEngine {
  private reducedMotion: boolean;

  constructor() {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  /**
   * Animate typing of text character-by-character into a target element.
   * Returns when the animation completes or is cancelled.
   */
  async typeText(
    textSpan: HTMLElement,
    text: string,
    speed: number,
    cancelled: () => boolean,
    onFrame?: () => void,
  ): Promise<boolean> {
    if (this.reducedMotion) {
      textSpan.textContent = text;
      onFrame?.();
      return !cancelled();
    }

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    textSpan.appendChild(cursor);

    let interrupted = false;
    for (let i = 0; i < text.length; i += TYPING_CHUNK_SIZE) {
      if (cancelled()) {
        interrupted = true;
        break;
      }
      textSpan.insertBefore(
        document.createTextNode(text.slice(i, i + TYPING_CHUNK_SIZE)),
        cursor,
      );
      onFrame?.();
      await new Promise((r) => setTimeout(r, TYPING_CHAR_DELAY_MS / speed));
    }

    cursor.remove();

    if (interrupted) {
      textSpan.textContent = text;
      onFrame?.();
      return false;
    }

    if (cancelled()) return false;
    await new Promise((r) => setTimeout(r, TYPING_POST_DELAY_MS / speed));
    return !cancelled();
  }
}
