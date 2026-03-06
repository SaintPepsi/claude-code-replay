import { parseJSONLSafe } from '../parser/jsonl-parser';
import type { ParsedConversation } from '../types';

export type FileLoadCallback = (result: ParsedConversation) => void;

export class FileUpload {
  private dropZone: HTMLElement;
  private fileInput: HTMLInputElement;
  private onLoad: FileLoadCallback;

  constructor(dropZone: HTMLElement, fileInput: HTMLInputElement, onLoad: FileLoadCallback) {
    this.dropZone = dropZone;
    this.fileInput = fileInput;
    this.onLoad = onLoad;

    this.dropZone.onclick = () => this.fileInput.click();
    this.dropZone.ondragover = (e) => { e.preventDefault(); this.dropZone.classList.add('drag-over'); };
    this.dropZone.ondragleave = () => { this.dropZone.classList.remove('drag-over'); };
    this.dropZone.ondrop = (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      if (e.dataTransfer?.files[0]) this.loadFile(e.dataTransfer.files[0]);
    };
    this.fileInput.onchange = () => {
      if (this.fileInput.files?.[0]) this.loadFile(this.fileInput.files[0]);
    };
  }

  private loadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;
      const result = parseJSONLSafe(text);
      if (result.ok) {
        this.onLoad(result.value);
      } else {
        console.error('Failed to parse JSONL:', result.error);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file:', file.name);
    };
    reader.readAsText(file);
  }
}
