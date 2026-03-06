/**
 * KeyboardHandler — SRP extraction of keyboard shortcut logic.
 * Uses command pattern for mapping keys to actions.
 */

export type KeyAction = () => void;

export interface KeyBinding {
  code: string;
  action: KeyAction;
}

export class KeyboardHandler {
  private bindings: KeyBinding[] = [];
  private guardFn: () => boolean;
  private handleKeyDown: (e: KeyboardEvent) => void;

  constructor(guardFn: () => boolean) {
    this.guardFn = guardFn;

    this.handleKeyDown = (e: KeyboardEvent) => {
      if (!this.guardFn()) return;
      for (const binding of this.bindings) {
        if (e.code === binding.code) {
          e.preventDefault();
          binding.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', this.handleKeyDown);
  }

  bind(code: string, action: KeyAction): void {
    this.bindings.push({ code, action });
  }

  unbindAll(): void {
    this.bindings = [];
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.bindings = [];
  }
}
