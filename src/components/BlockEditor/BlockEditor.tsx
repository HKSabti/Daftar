import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  AlignRight,
  AlignLeft,
  Sparkles,
  Save,
  Check,
  Tag as TagIcon,
  Link as LinkIcon,
  Calendar,
  Layers,
  Image as ImageIcon,
  Smile,
  MoreHorizontal,
  Folder,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Menu
} from 'lucide-react';
import { Block, BlockType, NoteItem } from '../../types';
import { generateBlockId, blocksToMarkdown, markdownToBlocks } from '../../utils/markdown';
import { audioRecorder } from '../../services/audioRecorder';
import { BlockItem } from './BlockItem';
import { SlashMenu, SlashMenuItem } from './SlashMenu';
import { WikiLinkAutocomplete } from './WikiLinkAutocomplete';
import { TagAutocomplete } from './TagAutocomplete';
import { isArabicText } from '../../utils/arabic';

const EMOJI_OPTIONS = ['📄', '📊', '📝', '📖', '📋', '📌', '🌱', '💡', '🎓', '🔬', '🕋', '✨', '⚡', '🏆', '🎯'];
const COVER_OPTIONS = [
  'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507842229451-9f01dd699bb0?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
];

interface BlockEditorProps {
  note: NoteItem;
  notes: NoteItem[];
  allTags: string[];
  isArabic: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
  onSaveNote: (updatedNote: NoteItem) => Promise<void>;
  onWikiLinkClick: (noteTitle: string) => void;
  onTagClick: (tag: string) => void;
  onSeekAudio?: (timestampSeconds: number) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  note,
  notes,
  allTags,
  isArabic,
  isSidebarOpen = true,
  onToggleSidebar,
  isRightPanelOpen = true,
  onToggleRightPanel,
  onSaveNote,
  onWikiLinkClick,
  onTagClick,
  onSeekAudio,
}) => {
  const [title, setTitle] = useState(note.title);
  const [icon, setIcon] = useState<string | undefined>(note.icon);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(note.coverUrl);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [direction, setDirection] = useState<'auto' | 'rtl' | 'ltr'>(note.direction || 'auto');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Slash Menu state
  const [slashMenuState, setSlashMenuState] = useState<{
    isOpen: boolean;
    filter: string;
    blockId: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    filter: '',
    blockId: '',
    position: { top: 0, left: 0 },
  });

  // WikiLink Autocomplete state
  const [wikiState, setWikiState] = useState<{
    isOpen: boolean;
    query: string;
    blockId: string;
    cursorOffset: number;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: '',
    blockId: '',
    cursorOffset: 0,
    position: { top: 0, left: 0 },
  });

  // Tag Autocomplete state
  const [tagState, setTagState] = useState<{
    isOpen: boolean;
    query: string;
    blockId: string;
    cursorOffset: number;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: '',
    blockId: '',
    cursorOffset: 0,
    position: { top: 0, left: 0 },
  });

  // Sync state when active note changes
  useEffect(() => {
    setTitle(note.title);
    setIcon(note.icon);
    setCoverUrl(note.coverUrl);
    setDirection(note.direction || 'auto');
    const parsed = note.blocks && note.blocks.length > 0 ? note.blocks : markdownToBlocks(note.content);
    setBlocks(parsed);
    setSaveStatus('saved');
  }, [note.id]);

  // Auto-save debounce
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('dirty');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const markdown = blocksToMarkdown(blocks);
      await onSaveNote({
        ...note,
        title,
        icon,
        coverUrl,
        direction,
        blocks,
        content: markdown,
        updatedAt: Date.now(),
      });
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [blocks, title, direction, icon, coverUrl]);

  // Block modification handlers
  const handleBlockChange = (blockId: string, updated: Partial<Block>) => {
    let stamping: Partial<Block> = {};
    if (audioRecorder.isActive()) {
      const currentSec = audioRecorder.getElapsedTime();
      stamping = { recordingTimestamp: currentSec };
      if (updated.content) {
        audioRecorder.logBlockCaptured(blockId, updated.content, currentSec);
      }
    }

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const merged = { ...b, ...updated };
          if (b.recordingTimestamp === undefined && stamping.recordingTimestamp !== undefined) {
            merged.recordingTimestamp = stamping.recordingTimestamp;
          }
          return merged;
        }
        return b;
      })
    );
  };

  const handleAddBlockBelow = (targetBlockId: string, type: BlockType = 'paragraph') => {
    const isRec = audioRecorder.isActive();
    const currentSec = isRec ? audioRecorder.getElapsedTime() : undefined;

    const newBlock: Block = {
      id: generateBlockId(),
      type,
      content: '',
      recordingTimestamp: currentSec,
    };

    if (type === 'gradebook') {
      newBlock.gradebookData = {
        title: isArabic ? 'سجل درجات الطلاب والمتابعة' : 'Gradebook Register',
        subject: isArabic ? 'الرياضيات والعلوم' : 'Mathematics & Science',
        className: isArabic ? 'الصف العاشر - علمي 1' : 'Grade 10 - Sci 1',
        semester: isArabic ? 'الفصل الدراسي الأول' : 'First Semester',
        columns: [
          { id: 'c1', title: isArabic ? 'المشاركة والأنشطة' : 'Participation', maxScore: 20 },
          { id: 'c2', title: isArabic ? 'اختبار قصير 1' : 'Quiz 1', maxScore: 20 },
          { id: 'c3', title: isArabic ? 'اختبار نصفي' : 'Midterm', maxScore: 20 },
          { id: 'c4', title: isArabic ? 'اختبار نهائي' : 'Final', maxScore: 40 },
        ],
        students: [
          { id: '1', name: isArabic ? 'عبدالرحمن خالد الشمري' : 'Abdulrahman Khaled', scores: { c1: 19, c2: 18, c3: 19, c4: 38 }, attendance: 'present' },
          { id: '2', name: isArabic ? 'فهد محمد العازمي' : 'Fahad Mohammed', scores: { c1: 17, c2: 16, c3: 18, c4: 35 }, attendance: 'present' },
          { id: '3', name: isArabic ? 'يوسف إبراهيم الكندري' : 'Yousef Ibrahim', scores: { c1: 20, c2: 20, c3: 19, c4: 40 }, attendance: 'present' },
        ],
      };
    } else if (type === 'exam') {
      newBlock.examData = {
        title: isArabic ? 'اختبار تقويم فصلي' : 'Term Assessment Quiz',
        totalPoints: 20,
        questions: [
          {
            id: 'q1',
            question: isArabic ? 'ما هي وحدة قياس القوة في النظام الدولي؟' : 'What is the SI unit of force?',
            type: 'multiple-choice',
            options: isArabic ? ['النيوتن (Newton)', 'الجول (Joule)', 'الباسكال (Pascal)', 'الواط (Watt)'] : ['Newton', 'Joule', 'Pascal', 'Watt'],
            correctAnswer: 0,
            points: 10,
            explanation: isArabic ? 'النيوتن هو وحدة القوة (كغ.م/ث²).' : 'Newton is the SI unit of force.',
          },
        ],
      };
    } else if (type === 'quran') {
      newBlock.quranData = {
        surahNumber: 96,
        surahNameAr: 'سورة العلق',
        surahNameEn: 'Surah Al-Alaq',
        verseNumber: 1,
        textUthmani: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴿١﴾ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ﴿٢﴾ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ﴿٣﴾',
        tafsir: 'أول ما نزل من القرآن العظيم تنبيهاً على شرف العلم.',
      };
    } else if (type === 'teacher-log') {
      newBlock.teacherLogData = {
        date: new Date().toISOString().split('T')[0],
        teacherName: isArabic ? 'أ. أحمد المطيري' : 'Mr. Ahmed Al-Mutairi',
        department: isArabic ? 'قسم العلوم' : 'Science Dept',
        subject: isArabic ? 'الفيزياء' : 'Physics',
        topic: isArabic ? 'قوانين نيوتن للحركة' : "Newton's Laws",
        period: 2,
        classroom: isArabic ? '10/3' : '10/3',
        observations: isArabic ? 'تفاعل ممتاز وشرح مدعم بالوسائل الحديثة.' : 'Great interaction.',
        evaluations: { preparation: 5, engagement: 5, timeManagement: 4, classroomControl: 5 },
        recommendations: isArabic ? 'استمرار التميز والتحفيز المستمر.' : 'Keep up the good work.',
      };
    } else if (type === 'kanban') {
      newBlock.kanbanData = {
        columns: [
          { id: 'c1', title: isArabic ? 'قيد الانتظار ⏳' : 'To Do', cards: [{ id: '1', title: isArabic ? 'تحضير درس الغد' : 'Lesson Prep' }] },
          { id: 'c2', title: isArabic ? 'جاري التنفيذ 🚀' : 'In Progress', cards: [] },
          { id: 'c3', title: isArabic ? 'مكتمل ✅' : 'Done', cards: [] },
        ],
      };
    }

    if (!targetBlockId || targetBlockId === 'root') {
      setBlocks(prev => [...prev, newBlock]);
      return;
    }

    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === targetBlockId);
      if (idx === -1) return [...prev, newBlock];
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => {
      if (prev.length <= 1) {
        return [{ id: generateBlockId(), type: 'paragraph', content: '' }];
      }
      return prev.filter(b => b.id !== blockId);
    });
  };

  const handleMoveBlock = (index: number, dir: 'up' | 'down') => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === blocks.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    setBlocks(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
  };

  const handleDuplicateBlock = (index: number) => {
    const blockToDup = blocks[index];
    if (!blockToDup) return;
    const duplicated: Block = {
      ...JSON.parse(JSON.stringify(blockToDup)),
      id: generateBlockId(),
    };
    setBlocks(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
  };

  // Slash Menu Selection
  const handleSelectSlashItem = (item: SlashMenuItem) => {
    const { blockId } = slashMenuState;
    if (!blockId) return;

    handleAddBlockBelow(blockId, item.type);
    setSlashMenuState({ isOpen: false, filter: '', blockId: '', position: { top: 0, left: 0 } });
  };

  // WikiLink selection
  const handleSelectWikiLink = (selectedTitle: string) => {
    const { blockId } = wikiState;
    if (!blockId) return;

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const newContent = b.content.replace(/\[\[([^\]]*)$/, `[[${selectedTitle}]] `);
          return { ...b, content: newContent };
        }
        return b;
      })
    );

    setWikiState({ isOpen: false, query: '', blockId: '', cursorOffset: 0, position: { top: 0, left: 0 } });
  };

  // Tag selection
  const handleSelectTag = (selectedTag: string) => {
    const { blockId } = tagState;
    if (!blockId) return;

    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const newContent = b.content.replace(/(?:^|\s)#([\w\u0600-\u06FF_-]*)$/, ` #${selectedTag} `);
          return { ...b, content: newContent };
        }
        return b;
      })
    );

    setTagState({ isOpen: false, query: '', blockId: '', cursorOffset: 0, position: { top: 0, left: 0 } });
  };

  const resolvedDirection =
    direction === 'auto'
      ? isArabicText(title) || (blocks[0] && isArabicText(blocks[0].content))
        ? 'rtl'
        : 'ltr'
      : direction;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white flex flex-col selection:bg-[#2383E2]/20 font-notion text-[#37352F]">
      {/* Top Notion-style Navigation & Status Bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E9E9E8]/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#787774]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                !isSidebarOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs font-semibold'
                  : 'hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] border-transparent'
              }`}
              title={
                isSidebarOpen
                  ? isArabic
                    ? 'إخفاء القائمة الجانبية (⌘\\)'
                    : 'Hide sidebar (⌘\\)'
                  : isArabic
                  ? 'إظهار القائمة الجانبية (⌘\\)'
                  : 'Show sidebar (⌘\\)'
              }
            >
              {!isSidebarOpen ? (
                <>
                  <PanelLeft className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden sm:inline text-[11px]">
                    {isArabic ? 'القائمة' : 'Menu'}
                  </span>
                </>
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          <span className="text-sm shrink-0">{icon || '📄'}</span>
          <span className="font-medium text-[#37352F] truncate max-w-xs">{title || (isArabic ? 'بدون عنوان' : 'Untitled')}</span>
          <span className="opacity-40 shrink-0">•</span>
          <span className="text-[11px] shrink-0">
            {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center bg-[#F7F6F3] border border-[#E9E9E8] rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setDirection('auto')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                direction === 'auto' ? 'bg-white text-[#37352F] shadow-2xs' : 'text-[#787774] hover:text-[#37352F]'
              }`}
            >
              {isArabic ? 'تلقائي' : 'Auto'}
            </button>
            <button
              type="button"
              onClick={() => setDirection('rtl')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                direction === 'rtl' ? 'bg-white text-[#37352F] shadow-2xs' : 'text-[#787774] hover:text-[#37352F]'
              }`}
              title="RTL"
            >
              <AlignRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setDirection('ltr')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                direction === 'ltr' ? 'bg-white text-[#37352F] shadow-2xs' : 'text-[#787774] hover:text-[#37352F]'
              }`}
              title="LTR"
            >
              <AlignLeft className="w-3 h-3" />
            </button>
          </div>

          {/* Save status badge */}
          <div className="flex items-center gap-1 text-[11px] text-[#787774] font-medium px-2 py-0.5">
            {saveStatus === 'saving' ? (
              <span>{isArabic ? 'جارِ الحفظ...' : 'Saving...'}</span>
            ) : saveStatus === 'saved' ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="w-3 h-3" />
                <span>{isArabic ? 'تم الحفظ' : 'Saved'}</span>
              </span>
            ) : (
              <span>{isArabic ? 'تعديلات...' : 'Unsaved'}</span>
            )}
          </div>

          {/* Right Marginalia Panel Toggle Button */}
          {onToggleRightPanel && (
            <button
              type="button"
              onClick={onToggleRightPanel}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                !isRightPanelOpen
                  ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700 shadow-2xs'
                  : 'hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] border-transparent'
              }`}
              title={
                isRightPanelOpen
                  ? isArabic
                    ? 'إخفاء الحاشية والروابط'
                    : 'Hide Marginalia panel'
                  : isArabic
                  ? 'إظهار الحاشية والروابط'
                  : 'Show Marginalia panel'
              }
            >
              {isRightPanelOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRight className="w-4 h-4 text-sky-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notion Cover Image */}
      {coverUrl ? (
        <div className="w-full h-44 sm:h-52 relative group/cover overflow-hidden bg-slate-200">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-end justify-end p-4">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs rounded-lg p-1 shadow-md">
              <button
                type="button"
                onClick={() => setCoverUrl(COVER_OPTIONS[(COVER_OPTIONS.indexOf(coverUrl) + 1) % COVER_OPTIONS.length])}
                className="px-2.5 py-1 text-xs text-[#37352F] hover:bg-black/10 rounded-md font-medium"
              >
                {isArabic ? 'تغيير الغلاف' : 'Change Cover'}
              </button>
              <button
                type="button"
                onClick={() => setCoverUrl(undefined)}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium"
              >
                {isArabic ? 'إزالة' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Notion Canvas Column */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-12 py-8" dir={resolvedDirection}>
        {/* Page Icon & Notion Customizer Hover Actions */}
        <div className="group/page-meta mb-4">
          <div className="flex items-center gap-2 opacity-0 group-hover/page-meta:opacity-100 transition-opacity mb-2">
            {!icon && (
              <button
                type="button"
                onClick={() => setIcon('📄')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#EFEFEF] text-xs text-[#787774] transition-colors"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إضافة أيقونة' : 'Add icon'}</span>
              </button>
            )}
            {!coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(COVER_OPTIONS[0])}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#EFEFEF] text-xs text-[#787774] transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إضافة غلاف' : 'Add cover'}</span>
              </button>
            )}
          </div>

          {/* Large Notion Page Icon */}
          {icon && (
            <div className="relative inline-block mb-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-4xl md:text-5xl hover:scale-105 transition-transform p-1 rounded-xl hover:bg-[#EFEFEF] cursor-pointer"
              >
                {icon}
              </button>

              {showEmojiPicker && (
                <div className="absolute z-30 top-full mt-1 start-0 p-2 bg-white border border-[#E9E9E8] rounded-xl shadow-lg grid grid-cols-5 gap-1 w-48">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setIcon(em);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 hover:bg-[#EFEFEF] rounded text-xl flex items-center justify-center cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIcon(undefined);
                      setShowEmojiPicker(false);
                    }}
                    className="col-span-5 text-[10px] text-rose-600 hover:bg-rose-50 rounded py-1 mt-1"
                  >
                    {isArabic ? 'إزالة الأيقونة' : 'Remove Icon'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notion Page Title Input */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isArabic ? 'بدون عنوان...' : 'Untitled...'}
            className="w-full text-3xl md:text-4xl font-bold text-[#37352F] bg-transparent focus:outline-hidden placeholder:text-[#9B9A97]/50 leading-tight"
          />
        </div>

        {/* Blocks Container */}
        <div className="space-y-1">
          {blocks.map((block, idx) => (
            <BlockItem
              key={block.id}
              block={block}
              index={idx}
              totalBlocks={blocks.length}
              isArabic={isArabic}
              notes={notes}
              allTags={allTags}
              onChange={updated => handleBlockChange(block.id, updated)}
              onDelete={() => handleDeleteBlock(block.id)}
              onAddBelow={type => handleAddBlockBelow(block.id, type)}
              onMoveUp={() => handleMoveBlock(idx, 'up')}
              onMoveDown={() => handleMoveBlock(idx, 'down')}
              onDuplicate={() => handleDuplicateBlock(idx)}
              onOpenSlashMenu={(rect, filter, blockId) => {
                setSlashMenuState({
                  isOpen: true,
                  filter,
                  blockId,
                  position: { top: rect.bottom + 4, left: isArabic ? rect.right - 280 : rect.left },
                });
              }}
              onOpenWikiAutocomplete={(rect, query, blockId, cursorOffset) => {
                setWikiState({
                  isOpen: true,
                  query,
                  blockId,
                  cursorOffset,
                  position: { top: rect.bottom + 4, left: isArabic ? rect.right - 250 : rect.left },
                });
              }}
              onOpenTagAutocomplete={(rect, query, blockId, cursorOffset) => {
                setTagState({
                  isOpen: true,
                  query,
                  blockId,
                  cursorOffset,
                  position: { top: rect.bottom + 4, left: isArabic ? rect.right - 220 : rect.left },
                });
              }}
              onWikiLinkClick={onWikiLinkClick}
              onTagClick={onTagClick}
              onSeekAudio={onSeekAudio}
            />
          ))}
        </div>

        {/* Add Block at Bottom */}
        <div className="mt-8 pt-4 border-t border-dashed border-[#E9E9E8] flex items-center justify-center">
          <button
            type="button"
            onClick={() => handleAddBlockBelow(blocks[blocks.length - 1]?.id || 'root', 'paragraph')}
            className="px-4 py-2 rounded-full bg-white border border-[#E9E9E8] text-[#787774] hover:text-[#37352F] hover:border-[#2383E2]/40 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#2383E2]" />
            <span>{isArabic ? 'إضافة محتوى جديد (أو اكتب / للخيارات)' : 'Click to add block, or type /'}</span>
          </button>
        </div>
      </div>

      {/* Floating Popups */}
      {slashMenuState.isOpen && (
        <SlashMenu
          filterText={slashMenuState.filter}
          onSelect={handleSelectSlashItem}
          onClose={() =>
            setSlashMenuState({ isOpen: false, filter: '', blockId: '', position: { top: 0, left: 0 } })
          }
          isArabic={isArabic}
          position={slashMenuState.position}
        />
      )}

      {wikiState.isOpen && (
        <WikiLinkAutocomplete
          query={wikiState.query}
          notes={notes}
          position={wikiState.position}
          onSelect={handleSelectWikiLink}
          onClose={() =>
            setWikiState({ isOpen: false, query: '', blockId: '', cursorOffset: 0, position: { top: 0, left: 0 } })
          }
          isArabic={isArabic}
        />
      )}

      {tagState.isOpen && (
        <TagAutocomplete
          query={tagState.query}
          allTags={allTags}
          position={tagState.position}
          onSelect={handleSelectTag}
          onClose={() =>
            setTagState({ isOpen: false, query: '', blockId: '', cursorOffset: 0, position: { top: 0, left: 0 } })
          }
          isArabic={isArabic}
        />
      )}
    </div>
  );
};
