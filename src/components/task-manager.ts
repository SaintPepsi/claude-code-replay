import type { ContentBlock, TaskItem } from '../types';
import { escHtml } from '../utils/escHtml';
import { TASK_SHOW_MAX } from '../config';

export class TaskManager {
  private taskState: Map<string, TaskItem> = new Map();
  private taskCounter = 0;
  private taskPanel: HTMLElement;

  constructor(taskPanel: HTMLElement) {
    this.taskPanel = taskPanel;
  }

  handleTaskTool(block: ContentBlock): void {
    const input = block.input;
    if (!input) return;

    if (block.name === 'TaskCreate') {
      this.taskCounter++;
      const id = String(this.taskCounter);
      const subject = typeof input.subject === 'string' ? input.subject : 'Untitled';
      const activeForm = typeof input.activeForm === 'string' ? input.activeForm : '';
      this.taskState.set(id, { subject, status: 'pending', activeForm });
    } else if (block.name === 'TaskUpdate') {
      const taskId = typeof input.taskId === 'string' ? input.taskId : '';
      if (this.taskState.has(taskId)) {
        const task = this.taskState.get(taskId)!;
        if (input.status === 'deleted') {
          this.taskState.delete(taskId);
        } else {
          if (typeof input.status === 'string') task.status = input.status as TaskItem['status'];
          if (typeof input.subject === 'string') task.subject = input.subject;
          if (typeof input.activeForm === 'string') task.activeForm = input.activeForm;
        }
      }
    }

    this.renderTaskList();
  }

  renderTaskList(): void {
    if (this.taskState.size === 0) {
      this.taskPanel.classList.remove('visible');
      return;
    }

    const tasks = Array.from(this.taskState.values());
    const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const completed = tasks.filter((t) => t.status === 'completed');

    const active = tasks.find((t) => t.status === 'in_progress');
    const headerText = active?.activeForm || active?.subject || '';

    let html = '';
    if (headerText) {
      html += `<div class="task-list-header"><span class="task-header-icon">✱</span> <span class="task-header-text">${escHtml(headerText)}</span></div>`;
    }
    html += '<div class="task-list-items">';

    for (const t of pending) {
      const icon = t.status === 'in_progress' ? '◐' : '□';
      const cls = t.status === 'in_progress' ? 'in-progress' : 'pending';
      html += `<div class="task-item ${cls}"><span class="task-check">${icon}</span><span class="task-subject">${escHtml(t.subject)}</span></div>`;
    }

    const visible = completed.slice(0, TASK_SHOW_MAX);
    const hidden = completed.length - TASK_SHOW_MAX;

    for (const t of visible) {
      html += `<div class="task-item completed"><span class="task-check">✓</span><span class="task-subject">${escHtml(t.subject)}</span></div>`;
    }

    if (hidden > 0) {
      html += `<div class="task-overflow">… +${hidden} completed</div>`;
    }

    html += '</div>';
    this.taskPanel.innerHTML = html;
    this.taskPanel.classList.add('visible');
  }

  reset(): void {
    this.taskState.clear();
    this.taskCounter = 0;
    this.taskPanel.innerHTML = '';
    this.taskPanel.classList.remove('visible');
  }

  get size(): number {
    return this.taskState.size;
  }
}
