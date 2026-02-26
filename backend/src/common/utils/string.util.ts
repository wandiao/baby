export function cleanMarkdownCodeBlock(text: string): string {
  if (!text) return text;

  let cleaned = text;

  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/\s*```\s*$/g, '');
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```\s*/g, '').replace(/\s*```\s*$/g, '');
  }

  return cleaned.trim();
}
