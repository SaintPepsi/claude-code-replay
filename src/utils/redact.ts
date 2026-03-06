export function redact(text: string): string {
  if (!text) return text;
  text = text.replace(/sk-ant-[a-zA-Z0-9_-]{10,}/g, 'sk-ant-****[REDACTED]');
  text = text.replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-****[REDACTED]');
  text = text.replace(/AAAA[A-Za-z0-9+/]{20,}/g, 'AAAA...[REDACTED]');
  return text;
}
