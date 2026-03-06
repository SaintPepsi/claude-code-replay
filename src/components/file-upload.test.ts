import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileUpload } from './file-upload';
import type { FileLoadCallback } from './file-upload';
import type { ParsedConversation } from '../types';

// Mock the parseJSONLSafe module
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockParseJSONLSafe = vi.fn((_text: string): any => ({
  ok: true,
  value: {
    messages: [{ type: 'user' as const, text: _text, timestamp: '' }],
    sessionInfo: {},
  },
}));

vi.mock('../parser/jsonl-parser', () => ({
  parseJSONLSafe: (...args: unknown[]) => mockParseJSONLSafe(...(args as [string])),
}));

function createDropEvent(type: string, file?: File): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  if (file) {
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [file] },
    });
  }
  Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
  return event;
}

describe('FileUpload', () => {
  let dropZone: HTMLElement;
  let fileInput: HTMLInputElement;
  let onLoad: FileLoadCallback;
  beforeEach(() => {
    dropZone = document.createElement('div');
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    onLoad = vi.fn();
    new FileUpload(dropZone, fileInput, onLoad);
  });

  it('constructor sets up click handler on dropZone', () => {
    const clickSpy = vi.spyOn(fileInput, 'click');
    dropZone.click();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('drop event calls loadFile with dropped file', async () => {
    const fileContent = '{"type":"user"}';
    const file = new File([fileContent], 'test.jsonl', { type: 'text/plain' });

    const dropEvent = createDropEvent('drop', file);
    dropZone.ondrop!(dropEvent as DragEvent);

    // Wait for FileReader to complete
    await new Promise((r) => setTimeout(r, 50));

    expect(onLoad).toHaveBeenCalled();
    const result = (onLoad as ReturnType<typeof vi.fn>).mock.calls[0][0] as ParsedConversation;
    expect(result.messages).toBeDefined();
  });

  it('dragover adds drag-over class', () => {
    const event = createDropEvent('dragover');
    dropZone.ondragover!(event as DragEvent);
    expect(dropZone.classList.contains('drag-over')).toBe(true);
  });

  it('dragleave removes drag-over class', () => {
    dropZone.classList.add('drag-over');
    const event = createDropEvent('dragleave');
    dropZone.ondragleave!(event as DragEvent);
    expect(dropZone.classList.contains('drag-over')).toBe(false);
  });

  it('file input change triggers loadFile', async () => {
    const fileContent = '{"type":"assistant"}';
    const file = new File([fileContent], 'data.jsonl', { type: 'text/plain' });

    // Manually set files property
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: true,
      configurable: true,
    });

    // Trigger onchange directly
    fileInput.onchange!(new Event('change'));

    // Wait for FileReader
    await new Promise((r) => setTimeout(r, 50));

    expect(onLoad).toHaveBeenCalled();
  });

  it('does not call onLoad when parsing fails', async () => {
    mockParseJSONLSafe.mockReturnValueOnce({ ok: false as const, error: 'parse error' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const fileContent = 'invalid content';
    const file = new File([fileContent], 'bad.jsonl', { type: 'text/plain' });

    const dropEvent = createDropEvent('drop', file);
    dropZone.ondrop!(dropEvent as DragEvent);

    await new Promise((r) => setTimeout(r, 50));

    expect(onLoad).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse JSONL:', 'parse error');
    consoleSpy.mockRestore();
  });

  it('onLoad callback is called with parsed result', async () => {
    const fileContent = 'some jsonl content';
    const file = new File([fileContent], 'test.jsonl', { type: 'text/plain' });

    const dropEvent = createDropEvent('drop', file);
    dropZone.ondrop!(dropEvent as DragEvent);

    await new Promise((r) => setTimeout(r, 50));

    expect(onLoad).toHaveBeenCalledTimes(1);
    const result = (onLoad as ReturnType<typeof vi.fn>).mock.calls[0][0] as ParsedConversation;
    expect(result).toHaveProperty('messages');
    expect(result).toHaveProperty('sessionInfo');
  });
});
