# Claude Code Replay

Replay Claude Code conversations from JSONL logs, rendered to look exactly like the real Claude Code terminal.

## Usage

Open `index.html` in a browser and drop a `.jsonl` conversation file onto it. That's it.

## Where to find conversation logs

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

## Privacy

Conversation logs may contain API keys and credentials. The replay tool redacts common patterns (`sk-ant-*`, `sk-*`, `AAAA*` SSH keys) but you should review files before sharing.

## License

MIT
