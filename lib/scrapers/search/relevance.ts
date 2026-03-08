/**
 * Normalises a string: lowercase, strip diacritics, collapse non-alphanumeric
 * characters into spaces.
 */
function normaliseStr(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Common Spanish stop-words that carry no discriminating value
const STOP_WORDS = new Set([
  "de",
  "la",
  "el",
  "en",
  "y",
  "a",
  "los",
  "las",
  "del",
  "con",
  "por",
  "un",
  "una",
  "es",
  "al",
  "se",
  "que",
  "para",
  "pack",
  "uds",
  "unidades",
]);

/**
 * Returns true when productName is a close enough match to query.
 *
 * Rules:
 * - Digits in the query (e.g. "5" in "talla 5") must appear as standalone
 *   numbers in the product name — "54" does NOT satisfy a search for "5".
 * - At least 60 % of the remaining non-stop-word tokens must be present
 *   somewhere in the product name.
 */
export function isRelevant(productName: string, query: string): boolean {
  const normQuery = normaliseStr(query);
  const normName = normaliseStr(productName);

  const tokens = normQuery
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return true;

  // Numeric tokens (e.g. "5") must match as a whole word (not inside "54")
  const numbers = tokens.filter((t) => /^\d+$/.test(t));
  for (const num of numbers) {
    const wholeWord = new RegExp(`(?:^|\\s)${num}(?:\\s|$)`);
    if (!wholeWord.test(normName)) return false;
  }

  const matched = tokens.filter((t) => normName.includes(t));
  return matched.length / tokens.length >= 0.6;
}
