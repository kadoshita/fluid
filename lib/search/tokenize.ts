import { normalizeForSearch } from './normalize';

// CJK unified ideograph blocks + hiragana + katakana phonetic extensions.
// Katakana proper has already been folded to hiragana by normalizeForSearch,
// so we don't include U+30A0-U+30FF here.
function isCjk(code: number): boolean {
  return (
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30fc && code <= 0x30fc) || // Prolonged sound mark (ー)
    (code >= 0x31f0 && code <= 0x31ff) || // Katakana phonetic extensions
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x4e00 && code <= 0x9fff) // CJK Unified Ideographs
  );
}

function isLatinAlnum(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a) // a-z
  );
}

// Short tokens containing special symbols (e.g. C++, C#, .NET) are also
// emitted verbatim so exact-symbol queries still hit even after normalization
// strips punctuation from the surrounding text.
function isSpecialSymbol(code: number): boolean {
  return (
    code === 0x2b || // +
    code === 0x23 || // #
    code === 0x2e || // .
    code === 0x2d || // -
    code === 0x5f // _
  );
}

/**
 * Tokenize normalized text into a whitespace-joined bag of tokens suitable
 * for a MongoDB text index with `default_language: 'none'`.
 *
 * CJK characters produce both 1-grams and bi-grams to give the text index
 * substring-friendly recall (mirrors Elasticsearch's cjk_bigram filter).
 * Latin/digit runs are split at non-alnum boundaries and emitted as word
 * tokens. Short mixed-punctuation tokens (C++, .NET) are also kept verbatim.
 */
export function tokenizeForIndex(input: string): string {
  const normalized = normalizeForSearch(input);
  if (!normalized) return '';

  const tokens = new Set<string>();
  const chars = Array.from(normalized);
  let latinBuf = '';
  let mixedBuf = '';

  const flushLatin = () => {
    if (latinBuf) {
      tokens.add(latinBuf);
      latinBuf = '';
    }
  };
  const flushMixed = () => {
    if (mixedBuf && mixedBuf.length <= 12) {
      // Only keep short mixed-symbol tokens to avoid pulling in noise.
      tokens.add(mixedBuf);
    }
    mixedBuf = '';
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const code = ch.codePointAt(0);
    if (code === undefined) continue;

    if (isCjk(code)) {
      flushLatin();
      flushMixed();
      tokens.add(ch);
      const next = chars[i + 1];
      const nextCode = next?.codePointAt(0);
      if (nextCode !== undefined && isCjk(nextCode)) {
        tokens.add(ch + next);
      }
    } else if (isLatinAlnum(code)) {
      latinBuf += ch;
      mixedBuf += ch;
    } else if (isSpecialSymbol(code)) {
      // Continue accumulating the mixed token but break the plain latin one.
      flushLatin();
      mixedBuf += ch;
    } else {
      flushLatin();
      flushMixed();
    }
  }
  flushLatin();
  flushMixed();

  return Array.from(tokens).join(' ');
}
