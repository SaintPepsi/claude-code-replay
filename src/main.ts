import './styles/variables.css';
import './styles/base.css';
import './styles/upload.css';
import './styles/controls.css';
import './styles/chat.css';
import './styles/tools.css';
import './styles/status.css';
import './styles/tasks.css';

import type { ParsedConversation } from './types';
import { TaskManager } from './components/task-manager';
import { ChatRenderer } from './components/chat-renderer';
import { PlaybackController } from './components/playback-controller';
import { FileUpload } from './components/file-upload';
import { ProgressBar } from './components/progress-bar';
import { KeyboardHandler } from './components/keyboard-handler';

// --- DOM Elements ---
const uploadScreen = document.getElementById('upload-screen')!;
const replayScreen = document.getElementById('replay-screen')!;
const chat = document.getElementById('chat')!;
const chatInner = document.getElementById('chat-inner')!;
const taskPanel = document.getElementById('task-panel')!;
const dropZone = document.getElementById('drop-zone')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;

const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
const btnStep = document.getElementById('btn-step') as HTMLButtonElement;
const btnSlower = document.getElementById('btn-slower') as HTMLButtonElement;
const btnFaster = document.getElementById('btn-faster') as HTMLButtonElement;
const btnRealtime = document.getElementById('btn-realtime') as HTMLButtonElement;
const newFileBtn = document.getElementById('new-file-btn') as HTMLButtonElement;

const progressBarEl = document.getElementById('progress-bar')!;
const progressFill = document.getElementById('progress-fill')!;
const progressTicksEl = document.getElementById('progress-ticks')!;
const msgCounter = document.getElementById('msg-counter')!;
const statusDot = document.getElementById('status-dot')!;
const statusTextEl = document.getElementById('status-text')!;
const speedDisplay = document.getElementById('speed-display')!;
const statusModel = document.getElementById('status-model')!;
const statusBranch = document.getElementById('status-branch')!;

// --- Initialize Components ---
const taskManager = new TaskManager(taskPanel);
const renderer = new ChatRenderer(chat, chatInner, taskManager);
const progressBar = new ProgressBar(progressBarEl, progressTicksEl);

const playback = new PlaybackController(renderer, taskManager, {
  progressFill,
  msgCounter,
  statusDot,
  statusTextEl,
  speedDisplay,
  btnPlay,
  btnRealtime,
});

// --- File Loading ---
function handleFileLoad(result: ParsedConversation): void {
  playback.setMessages(result.messages);

  uploadScreen.style.display = 'none';
  replayScreen.style.display = 'flex';

  const info = result.sessionInfo;
  const assistantWithModel = result.messages.find(
    (m): m is import('./types').AssistantMessage => m.type === 'assistant' && !!m.model
  );
  statusModel.textContent = assistantWithModel?.model || '';
  statusBranch.textContent = info.gitBranch || '';

  progressBar.buildTicks(result.messages);
  statusTextEl.textContent = `${result.messages.length} messages loaded`;
}

new FileUpload(dropZone, fileInput, handleFileLoad);

// --- Controls ---
btnPlay.onclick = () => playback.togglePlay();
btnStep.onclick = () => playback.step();
btnSlower.onclick = () => playback.slower();
btnFaster.onclick = () => playback.faster();
btnRealtime.onclick = () => playback.toggleRealtime();

newFileBtn.onclick = () => {
  replayScreen.style.display = 'none';
  uploadScreen.style.display = 'flex';
  renderer.clear();
  playback.reset();
  taskManager.reset();
  progressBar.clearTicks();
};

// --- Progress bar interaction ---
let dragging = false;

progressBarEl.addEventListener('mousedown', (e) => {
  if (playback.getMessageCount() === 0) return;
  dragging = true;
  progressBar.setDragging(true);
  playback.seekTo(playback.getProgressIndex(e, progressBarEl));
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  playback.seekTo(playback.getProgressIndex(e, progressBarEl));
});

document.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  progressBar.setDragging(false);
});

// --- Keyboard shortcuts ---
const keyboard = new KeyboardHandler(() => replayScreen.style.display !== 'none');
keyboard.bind('Space', () => btnPlay.click());
keyboard.bind('ArrowRight', () => btnStep.click());
keyboard.bind('ArrowUp', () => btnFaster.click());
keyboard.bind('ArrowDown', () => btnSlower.click());
keyboard.bind('KeyT', () => btnRealtime.click());
