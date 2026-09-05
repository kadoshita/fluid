import { describe, expect, it } from 'vitest';
import { parseKeyword } from '../../../lib/search/parseKeyword';

describe('parseKeyword', () => {
  it('空文字列・空白のみでは空の配列を返すこと', () => {
    expect(parseKeyword('')).toEqual([]);
    expect(parseKeyword('   ')).toEqual([]);
  });

  it('スペース区切りの各単語をOR条件として解釈すること', () => {
    expect(parseKeyword('a b c')).toEqual([
      { kind: 'or', word: 'a' },
      { kind: 'or', word: 'b' },
      { kind: 'or', word: 'c' },
    ]);
  });

  it('ANDの前後の単語をAND条件として解釈すること', () => {
    expect(parseKeyword('a AND b')).toEqual([{ kind: 'and', words: ['a', 'b'] }]);
  });

  it('A B AND C を A OR (B AND C) と解釈すること', () => {
    expect(parseKeyword('A B AND C')).toEqual([
      { kind: 'or', word: 'A' },
      { kind: 'and', words: ['B', 'C'] },
    ]);
  });

  it('連続するAND演算子は同じAND条件に結合すること', () => {
    expect(parseKeyword('a AND b AND c')).toEqual([{ kind: 'and', words: ['a', 'b', 'c'] }]);
  });

  it('小文字のandは演算子ではなく単語として解釈すること', () => {
    expect(parseKeyword('a and b')).toEqual([
      { kind: 'or', word: 'a' },
      { kind: 'or', word: 'and' },
      { kind: 'or', word: 'b' },
    ]);
  });

  it('AND以外の大文字小文字混合 (And, aNd) も単語として扱うこと', () => {
    expect(parseKeyword('a And b')).toEqual([
      { kind: 'or', word: 'a' },
      { kind: 'or', word: 'And' },
      { kind: 'or', word: 'b' },
    ]);
  });

  it('ANDの前に単語がない場合は単語として扱うこと', () => {
    expect(parseKeyword('AND a')).toEqual([
      { kind: 'or', word: 'AND' },
      { kind: 'or', word: 'a' },
    ]);
  });

  it('ANDの後に単語がない場合は単語として扱うこと', () => {
    expect(parseKeyword('a AND')).toEqual([
      { kind: 'or', word: 'a' },
      { kind: 'or', word: 'AND' },
    ]);
  });

  it('単語がANDに部分一致するもの (ANDYなど) は演算子としないこと', () => {
    expect(parseKeyword('ANDY a')).toEqual([
      { kind: 'or', word: 'ANDY' },
      { kind: 'or', word: 'a' },
    ]);
  });
});
