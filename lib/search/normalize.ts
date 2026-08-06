/**
 * Normalize a string for full-text search:
 *   1. NFKC normalization to unify half-width / full-width variants
 *   2. Lowercase to fold case differences
 *   3. Convert katakana to hiragana so mixed-script queries hit each other
 *      (e.g. "げんご" should match documents containing "言語" — this step
 *      handles the pure-kana side of that. Long-vowel mark `ー` is intentionally
 *      preserved, and `ヴ` (U+30F4) is folded to `う` because there is no
 *      corresponding hiragana codepoint.)
 *   4. Collapse consecutive whitespace and trim
 */
export function normalizeForSearch(input: string): string {
  if (!input) return '';

  const nfkc = input.normalize('NFKC').toLowerCase();

  let converted = '';
  for (const ch of nfkc) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;

    if (code === 0x30f4) {
      // ヴ has no direct hiragana equivalent — fold to う (loses the dakuten,
      // acceptable trade-off for recall). See plan section 5e / risks note.
      converted += 'う';
    } else if (code >= 0x30a1 && code <= 0x30f6) {
      // Katakana (ァ–ヶ) → Hiragana by shifting codepoint down by 0x60
      converted += String.fromCodePoint(code - 0x60);
    } else {
      converted += ch;
    }
  }

  return converted.replace(/\s+/g, ' ').trim();
}
