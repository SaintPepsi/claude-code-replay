const STORAGE_KEY = 'claude-replay-settings';

export interface AppSettings {
  autoPlayOnLoad: boolean;
}

const DEFAULTS: AppSettings = {
  autoPlayOnLoad: false,
};

export class Settings {
  private settings: AppSettings;

  constructor(private storage: Storage = localStorage) {
    this.settings = { ...DEFAULTS };
    this.load();
  }

  get autoPlayOnLoad(): boolean {
    return this.settings.autoPlayOnLoad;
  }

  set autoPlayOnLoad(value: boolean) {
    this.settings.autoPlayOnLoad = value;
    this.save();
  }

  private load(): void {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.autoPlayOnLoad === 'boolean') {
        this.settings.autoPlayOnLoad = parsed.autoPlayOnLoad;
      }
    } catch {
      // Corrupted data — use defaults
    }
  }

  private save(): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }
}
