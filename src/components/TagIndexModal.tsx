import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, FileText, X, Hash, Search } from 'lucide-react';
import { TagIndexItem } from '../types';
import { normalizeArabic } from '../utils/arabic';

interface TagIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  isArabic: boolean;
  initialSelectedTag?: string | null;
}

export const TagIndexModal: React.FC<TagIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  isArabic,
  initialSelectedTag,
}) => {
  const [tags, setTags] = useState<TagIndexItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialSelectedTag || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSelectedTag) {
      setSelectedTag(initialSelectedTag);
    }
  }, [initialSelectedTag]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();
        setTags(data.tags || []);
        if (!selectedTag && data.tags?.length > 0) {
          setSelectedTag(data.tags[0].tag);
        }
      } catch (err) {
        console.error('Error loading tags:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedSearch = normalizeArabic(searchQuery);
  const filteredTags = tags.filter(t =>
    !normalizedSearch ? true : normalizeArabic(t.tag).includes(normalizedSearch)
  );

  const activeTagObj = tags.find(t => t.tag === selectedTag);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-[#E2E7ED] overflow-hidden flex flex-col h-[70vh]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E2E7ED] flex items-center justify-between bg-[#F4F6F8]">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-[#0D5C75]" />
            <div>
              <h2 className="font-scholarly font-bold text-base text-[#13171C]">
                {isArabic ? 'فهرس الوسوم والموضوعات' : 'Vault Tag Index'}
              </h2>
              <p className="text-xs text-[#5C6B7A]">
                {isArabic
                  ? 'استكشف شبكة الموضوعات المترابطة في وثائق الخزانة'
                  : 'Explore interconnected topics across all vault notes'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5C6B7A] hover:text-[#13171C] rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left / Start: Tag List */}
          <div className="w-1/3 border-e border-[#E2E7ED] bg-[#F4F6F8]/50 flex flex-col p-3">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute top-2.5 start-2 text-[#5C6B7A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'تصفية الوسوم...' : 'Filter tags...'}
                className="w-full bg-white border border-[#E2E7ED] rounded text-xs py-1.5 ps-7 pe-2 focus:outline-none focus:border-[#0D5C75]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-[#5C6B7A]">
                  {isArabic ? 'جارِ التحميل...' : 'Loading tags...'}
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#5C6B7A]">
                  {isArabic ? 'لا توجد وسوم مطابقة' : 'No matching tags'}
                </div>
              ) : (
                filteredTags.map(tagItem => (
                  <button
                    key={tagItem.tag}
                    type="button"
                    onClick={() => setSelectedTag(tagItem.tag)}
                    className={`w-full text-start px-2.5 py-2 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedTag === tagItem.tag
                        ? 'bg-[#0D5C75] text-white font-medium shadow-xs'
                        : 'hover:bg-white text-[#13171C]'
                    }`}
                  >
                    <span className="truncate">#{tagItem.tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        selectedTag === tagItem.tag
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E2E7ED] text-[#5C6B7A]'
                      }`}
                    >
                      {tagItem.count}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right / End: Notes under selected tag */}
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            {activeTagObj ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E7ED]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-[#0D5C75]/10 text-[#0D5C75]">
                      <Hash className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-base text-[#13171C]">
                      {activeTagObj.tag}
                    </h3>
                  </div>
                  <span className="text-xs text-[#5C6B7A]">
                    {activeTagObj.count} {isArabic ? 'وثائق مقيدة بهذا الوسم' : 'notes'}
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTagObj.notes.map(noteRef => (
                    <button
                      key={noteRef.id}
                      type="button"
                      onClick={() => {
                        onSelectNote(noteRef.id);
                        onClose();
                      }}
                      className="w-full text-start p-3 rounded-lg border border-[#E2E7ED] hover:border-[#0D5C75]/40 hover:bg-[#F4F6F8] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#0D5C75]" />
                        <div>
                          <h4 className="font-scholarly font-bold text-sm text-[#13171C] group-hover:text-[#0D5C75] transition-colors">
                            {noteRef.title}
                          </h4>
                          <span className="text-[11px] font-mono text-[#5C6B7A]">
                            {noteRef.path}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#5C6B7A]">
                {isArabic ? 'اختر وسماً لعرض الوثائق المرتبطة به' : 'Select a tag to view associated notes'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
