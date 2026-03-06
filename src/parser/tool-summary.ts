import type { ContentBlock } from '../types';

export function getToolSummary(tool: ContentBlock): string {
  const input = tool.input || {};
  switch (tool.name) {
    case 'Bash': return input.description || input.command?.substring(0, 80) || '';
    case 'Read': return input.file_path || '';
    case 'Write': return input.file_path || '';
    case 'Edit': return input.file_path || '';
    case 'Grep': return `"${input.pattern || ''}" ${input.path || ''}`.trim();
    case 'Glob': return (input.pattern as string) || '';
    case 'WebSearch': return input.query || '';
    case 'WebFetch': return input.url?.substring(0, 60) || '';
    case 'TaskCreate': return input.subject?.substring(0, 60) || '';
    case 'TaskUpdate': return `#${input.taskId} ${input.status || ''}`;
    default: return '';
  }
}

export function getToolCommand(tool: ContentBlock): string {
  const input = tool.input || {};
  if (tool.name === 'Bash' && input.command) return input.command;
  if (tool.name === 'Read') return input.file_path || '';
  if (tool.name === 'Write') return input.file_path || '';
  if (tool.name === 'Edit') return `${input.file_path || ''}\n${input.old_string ? 'old: ' + input.old_string.substring(0, 100) : ''}`;
  return JSON.stringify(input, null, 2);
}

export function isTaskTool(name: string | undefined): boolean {
  return ['TaskCreate', 'TaskUpdate', 'TaskList', 'TaskGet'].includes(name || '');
}
