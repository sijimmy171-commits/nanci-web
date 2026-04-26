export function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    // Keep CJK characters (Chinese, Japanese, Korean), alphanumeric, spaces, and hyphens
    .replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}a-z0-9\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || `item-${Math.random().toString(36).slice(2, 8)}`;
}
