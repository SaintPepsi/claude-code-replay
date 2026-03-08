export interface SessionInfo {
  sessionId?: string;
  version?: string;
  gitBranch?: string;
  cwd?: string;
}

export interface ToolResult {
  content?: string;
  is_error: boolean;
  stdout?: string;
  stderr?: string;
}

export interface ToolInput {
  description?: string;
  command?: string;
  file_path?: string;
  pattern?: string;
  path?: string;
  query?: string;
  url?: string;
  subject?: string;
  taskId?: string;
  status?: string;
  old_string?: string;
  activeForm?: string;
  [key: string]: unknown;
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: ToolInput;
  result?: ToolResult | null;
  content?: string;
  is_error?: boolean;
  tool_use_id?: string;
}

export interface UserMessage {
  type: 'user';
  text: string;
  timestamp: string;
  uuid?: string;
}

export interface AssistantMessage {
  type: 'assistant';
  content: ContentBlock[];
  model?: string;
  timestamp: string;
  uuid?: string;
}

export type Message = UserMessage | AssistantMessage;

export interface ParsedConversation {
  messages: Message[];
  sessionInfo: SessionInfo;
}

export interface TaskItem {
  subject: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deleted';
  activeForm: string;
}

/** IRenderer interface — decouples rendering consumers from concrete implementations (TASK-204) */
export interface IRenderer {
  renderUserInstant(msg: UserMessage, target?: HTMLElement | DocumentFragment): void;
  renderAssistantInstant(msg: AssistantMessage, target?: HTMLElement | DocumentFragment): void;
  renderMessageInstant(msg: Message, target?: HTMLElement | DocumentFragment): void;
  renderBlockInstant(block: ContentBlock, target?: HTMLElement | DocumentFragment): void;
  renderToolCall(block: ContentBlock, target?: HTMLElement | DocumentFragment): void;
  renderToolResult(result: ToolResult, target?: HTMLElement | DocumentFragment): void;
  appendFragment(frag: DocumentFragment): void;
  autoScroll(): void;
  enableAutoScroll(): void;
  disableAutoScroll(): void;
  scrollToLast(): void;
  clear(): void;
  destroy(): void;
}

export interface RawEntry {
  type?: string;
  message?: {
    content: ContentBlock[] | string;
    model?: string;
  };
  timestamp?: string;
  uuid?: string;
  sessionId?: string;
  version?: string;
  gitBranch?: string;
  cwd?: string;
  requestId?: string;
  toolUseResult?: {
    stdout?: string;
    stderr?: string;
  };
}
