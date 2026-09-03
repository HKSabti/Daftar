import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Tag as TagIcon, ArrowRight, X, BookOpen } from 'lucide-react';
import { SearchResult } from '../types';
import { normalizeArabic } from '../utils/arabic';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (noteId: string) => void;
  isArabic: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  isArabic,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectResult(results[selectedIndex].noteId);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectResult, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E2E7ED] overflow-hidden flex flex-col max-h-[75vh]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E2E7ED] flex items-center gap-3 bg-[#F4F6F8]">
          <Search className="w-5 h-5 text-[#0D5C75] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث في نصوص المخطوطات والوثائق (بحث شامل مع توحيد الهمزات والتشكيل)...'
                : 'Search all vault notes and marginalia (FTS with Arabic normalization)...'
            }
            className="flex-1 bg-transparent text-sm text-[#13171C] focus:outline-none placeholder:text-[#5C6B7A]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#5C6B7A] hover:text-[#13171C] rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 bg-white border border-[#E2E7ED] rounded text-[11px] font-mono text-[#5C6B7A]">
            ESC
          </kbd>
        </div>

        {/* Normalization indicator info */}
        <div className="px-4 py-1.5 bg-[#0D5C75]/5 text-[11px] text-[#0D5C75] flex items-center justify-between border-b border-[#0D5C75]/10">
          <span>
            {isArabic
              ? '✓ تطبيع تلقائي: تجريد التشكيل وتوحيد (أ، إ، آ → ا) و (ة → ه) و (ى → ي)'
              : '✓ Arabic FTS active: strips harakat, unifies alef, teh marbuta, and alef maksura'}
          </span>
          {results.length > 0 && (
            <span className="font-medium">
              {results.length} {isArabic ? 'نتيجة' : 'results'}
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#5C6B7A]">
              <div className="animate-spin w-5 h-5 border-2 border-[#0D5C75] border-t-transparent rounded-full mx-auto mb-2" />
              <span>{isArabic ? 'جارِ البحث في الخزانة...' : 'Searching vault...'}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5C6B7A]">
              {query.trim() ? (
                <>
                  <BookOpen className="w-8 h-8 mx-auto opacity-30 text-[#5C6B7A] mb-2" />
                  <p className="font-medium text-[#13171C] mb-1">
                    {isArabic ? 'لم يتم العثور على نتائج' : 'No results found'}
                  </p>
                  <p className="text-[11px]">
                    {isArabic
                      ? `لا توجد وثائق تطابق: "${query}"`
                      : `No notes matched query: "${query}"`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#5C6B7A]">
                  {isArabic
                    ? 'اكتب أي كلمة للبحث الفوري في العناوين والفقرات والوسوم'
                    : 'Type any keyword to search notes, content, and tags instantly'}
                </p>
              )}
            </div>
          ) : (
            results.map((res, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={res.noteId}
                  type="button"
                  onClick={() => {
                    onSelectResult(res.noteId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-start p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0D5C75]/10 border-[#0D5C75]/40 text-[#13171C]'
                      : 'bg-white border-[#E2E7ED] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0D5C75]" />
                      <span className="font-semibold text-sm text-[#13171C] font-scholarly">
                        {res.noteTitle}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C6B7A] opacity-75">
                      {res.notePath}
                    </span>
                  </div>

                  {/* Matching snippets */}
                  <div className="space-y-1 mt-1.5">
                    {res.matches.slice(0, 2).map((m, mi) => (
                      <div
                        key={mi}
                        className="text-xs text-[#5C6B7A] leading-relaxed bg-[#F4F6F8]/80 px-2 py-1 rounded border border-[#E2E7ED]/60 font-serif line-clamp-2"
                      >
                        {m.field === 'tag' ? (
                          <span className="text-[#0D5C75] font-semibold">{m.snippet}</span>
                        ) : (
                          <span>{m.snippet}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-[#F4F6F8] border-t border-[#E2E7ED] text-[11px] text-[#5C6B7A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ {isArabic ? 'للتنقل' : 'Navigate'}</span>
            <span>↵ {isArabic ? 'للاختيار' : 'Open'}</span>
            <span>ESC {isArabic ? 'للإغلاق' : 'Close'}</span>
          </div>
          <span className="font-scholarly text-xs font-semibold text-[#13171C]">
            {isArabic ? 'دفتر | محرك البحث التراثي' : 'Daftar FTS Engine'}
          </span>
        </div>
      </div>
    </div>
  );
};
