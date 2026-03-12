# Claude Code Replay

Replay Claude Code conversations from JSONL logs, rendered to look exactly like the real Claude Code terminal.

**[Live Demo](https://saintpepsi.github.io/claude-code-replay/)**

## Usage

Visit the [live demo](https://saintpepsi.github.io/claude-code-replay/) and drop a `.jsonl` conversation file onto it. That's it.

### Where to find conversation logs

Claude Code stores conversation logs as JSONL files at:

```
~/.claude/projects/<project-path>/<session-id>.jsonl
```

## Controls

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| Right Arrow | Step (one message) |
| Up Arrow | Speed up |
| Down Arrow | Slow down |
| T | Toggle real-time mode |

**Real-time mode** uses the actual timestamps from the conversation to pace the replay. Messages appear with the same delays they had in the original session (capped at 30s between messages).

## Features

- Bottom-aligned chat (content starts at bottom, scrolls up like a real terminal)
- User messages with `>` prompt and blue background
- Assistant text with bullet prefix
- Tool calls shown as `ToolName(summary)` with expandable body
- Tool results with connector and expandable output
- TaskCreate/TaskUpdate render as a live task list widget (checkboxes, strikethrough for completed)
- Status lines between turns
- Markdown rendering (code blocks, headers, lists, tables, links)
- Credential redaction (API keys, SSH keys)
- Speed control: 0.25x to 16x
- Real-time mode: replay at original conversation pace
- Auto-play on load setting (persisted in localStorage)

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/SaintPepsi/claude-code-replay.git
cd claude-code-replay
npm install
```

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Type-check and build for production
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:watch   # Run unit tests in watch mode
npm run test:e2e     # Run Playwright e2e tests
```

### Tech Stack

- **Vite** + **TypeScript** (vanilla, no framework)
- **Vitest** for unit tests
- **Playwright** for e2e tests
- **GitHub Pages** for deployment (auto-deploys on push to main)

### Project Structure

```
src/
  main.ts                  # App entry point and composition root
  types.ts                 # Shared type definitions
  config.ts                # Configuration constants
  components/              # UI components
    playback-controller.ts # Playback state machine and controls
    chat-renderer.ts       # Message rendering orchestrator
    file-upload.ts         # File upload and drag-and-drop
    task-manager.ts        # Task list widget
    animation-engine.ts    # Message animation timing
    scroll-manager.ts      # Auto-scroll behavior
    keyboard-handler.ts    # Keyboard shortcut bindings
    progress-bar.ts        # Playback progress bar
    status-display.ts      # Status bar display
    settings.ts            # User settings (auto-play)
    renderers/             # Message type renderers
  parser/
    jsonl-parser.ts        # JSONL conversation parser
    tool-summary.ts        # Tool call summarization
  utils/
    markdown.ts            # Markdown to HTML renderer
    escHtml.ts             # HTML escaping
    redact.ts              # Credential redaction
    dom.ts                 # DOM helper utilities
    result.ts              # Result type for error handling
  styles/                  # CSS modules
e2e/                       # Playwright e2e tests
```

## Privacy

Conversation logs may contain API keys and credentials. The replay tool redacts common patterns (`sk-ant-*`, `sk-*`, `AAAA*` SSH keys) but you should review files before sharing.

## License

MIT
