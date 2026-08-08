import { describe, expect, it } from 'vitest';
import { tokenizeForIndex } from '../../../lib/search/tokenize';

function tokenSet(input: string): Set<string> {
  return new Set(tokenizeForIndex(input).split(' ').filter(Boolean));
}

/** Split a already-tokenized string into a Set without re-tokenizing. */
function splitTokens(tokenized: string): Set<string> {
  return new Set(tokenized.split(' ').filter(Boolean));
}

describe('tokenizeForIndex', () => {
  it('空文字列を安全に扱えること', () => {
    expect(tokenizeForIndex('')).toBe('');
  });

  it('CJK文字列を1-gramとbi-gram両方に分解すること', () => {
    const tokens = tokenSet('日本語');
    // 1-grams
    expect(tokens.has('日')).toBe(true);
    expect(tokens.has('本')).toBe(true);
    expect(tokens.has('語')).toBe(true);
    // bi-grams
    expect(tokens.has('日本')).toBe(true);
    expect(tokens.has('本語')).toBe(true);
  });

  it('英字はNFKC後の小文字単語として1トークンで残ること', () => {
    const tokens = tokenSet('React Tutorial');
    expect(tokens.has('react')).toBe(true);
    expect(tokens.has('tutorial')).toBe(true);
  });

  it('C++やC#のような記号入り短トークンが原文として保持されること', () => {
    const tokens = tokenSet('C++ Tutorial');
    expect(tokens.has('c++')).toBe(true);
  });

  it('CJKとLatinの境界でトークンが正しく分かれること', () => {
    const tokens = tokenSet('React入門');
    expect(tokens.has('react')).toBe(true);
    expect(tokens.has('入')).toBe(true);
    expect(tokens.has('門')).toBe(true);
    expect(tokens.has('入門')).toBe(true);
    // React should not appear inside any CJK bi-gram
    expect(tokens.has('t入')).toBe(false);
  });

  it('カタカナ入力はひらがなに正規化された上でbi-gram化されること', () => {
    const tokens = tokenSet('プログラミング');
    // Normalized to ひらがな
    expect(tokens.has('ぷろ')).toBe(true);
    expect(tokens.has('ぐら')).toBe(true);
  });

  it('重複したトークンは1個にまとめられること', () => {
    const result = tokenizeForIndex('React React React');
    const parts = result.split(' ').filter(Boolean);
    const unique = new Set(parts);
    expect(parts.length).toBe(unique.size);
  });

  describe('omitUnigrams オプション', () => {
    it('CJKの1-gramを除外し、bi-gramのみを生成すること', () => {
      const tokens = splitTokens(tokenizeForIndex('日本語', { omitUnigrams: true }));
      // 1-grams are omitted
      expect(tokens.has('日')).toBe(false);
      expect(tokens.has('本')).toBe(false);
      expect(tokens.has('語')).toBe(false);
      // bi-grams remain
      expect(tokens.has('日本')).toBe(true);
      expect(tokens.has('本語')).toBe(true);
    });

    it('ラテン文字のトークンは影響を受けないこと', () => {
      const tokens = splitTokens(tokenizeForIndex('React Tutorial', { omitUnigrams: true }));
      expect(tokens.has('react')).toBe(true);
      expect(tokens.has('tutorial')).toBe(true);
    });

    it('CJKとLatinの混在時にも正しく動作すること', () => {
      const tokens = splitTokens(tokenizeForIndex('React入門', { omitUnigrams: true }));
      expect(tokens.has('react')).toBe(true);
      // 1-grams omitted
      expect(tokens.has('入')).toBe(false);
      expect(tokens.has('門')).toBe(false);
      // bi-gram remains
      expect(tokens.has('入門')).toBe(true);
    });

    it('単一文字のCJK入力は空になること', () => {
      const result = tokenizeForIndex('言', { omitUnigrams: true });
      expect(result).toBe('');
    });

    it('カタカナ→ひらがな変換後のbi-gramは生成されること', () => {
      const tokens = splitTokens(tokenizeForIndex('プログラミング', { omitUnigrams: true }));
      // bi-grams from normalized hiragana
      expect(tokens.has('ぷろ')).toBe(true);
      expect(tokens.has('ぐら')).toBe(true);
      // 1-grams omitted
      expect(tokens.has('ぷ')).toBe(false);
      expect(tokens.has('ん')).toBe(false);
    });
  });
});
