import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus } from 'lucide-react';
import { NoteItem } from '../../types';
import { normalizeArabic } from '../../utils/arabic';

interface WikiLinkAutocompleteProps {
  query: string;
  notes: NoteItem[];
  position: { top: number; left: number };
  onSelect: (noteTitle: string) => void;
  onClose: () => void;
  isArabic: boolean;
}

export const WikiLinkAutocomplete: React.FC<WikiLinkAutocompleteProps> = ({
  query,
  notes,
  position,
  onSelect,
  onClose,
  isArabic,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = normalizeArabic(query);

  const filteredNotes = notes.filter(n => {
    if (!normalizedQuery) return true;
    const normTitle = normalizeArabic(n.title);
    return normTitle.includes(normalizedQuery);
  });

  const canCreateNew =
    query.trim().length > 0 &&
    !notes.some(n => normalizeArabic(n.title) === normalizedQuery);

  const totalItems = filteredNotes.length + (canCreateNew ? 1 : 0);

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
        if (selectedIndex < filteredNotes.length) {
          onSelect(filteredNotes[selectedIndex].title);
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
  }, [filteredNotes, selectedIndex, totalItems, query, canCreateNew, onSelect, onClose]);

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
      className="fixed z-50 w-64 max-h-64 overflow-y-auto bg-white border border-[#E2E7ED] rounded-lg shadow-lg p-1 text-sm font-sans"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="px-2 py-1 text-[11px] font-semibold text-[#5C6B7A] border-b border-[#E2E7ED]/70 mb-1 flex items-center justify-between">
        <span>{isArabic ? 'ربط بوثيقة [[...]]' : 'Link to Note [[...]]'}</span>
      </div>

      <div className="space-y-0.5">
        {filteredNotes.map((note, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={note.id}
              type="button"
              onClick={() => onSelect(note.title)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-start px-2 py-1.5 rounded flex items-center gap-2 transition-colors cursor-pointer text-xs ${
                isSelected
                  ? 'bg-[#0D5C75]/10 text-[#0D5C75]'
                  : 'hover:bg-[#F4F6F8] text-[#13171C]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <div className="truncate flex-1">
                <span className="font-medium">{note.title}</span>
                {note.folder && note.folder !== 'root' && (
                  <span className="text-[10px] text-[#5C6B7A] block truncate opacity-75">
                    {note.folder}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {canCreateNew && (
          <button
            type="button"
            onClick={() => onSelect(query.trim())}
            onMouseEnter={() => setSelectedIndex(filteredNotes.length)}
            className={`w-full text-start px-2 py-1.5 rounded flex items-center gap-2 transition-colors cursor-pointer text-xs border-t border-[#E2E7ED]/50 ${
              selectedIndex === filteredNotes.length
                ? 'bg-[#0D5C75]/10 text-[#0D5C75]'
                : 'hover:bg-[#F4F6F8] text-[#0D5C75]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 shrink-0 text-[#0D5C75]" />
            <div className="truncate">
              <span className="font-medium">
                {isArabic ? `إنشاء وثيقة: "${query.trim()}"` : `Create Note: "${query.trim()}"`}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
