import type { RawEntry, Message, UserMessage, AssistantMessage, ToolResult, ParsedConversation, SessionInfo } from '../types';
import { ok, err, type Result } from '../utils/result';

export function parseJSONLSafe(text: string): Result<ParsedConversation, string> {
  try {
    return ok(parseJSONL(text));
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

export function parseJSONL(text: string): ParsedConversation {
  const lines = text.trim().split('\n');
  const parsed: RawEntry[] = [];
  let sessionInfo: SessionInfo = {};

  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as RawEntry;
      parsed.push(obj);
      if (!sessionInfo.sessionId && obj.sessionId) {
        sessionInfo = {
          sessionId: obj.sessionId,
          version: obj.version,
          gitBranch: obj.gitBranch,
          cwd: obj.cwd,
        };
      }
    } catch (_e) {
      // Skip malformed lines
    }
  }

  const conversation: UserMessage[] = [];
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
        conversation.push({
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
  const allMsgs: Message[] = [...conversation, ...assistantMsgs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return { messages: allMsgs, sessionInfo };
}
