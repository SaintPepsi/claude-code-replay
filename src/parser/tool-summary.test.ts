import { getToolSummary, getToolCommand, isTaskTool } from './tool-summary';
import type { ContentBlock } from '../types';

function makeToolBlock(name: string, input: Record<string, unknown> = {}): ContentBlock {
  return { type: 'tool_use', name, input: input as any };
}

describe('getToolSummary', () => {
  it('returns description for Bash tool', () => {
    const block = makeToolBlock('Bash', { description: 'List files', command: 'ls -la' });
    expect(getToolSummary(block)).toBe('List files');
  });

  it('falls back to truncated command for Bash without description', () => {
    const block = makeToolBlock('Bash', { command: 'ls -la /some/path' });
    expect(getToolSummary(block)).toBe('ls -la /some/path');
  });

  it('truncates long Bash commands to 80 chars', () => {
    const longCmd = 'a'.repeat(100);
    const block = makeToolBlock('Bash', { command: longCmd });
    expect(getToolSummary(block)).toBe(longCmd.substring(0, 80));
  });

  it('returns file_path for Read tool', () => {
    const block = makeToolBlock('Read', { file_path: '/home/user/file.ts' });
    expect(getToolSummary(block)).toBe('/home/user/file.ts');
  });

  it('returns file_path for Write tool', () => {
    const block = makeToolBlock('Write', { file_path: '/home/user/out.ts' });
    expect(getToolSummary(block)).toBe('/home/user/out.ts');
  });

  it('returns file_path for Edit tool', () => {
    const block = makeToolBlock('Edit', { file_path: '/home/user/edit.ts' });
    expect(getToolSummary(block)).toBe('/home/user/edit.ts');
  });

  it('returns pattern and path for Grep tool', () => {
    const block = makeToolBlock('Grep', { pattern: 'TODO', path: 'src/' });
    expect(getToolSummary(block)).toBe('"TODO" src/');
  });

  it('returns pattern for Glob tool', () => {
    const block = makeToolBlock('Glob', { pattern: '**/*.ts' });
    expect(getToolSummary(block)).toBe('**/*.ts');
  });

  it('returns query for WebSearch tool', () => {
    const block = makeToolBlock('WebSearch', { query: 'vitest docs' });
    expect(getToolSummary(block)).toBe('vitest docs');
  });

  it('returns truncated url for WebFetch tool', () => {
    const block = makeToolBlock('WebFetch', { url: 'https://example.com/very/long/path' });
    expect(getToolSummary(block)).toBe('https://example.com/very/long/path');
  });

  it('truncates long WebFetch urls to 60 chars', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(100);
    const block = makeToolBlock('WebFetch', { url: longUrl });
    expect(getToolSummary(block)).toBe(longUrl.substring(0, 60));
  });

  it('returns subject for TaskCreate tool', () => {
    const block = makeToolBlock('TaskCreate', { subject: 'Fix the bug' });
    expect(getToolSummary(block)).toBe('Fix the bug');
  });

  it('returns taskId and status for TaskUpdate tool', () => {
    const block = makeToolBlock('TaskUpdate', { taskId: '42', status: 'completed' });
    expect(getToolSummary(block)).toBe('#42 completed');
  });

  it('returns empty string for unknown tools', () => {
    const block = makeToolBlock('UnknownTool', {});
    expect(getToolSummary(block)).toBe('');
  });

  it('handles missing input gracefully', () => {
    const block: ContentBlock = { type: 'tool_use', name: 'Bash' };
    expect(getToolSummary(block)).toBe('');
  });
});

describe('getToolCommand', () => {
  it('returns command for Bash tool', () => {
    const block = makeToolBlock('Bash', { command: 'npm test' });
    expect(getToolCommand(block)).toBe('npm test');
  });

  it('returns file_path for Read tool', () => {
    const block = makeToolBlock('Read', { file_path: '/home/user/file.ts' });
    expect(getToolCommand(block)).toBe('/home/user/file.ts');
  });

  it('returns file_path for Write tool', () => {
    const block = makeToolBlock('Write', { file_path: '/home/user/out.ts' });
    expect(getToolCommand(block)).toBe('/home/user/out.ts');
  });

  it('returns file_path and old_string preview for Edit tool', () => {
    const block = makeToolBlock('Edit', {
      file_path: '/home/user/edit.ts',
      old_string: 'const x = 1;',
    });
    const result = getToolCommand(block);
    expect(result).toContain('/home/user/edit.ts');
    expect(result).toContain('old: const x = 1;');
  });

  it('truncates long old_string in Edit to 100 chars', () => {
    const longStr = 'x'.repeat(200);
    const block = makeToolBlock('Edit', { file_path: '/f.ts', old_string: longStr });
    const result = getToolCommand(block);
    expect(result).toContain('old: ' + longStr.substring(0, 100));
    expect(result).not.toContain(longStr);
  });

  it('returns JSON stringified input for other tools', () => {
    const block = makeToolBlock('Grep', { pattern: 'TODO', path: 'src/' });
    const result = getToolCommand(block);
    expect(result).toBe(JSON.stringify({ pattern: 'TODO', path: 'src/' }, null, 2));
  });
});

describe('isTaskTool', () => {
  it('returns true for TaskCreate', () => {
    expect(isTaskTool('TaskCreate')).toBe(true);
  });

  it('returns true for TaskUpdate', () => {
    expect(isTaskTool('TaskUpdate')).toBe(true);
  });

  it('returns true for TaskList', () => {
    expect(isTaskTool('TaskList')).toBe(true);
  });

  it('returns true for TaskGet', () => {
    expect(isTaskTool('TaskGet')).toBe(true);
  });

  it('returns false for Bash', () => {
    expect(isTaskTool('Bash')).toBe(false);
  });

  it('returns false for Read', () => {
    expect(isTaskTool('Read')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isTaskTool(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isTaskTool('')).toBe(false);
  });
});
