/**
 * Keyword query parser for the naive MongoDB search.
 *
 * Grammar (whitespace-separated):
 *   query  := clause (' ' clause)*
 *   clause := word ('AND' word)* | word
 *
 * - Whitespace-separated words are combined with OR.
 * - The uppercase `AND` operator joins the word immediately before it with
 *   the word immediately after it into a single AND clause, e.g.
 *   `A B AND C` is interpreted as `A OR (B AND C)`. A chain of `AND`
 *   operators extends the same clause (`a AND b AND c` → all three words).
 * - Only the uppercase `AND` (exactly, surrounded by whitespace) is an
 *   operator. `and`, `And`, etc. are treated as ordinary words.
 */
export type KeywordClause = { kind: 'or'; word: string } | { kind: 'and'; words: string[] };

export const AND_OPERATOR = 'AND';

export function parseKeyword(keyword: string): KeywordClause[] {
  const tokens = keyword
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  const clauses: KeywordClause[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const next = tokens[i + 1];
    const prev = clauses[clauses.length - 1];

    // `AND` acts as an operator only when a word follows it and there is a
    // preceding clause (a plain word or an existing AND clause) to attach to.
    if (token === AND_OPERATOR && next !== undefined && prev !== undefined) {
      if (prev.kind === 'or') {
        clauses[clauses.length - 1] = { kind: 'and', words: [prev.word, next] };
      } else {
        prev.words.push(next);
      }
      i++;
      continue;
    }

    // A plain word, or an `AND` without a usable word on both sides.
    clauses.push({ kind: 'or', word: token });
  }

  return clauses;
}
