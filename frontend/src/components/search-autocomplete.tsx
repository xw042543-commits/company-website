"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { matchingSuggestions } from "@/data/search-suggestions";
import { Locale, words } from "@/lib/site";

type SearchAutocompleteProps = {
  id: string;
  name: string;
  locale: Locale;
  suggestions: string[];
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLocaleLowerCase().indexOf(query.trim().toLocaleLowerCase());
  if (index < 0 || !query.trim()) return text;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.trim().length)}</mark>{text.slice(index + query.trim().length)}</>;
}

export function SearchAutocomplete({ id, name, locale, suggestions, defaultValue = "", placeholder, maxLength = 100 }: SearchAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id}-suggestions`;
  const matches = useMemo(() => matchingSuggestions(suggestions, query), [suggestions, query]);
  const visible = open && Boolean(query.trim());
  const itemCount = matches.length + 1;

  const selectSuggestion = (value: string, submit = false) => {
    setQuery(value);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
    if (submit) requestAnimationFrame(() => inputRef.current?.form?.requestSubmit());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(current => event.key === "ArrowDown"
        ? (current + 1) % itemCount
        : (current <= 0 ? itemCount - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && visible && activeIndex >= 0) {
      event.preventDefault();
      if (activeIndex === 0) inputRef.current?.form?.requestSubmit();
      else selectSuggestion(matches[activeIndex - 1], true);
    }
  };

  return <div className="search-autocomplete">
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="search"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={visible}
      aria-controls={listId}
      aria-activedescendant={visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      autoComplete="off"
      maxLength={maxLength}
      placeholder={placeholder}
      value={query}
      onChange={event => {
        setQuery(event.target.value);
        setOpen(true);
        setActiveIndex(-1);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      onKeyDown={onKeyDown}
    />
    {query && <button className="search-clear" type="button" aria-label={words(locale, "清除搜索关键词", "Clear search keyword")} onClick={() => selectSuggestion("")}><span aria-hidden="true">×</span></button>}
    {visible && <div className="search-suggestion-panel" id={listId} role="listbox">
      <button id={`${listId}-0`} className={activeIndex === 0 ? "search-command active" : "search-command"} type="button" role="option" aria-selected={activeIndex === 0} onMouseDown={event => event.preventDefault()} onClick={() => inputRef.current?.form?.requestSubmit()}>
        <span className="search-suggestion-icon" aria-hidden="true" />
        <span>{words(locale, "搜索", "Search")} <strong>“{query.trim()}”</strong></span>
      </button>
      {matches.map((suggestion, index) => <button
        id={`${listId}-${index + 1}`}
        className={activeIndex === index + 1 ? "search-suggestion active" : "search-suggestion"}
        key={suggestion}
        type="button"
        role="option"
        aria-selected={activeIndex === index + 1}
        onMouseDown={event => event.preventDefault()}
        onClick={() => selectSuggestion(suggestion)}
      ><Highlight text={suggestion} query={query} /></button>)}
    </div>}
  </div>;
}
