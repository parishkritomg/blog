'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync query with URL param if present
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      // If we are on search page, maybe keep it open or just show query
      // But usually we just want the search bar to reflect current search
    }
  }, [searchParams]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if query is empty, otherwise we might be typing
        if (!query) {
           setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false); // Optional: close after search or keep open
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-50"
          aria-label="Search"
        >
          <SearchIcon size={20} />
        </button>
      ) : (
        <form 
            onSubmit={handleSearch} 
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 shadow-sm w-48 sm:w-64"
        >
          <SearchIcon size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm px-2 text-gray-800 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={() => {
                setIsOpen(false);
                setQuery('');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
