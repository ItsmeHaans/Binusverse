const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_RE  = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, '').replace(CONTROL_RE, '').trim();
}
