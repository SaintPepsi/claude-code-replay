import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager } from './task-manager';
import type { ContentBlock } from '../types';

describe('TaskManager', () => {
  let panel: HTMLElement;
  let tm: TaskManager;

  beforeEach(() => {
    panel = document.createElement('div');
    tm = new TaskManager(panel);
  });

  it('constructor initializes with empty state', () => {
    expect(tm.size).toBe(0);
    expect(panel.innerHTML).toBe('');
    expect(panel.classList.contains('visible')).toBe(false);
  });

  it('handleTaskTool with TaskCreate adds a task', () => {
    const block: ContentBlock = {
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Fix bug', activeForm: 'Fixing bug' },
    };
    tm.handleTaskTool(block);
    expect(tm.size).toBe(1);
    expect(panel.classList.contains('visible')).toBe(true);
  });

  it('handleTaskTool with TaskUpdate updates status', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Task A' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'in_progress' },
    });
    expect(tm.size).toBe(1);
    // The task should render with in-progress icon
    expect(panel.innerHTML).toContain('◐');
  });

  it('handleTaskTool with TaskUpdate and status=deleted removes task', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'To delete' },
    });
    expect(tm.size).toBe(1);

    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'deleted' },
    });
    expect(tm.size).toBe(0);
    expect(panel.classList.contains('visible')).toBe(false);
  });

  it('renderTaskList shows visible panel when tasks exist', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Something' },
    });
    expect(panel.classList.contains('visible')).toBe(true);
    expect(panel.innerHTML).not.toBe('');
  });

  it('renderTaskList hides panel when no tasks', () => {
    // Add then remove
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Temp' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'deleted' },
    });
    expect(panel.classList.contains('visible')).toBe(false);
  });

  it('renderTaskList shows in-progress icon (◐)', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'WIP task' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'in_progress' },
    });
    expect(panel.innerHTML).toContain('◐');
    expect(panel.innerHTML).toContain('in-progress');
  });

  it('renderTaskList shows pending icon (□)', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Pending task' },
    });
    expect(panel.innerHTML).toContain('□');
    expect(panel.innerHTML).toContain('pending');
  });

  it('renderTaskList shows completed icon (✓)', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Done task' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'completed' },
    });
    expect(panel.innerHTML).toContain('✓');
    expect(panel.innerHTML).toContain('completed');
  });

  it('reset clears all state', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Task 1' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Task 2' },
    });
    expect(tm.size).toBe(2);

    tm.reset();
    expect(tm.size).toBe(0);
    expect(panel.innerHTML).toBe('');
    expect(panel.classList.contains('visible')).toBe(false);
  });

  it('handleTaskTool with TaskUpdate updates activeForm', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Build feature', activeForm: 'Building feature' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'in_progress', activeForm: 'Working on feature' },
    });
    // The header should display the updated activeForm
    expect(panel.innerHTML).toContain('Working on feature');
  });

  it('handleTaskTool ignores TaskUpdate for non-existent task', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '999', status: 'completed' },
    });
    expect(tm.size).toBe(0);
  });

  it('size property returns correct count', () => {
    expect(tm.size).toBe(0);
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'A' },
    });
    expect(tm.size).toBe(1);
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'B' },
    });
    expect(tm.size).toBe(2);
  });

  it('renderTaskList shows overflow count when more than 8 completed tasks', () => {
    // Create and complete 10 tasks
    for (let i = 1; i <= 10; i++) {
      tm.handleTaskTool({
        type: 'tool_use',
        name: 'TaskCreate',
        input: { subject: `Task ${i}` },
      });
      tm.handleTaskTool({
        type: 'tool_use',
        name: 'TaskUpdate',
        input: { taskId: String(i), status: 'completed' },
      });
    }
    expect(panel.innerHTML).toContain('+2 completed');
  });

  it('handleTaskTool with TaskUpdate updates subject', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Original' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', subject: 'Updated' },
    });
    expect(panel.innerHTML).toContain('Updated');
    expect(panel.innerHTML).not.toContain('Original');
  });

  it('handleTaskTool with TaskList/TaskGet still re-renders', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Existing' },
    });
    // TaskList should just trigger a re-render, not crash
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskList',
      input: {},
    });
    expect(panel.innerHTML).toContain('Existing');
  });

  it('displays header text from activeForm of in-progress task', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Fix bug', activeForm: 'Fixing bug' },
    });
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskUpdate',
      input: { taskId: '1', status: 'in_progress' },
    });
    const header = panel.querySelector('.task-header-text') as HTMLElement;
    expect(header).not.toBeNull();
    expect(header.textContent).toBe('Fixing bug');
  });

  it('does not show header when no task is in progress', () => {
    tm.handleTaskTool({
      type: 'tool_use',
      name: 'TaskCreate',
      input: { subject: 'Pending task' },
    });
    const header = panel.querySelector('.task-header-text');
    expect(header).toBeNull();
  });
});
