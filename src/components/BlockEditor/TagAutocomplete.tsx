import React, { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { normalizeArabic } from '../../utils/arabic';

interface TagAutocompleteProps {
  query: string;
  allTags: string[];
  position: { top: number; left: number };
  onSelect: (tag: string) => void;
  onClose: () => void;
  isArabic: boolean;
}

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  query,
  allTags,
  position,
  onSelect,
  onClose,
  isArabic,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = normalizeArabic(query);

  const filteredTags = allTags.filter(t => {
    if (!normalizedQuery) return true;
    const normTag = normalizeArabic(t);
    return normTag.includes(normalizedQuery);
  });

  const isExactMatch = allTags.some(t => normalizeArabic(t) === normalizedQuery);
  const canCreateNew = query.trim().length > 0 && !isExactMatch;
  const totalItems = filteredTags.length + (canCreateNew ? 1 : 0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % (totalItems || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex < filteredTags.length) {
          onSelect(filteredTags[selectedIndex]);
        } else if (canCreateNew) {
          onSelect(query.trim());
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTags, selectedIndex, totalItems, query, canCreateNew, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (totalItems === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 w-56 max-h-56 overflow-y-auto bg-white border border-[#E2E7ED] rounded-lg shadow-lg p-1 text-sm font-sans"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="px-2 py-1 text-[11px] font-semibold text-[#5C6B7A] border-b border-[#E2E7ED]/70 mb-1 flex items-center justify-between">
        <span>{isArabic ? 'إدراج وسم #...' : 'Insert Tag #...'}</span>
      </div>

      <div className="space-y-0.5">
        {filteredTags.map((tag, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelect(tag)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-start px-2 py-1.5 rounded flex items-center gap-2 transition-colors cursor-pointer text-xs ${
                isSelected
                  ? 'bg-[#0D5C75]/10 text-[#0D5C75]'
                  : 'hover:bg-[#F4F6F8] text-[#13171C]'
              }`}
            >
              <TagIcon className="w-3 h-3 shrink-0 opacity-60" />
              <span className="font-medium truncate">#{tag}</span>
            </button>
          );
        })}

        {canCreateNew && (
          <button
            type="button"
            onClick={() => onSelect(query.trim())}
            onMouseEnter={() => setSelectedIndex(filteredTags.length)}
            className={`w-full text-start px-2 py-1.5 rounded flex items-center gap-2 transition-colors cursor-pointer text-xs border-t border-[#E2E7ED]/50 ${
              selectedIndex === filteredTags.length
                ? 'bg-[#0D5C75]/10 text-[#0D5C75]'
                : 'hover:bg-[#F4F6F8] text-[#0D5C75]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 shrink-0 text-[#0D5C75]" />
            <span className="font-medium truncate">
              {isArabic ? `وسم جديد: #${query.trim()}` : `New tag: #${query.trim()}`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
