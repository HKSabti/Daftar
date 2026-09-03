import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Clock,
  Volume2,
} from 'lucide-react';
import { Block, BlockType, NoteItem } from '../../types';
import { isArabicText } from '../../utils/arabic';
import { formatAudioTime } from '../../utils/markdown';
import { MathBlock } from './MathBlock';
import { CodeBlock } from './CodeBlock';
import { CalloutBlock } from './CalloutBlock';
import { TableBlock } from './TableBlock';
import { ImageBlock } from './ImageBlock';
import { GradebookBlock } from './GradebookBlock';
import { ExamBlock } from './ExamBlock';
import { QuranBlock } from './QuranBlock';
import { TeacherLogBlock } from './TeacherLogBlock';
import { KanbanBlock } from './KanbanBlock';
import { InlineFormattedText } from '../InlineTextEditor';
import { SlashMenuItem } from './SlashMenu';

interface BlockItemProps {
  block: Block;
  index: number;
  totalBlocks: number;
  isArabic: boolean;
  notes: NoteItem[];
  allTags: string[];
  onChange: (updated: Partial<Block>) => void;
  onDelete: () => void;
  onAddBelow: (type?: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onOpenSlashMenu: (rect: DOMRect, filter: string, blockId: string) => void;
  onOpenWikiAutocomplete: (rect: DOMRect, query: string, blockId: string, cursorOffset: number) => void;
  onOpenTagAutocomplete: (rect: DOMRect, query: string, blockId: string, cursorOffset: number) => void;
  onWikiLinkClick?: (noteTitle: string) => void;
  onTagClick?: (tag: string) => void;
  onSeekAudio?: (timestampSeconds: number) => void;
  isFocused?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  isArabic,
  notes,
  allTags,
  onChange,
  onDelete,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onOpenSlashMenu,
  onOpenWikiAutocomplete,
  onOpenTagAutocomplete,
  onWikiLinkClick,
  onTagClick,
  onSeekAudio,
  isFocused,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust textarea height dynamically
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 28)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content, block.type]);

  const blockIsArabic = isArabicText(block.content) || (block.content.length === 0 && isArabic);

  // Markdown shortcut & Trigger handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = block.content;
    const selectionStart = e.currentTarget.selectionStart;

    // Enter key: create block below or continue list
    if (e.key === 'Enter' && !e.shiftKey) {
      if (['paragraph', 'h1', 'h2', 'h3'].includes(block.type)) {
        e.preventDefault();
        onAddBelow('paragraph');
        return;
      }
      if (['bullet-list', 'numbered-list', 'checkbox'].includes(block.type)) {
        if (!text.trim()) {
          // Empty list item -> convert back to paragraph
          e.preventDefault();
          onChange({ type: 'paragraph', content: '' });
          return;
        }
        e.preventDefault();
        onAddBelow(block.type);
        return;
      }
    }

    // Backspace at start of empty block -> delete or convert to paragraph
    if (e.key === 'Backspace' && selectionStart === 0 && (!text || text === '')) {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        onChange({ type: 'paragraph', content: '' });
        return;
      }
      if (totalBlocks > 1) {
        e.preventDefault();
        onDelete();
        return;
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;

    // Check for Markdown shortcut prefixes at the beginning of line
    if (val === '# ') {
      onChange({ type: 'h1', content: '' });
      return;
    }
    if (val === '## ') {
      onChange({ type: 'h2', content: '' });
      return;
    }
    if (val === '### ') {
      onChange({ type: 'h3', content: '' });
      return;
    }
    if (val === '- ' || val === '* ') {
      onChange({ type: 'bullet-list', content: '' });
      return;
    }
    if (val === '1. ') {
      onChange({ type: 'numbered-list', content: '' });
      return;
    }
    if (val === '[] ' || val === '- [ ] ') {
      onChange({ type: 'checkbox', content: '', checked: false });
      return;
    }
    if (val === '> ') {
      onChange({ type: 'quote', content: '' });
      return;
    }
    if (val === '```') {
      onChange({ type: 'code', content: '', language: 'typescript' });
      return;
    }
    if (val === '$$') {
      onChange({ type: 'math', content: '', mathFormula: '' });
      return;
    }
    if (val === '---') {
      onChange({ type: 'divider', content: '' });
      return;
    }

    onChange({ content: val });

    // Check for slash menu trigger: "/" or "،" (Arabic comma)
    const textBeforeCursor = val.slice(0, cursor);
    const slashMatch = textBeforeCursor.match(/(?:^|\s)([/،])([a-zA-Z\u0600-\u06FF]*)$/);

    if (slashMatch && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      onOpenSlashMenu(rect, slashMatch[2], block.id);
    }

    // Check for [[ Wiki-link trigger
    const wikiMatch = textBeforeCursor.match(/\[\[([^\]]*)$/);
    if (wikiMatch && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      onOpenWikiAutocomplete(rect, wikiMatch[1], block.id, cursor);
    }

    // Check for # Tag trigger
    const tagMatch = textBeforeCursor.match(/(?:^|\s)#([\w\u0600-\u06FF_-]*)$/);
    if (tagMatch && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      onOpenTagAutocomplete(rect, tagMatch[1], block.id, cursor);
    }
  };

  // Render complex blocks
  if (block.type === 'math') {
    return (
      <div ref={containerRef} className="relative group/item">
        <MathBlock block={block} onChange={onChange} isArabic={isArabic} />
      </div>
    );
  }

  if (block.type === 'code') {
    return (
      <div ref={containerRef} className="relative group/item">
        <CodeBlock block={block} onChange={onChange} isArabic={isArabic} />
      </div>
    );
  }

  if (block.type === 'callout') {
    return (
      <div ref={containerRef} className="relative group/item">
        <CalloutBlock block={block} onChange={onChange} isArabic={isArabic} />
      </div>
    );
  }

  if (block.type === 'table') {
    return (
      <div ref={containerRef} className="relative group/item">
        <TableBlock block={block} onChange={onChange} isArabic={isArabic} />
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div ref={containerRef} className="relative group/item">
        <ImageBlock block={block} onChange={onChange} isArabic={isArabic} />
      </div>
    );
  }

  if (block.type === 'gradebook') {
    return (
      <div ref={containerRef} className="relative group/item">
        <GradebookBlock
          data={block.gradebookData}
          isArabic={isArabic}
          onChange={updated => onChange({ gradebookData: updated })}
        />
      </div>
    );
  }

  if (block.type === 'exam') {
    return (
      <div ref={containerRef} className="relative group/item">
        <ExamBlock
          data={block.examData}
          isArabic={isArabic}
          onChange={updated => onChange({ examData: updated })}
        />
      </div>
    );
  }

  if (block.type === 'quran') {
    return (
      <div ref={containerRef} className="relative group/item">
        <QuranBlock
          data={block.quranData}
          isArabic={isArabic}
          onChange={updated => onChange({ quranData: updated })}
        />
      </div>
    );
  }

  if (block.type === 'teacher-log') {
    return (
      <div ref={containerRef} className="relative group/item">
        <TeacherLogBlock
          data={block.teacherLogData}
          isArabic={isArabic}
          onChange={updated => onChange({ teacherLogData: updated })}
        />
      </div>
    );
  }

  if (block.type === 'kanban') {
    return (
      <div ref={containerRef} className="relative group/item">
        <KanbanBlock
          data={block.kanbanData}
          isArabic={isArabic}
          onChange={updated => onChange({ kanbanData: updated })}
        />
      </div>
    );
  }

  if (block.type === 'divider') {
    return (
      <div className="py-4 my-2 relative group/item flex items-center justify-center">
        <div className="w-full h-px bg-[#E2E7ED]" />
        <div className="absolute px-3 bg-[#F4F6F8] text-[#5C6B7A] text-xs select-none">
          ❦
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group/block my-1 transition-all rounded-md px-1 ${
        isFocused ? 'bg-[#0D5C75]/5' : 'hover:bg-[#E2E7ED]/20'
      }`}
      dir={blockIsArabic ? 'rtl' : 'ltr'}
    >
      {/* Side Action Gutter */}
      <div
        className="absolute top-1 -start-8 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-0.5 select-none"
        dir="ltr"
      >
        <button
          type="button"
          onClick={() => onAddBelow('paragraph')}
          className="p-1 rounded text-[#5C6B7A] hover:text-[#0D5C75] hover:bg-[#E2E7ED] transition-colors cursor-pointer"
          title={isArabic ? 'إضافة كتلة جديدة' : 'Add block below'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded text-[#5C6B7A] hover:text-[#13171C] hover:bg-[#E2E7ED] transition-colors cursor-pointer"
            title={isArabic ? 'خيارات الكتلة' : 'Block options'}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {showActions && (
            <div
              className="absolute top-full start-0 z-40 w-44 bg-white border border-[#E2E7ED] rounded-lg shadow-lg p-1 text-xs font-sans"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <button
                type="button"
                onClick={() => {
                  onMoveUp();
                  setShowActions(false);
                }}
                disabled={index === 0}
                className="w-full text-start px-2 py-1.5 rounded hover:bg-[#F4F6F8] text-[#13171C] flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#5C6B7A]" />
                <span>{isArabic ? 'تحريك للأعلى' : 'Move Up'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onMoveDown();
                  setShowActions(false);
                }}
                disabled={index === totalBlocks - 1}
                className="w-full text-start px-2 py-1.5 rounded hover:bg-[#F4F6F8] text-[#13171C] flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#5C6B7A]" />
                <span>{isArabic ? 'تحريك للأسفل' : 'Move Down'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  setShowActions(false);
                }}
                className="w-full text-start px-2 py-1.5 rounded hover:bg-[#F4F6F8] text-[#13171C] flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#5C6B7A]" />
                <span>{isArabic ? 'مضاعفة الكتلة' : 'Duplicate'}</span>
              </button>
              <div className="my-1 border-t border-[#E2E7ED]" />
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full text-start px-2 py-1.5 rounded hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'حذف الكتلة' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Block Rendering based on type */}
      <div className="flex items-start gap-2.5 w-full">
        {/* Type specific leading icon / marker */}
        {block.type === 'bullet-list' && (
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#0D5C75] shrink-0 select-none" />
        )}

        {block.type === 'numbered-list' && (
          <span className="mt-1 font-mono text-xs font-semibold text-[#0D5C75] shrink-0 select-none">
            {index + 1}.
          </span>
        )}

        {block.type === 'checkbox' && (
          <button
            type="button"
            onClick={() => onChange({ checked: !block.checked })}
            className={`mt-1.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              block.checked
                ? 'bg-[#0D5C75] border-[#0D5C75] text-white'
                : 'border-[#5C6B7A] bg-white hover:border-[#0D5C75]'
            }`}
          >
            {block.checked && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        )}

        {block.type === 'toggle-list' && (
          <button
            type="button"
            onClick={() => onChange({ isOpen: !block.isOpen })}
            className="mt-1 p-0.5 text-[#5C6B7A] hover:text-[#0D5C75] rounded transition-colors shrink-0 cursor-pointer"
          >
            {block.isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {block.type === 'quote' && (
          <div className="w-1 self-stretch bg-[#0D5C75] rounded-full shrink-0 my-0.5" />
        )}

        {/* Input Textarea & Inline View */}
        <div className="flex-1 min-w-0">
          {block.type === 'toggle-list' && (
            <input
              type="text"
              value={block.summary || ''}
              onChange={e => onChange({ summary: e.target.value })}
              placeholder={isArabic ? 'عنوان القائمة المطوية...' : 'Toggle section header...'}
              className="w-full font-semibold text-sm text-[#13171C] bg-transparent focus:outline-none mb-1"
            />
          )}

          {block.type === 'toggle-list' && !block.isOpen ? (
            <div className="text-xs text-[#5C6B7A] italic py-1">
              {isArabic ? '(القسم مطوي — انقر للتوسيع)' : '(Collapsed — click triangle to expand)'}
            </div>
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  block.type === 'h1'
                    ? isArabic
                      ? 'عنوان رئيسي...'
                      : 'Heading 1...'
                    : block.type === 'h2'
                    ? isArabic
                      ? 'عنوان فرعي...'
                      : 'Heading 2...'
                    : block.type === 'h3'
                    ? isArabic
                      ? 'عنوان قسم...'
                      : 'Heading 3...'
                    : block.type === 'quote'
                    ? isArabic
                      ? 'اكتب الاقتباس...'
                      : 'Scholarly quotation...'
                    : isArabic
                    ? 'اكتب هنا، أو اكتب / أو ، لإدراج كتلة...'
                    : 'Type text, or type / to insert block...'
                }
                className={`w-full bg-transparent resize-none focus:outline-none leading-relaxed transition-all ${
                  block.type === 'h1'
                    ? 'font-scholarly text-2xl font-bold text-[#13171C] pt-2 pb-1'
                    : block.type === 'h2'
                    ? 'font-scholarly text-xl font-bold text-[#13171C] pt-1.5 pb-0.5'
                    : block.type === 'h3'
                    ? 'font-scholarly text-lg font-bold text-[#13171C] pt-1'
                    : block.type === 'quote'
                    ? 'font-scholarly text-base italic text-[#13171C]/90 ps-2 py-0.5'
                    : block.checked
                    ? 'text-sm text-[#5C6B7A] line-through py-0.5'
                    : 'text-sm text-[#13171C] py-0.5'
                }`}
                rows={1}
              />

              {/* Show rich inline formatting overlay when not focused if contains links/tags */}
              {(block.content.includes('[[') || block.content.includes('#')) && (
                <div
                  className="text-xs py-0.5 text-[#5C6B7A] flex items-center gap-1 opacity-80"
                  dir={blockIsArabic ? 'rtl' : 'ltr'}
                >
                  <span className="text-[10px] uppercase font-mono opacity-60">
                    {isArabic ? 'معاينة الروابط:' : 'Preview:'}
                  </span>
                  <InlineFormattedText
                    text={block.content}
                    onWikiLinkClick={onWikiLinkClick}
                    onTagClick={onTagClick}
                  />
                </div>
              )}

              {/* Scholarly Audio Timestamp Pill */}
              {block.recordingTimestamp !== undefined && (
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSeekAudio && onSeekAudio(block.recordingTimestamp!)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0D5C75]/10 hover:bg-[#0D5C75]/20 text-[#0D5C75] border border-[#0D5C75]/20 font-mono text-[11px] font-bold transition-colors cursor-pointer group/audio"
                    title={isArabic ? 'انقر للاستماع إلى هذا الموضع في التسجيل الصوتي' : 'Jump to this timestamp in audio'}
                  >
                    <Clock className="w-3 h-3 text-[#0D5C75]" />
                    <span>{formatAudioTime(block.recordingTimestamp)}</span>
                    <Volume2 className="w-3 h-3 opacity-0 group-hover/audio:opacity-100 transition-opacity" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
