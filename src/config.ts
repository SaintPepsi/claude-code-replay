/**
 * Application constants — extracted from magic numbers scattered across modules.
 * Single source of truth for timing, sizing, and display limits.
 */

export const TYPING_CHUNK_SIZE = 5;
export const TYPING_CHAR_DELAY_MS = 25;
export const TYPING_POST_DELAY_MS = 300;

export const TEXT_BLOCK_DELAY_MS = 400;
export const TEXT_BLOCK_MIN_DELAY_MS = 80;

export const TOOL_CALL_DELAY_MS = 600;
export const TOOL_CALL_MIN_DELAY_MS = 150;

export const TOOL_RESULT_DELAY_MS = 250;
export const TOOL_RESULT_MIN_DELAY_MS = 80;

export const TASK_TOOL_DELAY_MS = 150;
export const TASK_TOOL_MIN_DELAY_MS = 50;

export const POST_ASSISTANT_DELAY_MS = 400;
export const POST_ASSISTANT_MIN_DELAY_MS = 100;

export const REALTIME_MAX_DELAY_MS = 30000;
export const REALTIME_MIN_DELAY_MS = 200;

export const AUTO_SCROLL_THRESHOLD_PX = 50;
export const TOOL_PREVIEW_MAX_LENGTH = 90;
export const TASK_SHOW_MAX = 8;

export const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16] as const;
export const DEFAULT_SPEED_INDEX = 2;
