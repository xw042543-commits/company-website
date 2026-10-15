const ENGLISH_TITLE_SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
const ENGLISH_TITLE_ACRONYMS = new Map([
  ["ai", "AI"], ["ba", "BA"], ["bba", "BBA"], ["bsc", "BSc"], ["cs", "CS"], ["it", "IT"],
  ["llb", "LLB"], ["mba", "MBA"], ["md", "MD"], ["phd", "PhD"], ["tesl", "TESL"],
]);

export function formatEnglishDisplayText(value: string) {
  const trimmed = value.trim();
  const readable = trimmed.replaceAll("_", " ");
  const letters = readable.replace(/[^A-Za-z]+/g, "");
  if (!letters || letters !== letters.toUpperCase()) return readable;

  return readable.toLocaleLowerCase("en").replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (word, offset) => {
    const acronym = ENGLISH_TITLE_ACRONYMS.get(word);
    if (acronym) return acronym;
    if (offset > 0 && ENGLISH_TITLE_SMALL_WORDS.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}
