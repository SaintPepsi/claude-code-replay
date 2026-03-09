import type { RawEntry, Message, UserMessage, AssistantMessage, ToolResult, ParsedConversation, SessionInfo } from '../types';
import { ok, err, safeJsonParse } from '../utils/result';
import type { Result } from '../utils/result';

function tryParseJSON(line: string): Result<RawEntry, string> {
  const trimmed = line.trim();
  if (!trimmed) return err('empty line');
  if (trimmed[0] !== '{') return err('not JSON object');
  const parsed = safeJsonParse(trimmed);
  if (!parsed.ok) return parsed;
  return ok(parsed.value as RawEntry);
}

export interface ParseResult {
  conversation: ParsedConversation;
  skippedLines: number;
}

export function parseJSONLSafe(text: string): Result<ParsedConversation, string> {
  const { conversation, skippedLines } = parseJSONLFull(text);
  if (conversation.messages.length === 0 && skippedLines > 0) {
    return err(`No valid JSONL entries found (${skippedLines} lines skipped)`);
  }
  if (conversation.messages.length === 0) {
    return err('No valid JSONL entries found');
  }
  return ok(conversation);
}

export function parseJSONLFull(text: string): ParseResult {
  const lines = text.trim().split('\n');
  const parsed: RawEntry[] = [];
  let sessionInfo: SessionInfo = {};
  let skippedLines = 0;

  for (const line of lines) {
    const result = tryParseJSON(line);
    if (!result.ok) {
      skippedLines++;
      continue;
    }
    const obj = result.value;
    parsed.push(obj);
    if (!sessionInfo.sessionId && obj.sessionId) {
      sessionInfo = {
        sessionId: obj.sessionId,
        version: obj.version,
        gitBranch: obj.gitBranch,
        cwd: obj.cwd,
      };
    }
  }

  if (parsed.length === 0) {
    return { conversation: { messages: [], sessionInfo: {} }, skippedLines };
  }

  const userMessages: UserMessage[] = [];
  const toolResultMap = new Map<string, ToolResult>();

  // First pass: collect tool results
  for (const entry of parsed) {
    if (entry.type === 'user' && entry.message) {
      const content = entry.message.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_result' && block.tool_use_id) {
            toolResultMap.set(block.tool_use_id, {
              content: block.content,
              is_error: block.is_error || false,
              stdout: entry.toolUseResult?.stdout,
              stderr: entry.toolUseResult?.stderr,
            });
          }
        }
      }
    }
  }

  // Second pass: build conversation
  const assistantGroups = new Map<string, AssistantMessage>();

  for (const entry of parsed) {
    if (entry.type === 'user' && entry.message) {
      const content = entry.message.content;
      if (typeof content === 'string' && content.trim()) {
        userMessages.push({
          type: 'user',
          text: content,
          timestamp: entry.timestamp || '',
          uuid: entry.uuid,
        });
      }
    } else if (entry.type === 'assistant' && entry.message) {
      const reqId = entry.requestId || entry.uuid || '';
      if (!assistantGroups.has(reqId)) {
        assistantGroups.set(reqId, {
          type: 'assistant',
          content: [],
          model: entry.message.model,
          timestamp: entry.timestamp || '',
          uuid: entry.uuid,
        });
      }
      const group = assistantGroups.get(reqId)!;
      const msgContent = entry.message.content;
      if (Array.isArray(msgContent)) {
        for (const block of msgContent) {
          if (block.type === 'text' && block.text) {
            const existingIdx = group.content.findIndex(
              (c) => c.type === 'text' && block.text!.startsWith(c.text || '')
            );
            if (existingIdx >= 0) {
              group.content[existingIdx] = block;
            } else {
              const isDup = group.content.some((c) => c.type === 'text' && c.text === block.text);
              if (!isDup) group.content.push(block);
            }
          } else if (block.type === 'tool_use') {
            const isDup = group.content.some((c) => c.type === 'tool_use' && c.id === block.id);
            if (!isDup) {
              const result = block.id ? toolResultMap.get(block.id) : undefined;
              group.content.push({ ...block, result: result || null });
            }
          }
        }
      }
    }
  }

  const assistantMsgs = Array.from(assistantGroups.values()).filter((m) => m.content.length > 0);
  const safeTime = (s: string): number => {
    const t = new Date(s).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  const allMsgs: Message[] = [...userMessages, ...assistantMsgs].sort(
    (a, b) => safeTime(a.timestamp) - safeTime(b.timestamp)
  );

  return { conversation: { messages: allMsgs, sessionInfo }, skippedLines };
}

export function parseJSONL(text: string): ParsedConversation {
  const result = parseJSONLSafe(text);
  if (!result.ok) {
    return { messages: [], sessionInfo: {} };
  }
  return result.value;
}
