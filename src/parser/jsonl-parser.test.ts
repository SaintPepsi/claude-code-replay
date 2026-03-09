import { parseJSONL } from './jsonl-parser';
import type { AssistantMessage, UserMessage } from '../types';

describe('parseJSONL', () => {
  describe('user messages', () => {
    it('parses valid JSONL with user string messages', () => {
      const input = JSON.stringify({
        type: 'user',
        message: { content: 'Hello world' },
        timestamp: '2024-01-01T00:00:00Z',
        uuid: 'u1',
      });
      const result = parseJSONL(input);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].type).toBe('user');
      const msg = result.messages[0] as UserMessage;
      expect(msg.text).toBe('Hello world');
    });

    it('skips user messages with only tool_result content arrays', () => {
      const input = JSON.stringify({
        type: 'user',
        message: {
          content: [
            { type: 'tool_result', tool_use_id: 't1', content: 'output' },
          ],
        },
        timestamp: '2024-01-01T00:00:00Z',
      });
      const result = parseJSONL(input);
      const userMsgs = result.messages.filter((m) => m.type === 'user');
      expect(userMsgs).toHaveLength(0);
    });
  });

  describe('assistant messages', () => {
    it('parses assistant messages with text blocks', () => {
      const input = JSON.stringify({
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: 'I will help you.' }],
          model: 'claude-3',
        },
        timestamp: '2024-01-01T00:00:01Z',
        uuid: 'a1',
        requestId: 'r1',
      });
      const result = parseJSONL(input);
      expect(result.messages).toHaveLength(1);
      const msg = result.messages[0] as AssistantMessage;
      expect(msg.type).toBe('assistant');
      expect(msg.content[0].text).toBe('I will help you.');
      expect(msg.model).toBe('claude-3');
    });

    it('parses assistant messages with tool_use blocks', () => {
      const input = JSON.stringify({
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', id: 'tu1', name: 'Bash', input: { command: 'ls' } },
          ],
        },
        timestamp: '2024-01-01T00:00:01Z',
        uuid: 'a1',
        requestId: 'r1',
      });
      const result = parseJSONL(input);
      const msg = result.messages[0] as AssistantMessage;
      expect(msg.content[0].type).toBe('tool_use');
      expect(msg.content[0].name).toBe('Bash');
      expect(msg.content[0].input?.command).toBe('ls');
    });
  });

  describe('tool result mapping', () => {
    it('links tool results to tool_use blocks by id', () => {
      const lines = [
        JSON.stringify({
          type: 'user',
          message: {
            content: [
              { type: 'tool_result', tool_use_id: 'tu1', content: 'file.txt' },
            ],
          },
          toolUseResult: { stdout: 'file.txt\n', stderr: '' },
          timestamp: '2024-01-01T00:00:02Z',
        }),
        JSON.stringify({
          type: 'assistant',
          message: {
            content: [
              { type: 'tool_use', id: 'tu1', name: 'Bash', input: { command: 'ls' } },
            ],
          },
          timestamp: '2024-01-01T00:00:01Z',
          requestId: 'r1',
        }),
      ].join('\n');

      const result = parseJSONL(lines);
      const assistantMsg = result.messages.find((m): m is AssistantMessage => m.type === 'assistant');
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg!.content[0].result).toBeTruthy();
      expect(assistantMsg!.content[0].result?.content).toBe('file.txt');
      expect(assistantMsg!.content[0].result?.stdout).toBe('file.txt\n');
    });

    it('sets result to null when no matching tool result exists', () => {
      const input = JSON.stringify({
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', id: 'tu-missing', name: 'Read', input: { file_path: '/x' } },
          ],
        },
        timestamp: '2024-01-01T00:00:01Z',
        requestId: 'r1',
      });
      const result = parseJSONL(input);
      const msg = result.messages[0] as AssistantMessage;
      expect(msg.content[0].result).toBeNull();
    });
  });

  describe('malformed lines', () => {
    it('skips malformed JSON lines gracefully', () => {
      const lines = [
        'not valid json',
        JSON.stringify({
          type: 'user',
          message: { content: 'valid' },
          timestamp: '2024-01-01T00:00:00Z',
        }),
        '{broken',
      ].join('\n');
      const result = parseJSONL(lines);
      expect(result.messages).toHaveLength(1);
    });
  });

  describe('session info extraction', () => {
    it('extracts sessionId and gitBranch from first entry with sessionId', () => {
      const lines = [
        JSON.stringify({
          type: 'user',
          message: { content: 'hi' },
          timestamp: '2024-01-01T00:00:00Z',
          sessionId: 'sess-123',
          gitBranch: 'main',
          version: '1.0',
          cwd: '/home/user',
        }),
        JSON.stringify({
          type: 'user',
          message: { content: 'bye' },
          timestamp: '2024-01-01T00:00:01Z',
          sessionId: 'sess-456',
          gitBranch: 'dev',
        }),
      ].join('\n');

      const result = parseJSONL(lines);
      expect(result.sessionInfo.sessionId).toBe('sess-123');
      expect(result.sessionInfo.gitBranch).toBe('main');
      expect(result.sessionInfo.version).toBe('1.0');
      expect(result.sessionInfo.cwd).toBe('/home/user');
    });

    it('returns empty sessionInfo when no entries have sessionId', () => {
      const input = JSON.stringify({
        type: 'user',
        message: { content: 'hello' },
        timestamp: '2024-01-01T00:00:00Z',
      });
      const result = parseJSONL(input);
      expect(result.sessionInfo.sessionId).toBeUndefined();
    });
  });

  describe('message deduplication', () => {
    it('extends text blocks when new text starts with existing text', () => {
      const lines = [
        JSON.stringify({
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'Hello' }] },
          timestamp: '2024-01-01T00:00:01Z',
          requestId: 'r1',
        }),
        JSON.stringify({
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'Hello, world!' }] },
          timestamp: '2024-01-01T00:00:02Z',
          requestId: 'r1',
        }),
      ].join('\n');

      const result = parseJSONL(lines);
      const assistantMsgs = result.messages.filter((m): m is AssistantMessage => m.type === 'assistant');
      expect(assistantMsgs).toHaveLength(1);
      expect(assistantMsgs[0].content).toHaveLength(1);
      expect(assistantMsgs[0].content[0].text).toBe('Hello, world!');
    });

    it('deduplicates tool_use blocks by id', () => {
      const lines = [
        JSON.stringify({
          type: 'assistant',
          message: {
            content: [{ type: 'tool_use', id: 'tu1', name: 'Bash', input: { command: 'ls' } }],
          },
          timestamp: '2024-01-01T00:00:01Z',
          requestId: 'r1',
        }),
        JSON.stringify({
          type: 'assistant',
          message: {
            content: [{ type: 'tool_use', id: 'tu1', name: 'Bash', input: { command: 'ls' } }],
          },
          timestamp: '2024-01-01T00:00:02Z',
          requestId: 'r1',
        }),
      ].join('\n');

      const result = parseJSONL(lines);
      const assistantMsgs = result.messages.filter((m): m is AssistantMessage => m.type === 'assistant');
      expect(assistantMsgs).toHaveLength(1);
      expect(assistantMsgs[0].content).toHaveLength(1);
    });
  });

  describe('chronological sorting', () => {
    it('sorts messages by timestamp', () => {
      const lines = [
        JSON.stringify({
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'response' }] },
          timestamp: '2024-01-01T00:00:02Z',
          requestId: 'r1',
        }),
        JSON.stringify({
          type: 'user',
          message: { content: 'question' },
          timestamp: '2024-01-01T00:00:01Z',
        }),
      ].join('\n');

      const result = parseJSONL(lines);
      expect(result.messages[0].type).toBe('user');
      expect(result.messages[1].type).toBe('assistant');
    });
  });

  describe('empty input', () => {
    it('returns empty messages for empty string', () => {
      const result = parseJSONL('');
      expect(result.messages).toHaveLength(0);
      expect(result.sessionInfo).toEqual({});
    });
  });
});
