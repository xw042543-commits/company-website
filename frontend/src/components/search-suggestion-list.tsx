export function SearchSuggestionList({ id, suggestions }: { id: string; suggestions: string[] }) {
  return <datalist id={id}>{suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>;
}
