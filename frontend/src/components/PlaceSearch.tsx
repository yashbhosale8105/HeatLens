'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Neighborhood } from '@/lib/types';
import { filterPlaces, quickPlaces } from '@/lib/places';
import { pushRecent, readRecents } from '@/lib/recents';
import { PlaceChips } from './PlaceChips';

interface PlaceSearchProps {
  places: Neighborhood[];
  onSelect: (place: Neighborhood) => void;
  onQueryChange?: (query: string) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  value?: string;
}

export function PlaceSearch({
  places,
  onSelect,
  onQueryChange,
  label = 'Search a Thane area',
  placeholder = 'Type a place, for example Majiwada',
  compact = false,
  value,
}: PlaceSearchProps) {
  const listId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<Neighborhood[]>([]);

  useEffect(() => {
    setRecents(readRecents());
  }, []);

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const matches = useMemo(() => filterPlaces(places, query), [places, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function choose(place: Neighborhood) {
    setQuery(place.name);
    setOpen(false);
    setRecents(pushRecent(place));
    onQueryChange?.(place.name);
    onSelect(place);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(matches.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (matches[active]) choose(matches[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="place-search">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="field"
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange?.(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="place-list">
          <p className="place-count">{matches.length ? `${matches.length} Thane areas` : 'No matching area in Thane'}</p>
          {matches.length > 0 && (
            <ul id={listId} role="listbox">
              {matches.map((place, index) => (
                <li
                  id={`${listId}-${index}`}
                  key={`${place.name}-${place.lat}`}
                  role="option"
                  aria-selected={index === active}
                  className={index === active ? 'is-active' : undefined}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(place);
                  }}
                >
                  {place.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!compact && <PlaceChips label="Recent" places={recents} activeName={query} onPick={choose} />}
      {!compact && <PlaceChips label="Quick picks" places={quickPlaces()} activeName={query} onPick={choose} />}
    </div>
  );
}
