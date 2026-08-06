import { describe, expect, it } from 'vitest';
import { normalizeForSearch } from '../../../lib/search/normalize';

describe('normalizeForSearch', () => {
  it('空文字列を安全に扱えること', () => {
    expect(normalizeForSearch('')).toBe('');
  });

  it('NFKCで半角/全角を統一すること', () => {
    expect(normalizeForSearch('ＴｙｐｅＳｃｒｉｐｔ')).toBe('typescript');
  });

  it('全角カタカナがNFKC後にひらがな化されること', () => {
    expect(normalizeForSearch('カタカナ')).toBe('かたかな');
  });

  it('大文字を小文字に畳むこと', () => {
    expect(normalizeForSearch('React')).toBe('react');
  });

  it('カタカナをひらがなに折り畳むこと', () => {
    expect(normalizeForSearch('サーバー')).toBe('さーばー');
    expect(normalizeForSearch('プログラミング')).toBe('ぷろぐらみんぐ');
  });

  it('カタカナ長音符「ー」は維持されること', () => {
    expect(normalizeForSearch('サーバー')).toContain('ー');
  });

  it('ヴを「う」に折り畳むこと (対応するひらがなが無いため)', () => {
    expect(normalizeForSearch('ヴィジュアル')).toBe('うぃじゅある');
  });

  it('連続した空白を単一空白に圧縮しtrimすること', () => {
    expect(normalizeForSearch('  hello   world  ')).toBe('hello world');
  });

  it('漢字は変更されず、カナだけ折り畳まれること', () => {
    expect(normalizeForSearch('ReactでUIを作る')).toBe('reactでuiを作る');
  });
});
