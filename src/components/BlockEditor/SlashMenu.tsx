import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ChevronRight,
  CheckSquare,
  Code2,
  Quote,
  AlertCircle,
  Minus,
  Table as TableIcon,
  Image as ImageIcon,
  Sigma,
} from 'lucide-react';
import { BlockType } from '../../types';

export interface SlashMenuItem {
  type: BlockType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: React.ReactNode;
  shortcut?: string;
  defaultData?: any;
}

const MENU_ITEMS: SlashMenuItem[] = [
  {
    type: 'paragraph',
    titleAr: 'فقرة نصية',
    titleEn: 'Text Paragraph',
    descAr: 'نص عادي للكتابة والتحقيق والملاحظات',
    descEn: 'Plain scholarly text with inline links and tags',
    icon: <Type className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'h1',
    titleAr: 'عنوان رئيسي (H1)',
    titleEn: 'Heading 1',
    descAr: 'عنوان باب أو فصل رئيسي كبير',
    descEn: 'Large section heading',
    shortcut: '#',
    icon: <Heading1 className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'h2',
    titleAr: 'عنوان فرعي (H2)',
    titleEn: 'Heading 2',
    descAr: 'عنوان مسألة أو مبحث فرعي',
    descEn: 'Medium subsection heading',
    shortcut: '##',
    icon: <Heading2 className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'h3',
    titleAr: 'عنوان قسم (H3)',
    titleEn: 'Heading 3',
    descAr: 'عنوان فرع أو فائدة صغيرة',
    descEn: 'Small subdivision heading',
    shortcut: '###',
    icon: <Heading3 className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'bullet-list',
    titleAr: 'قائمة نقطية',
    titleEn: 'Bulleted List',
    descAr: 'سرد نقطي للأفكار والملاحظات',
    descEn: 'Unordered bulleted points',
    shortcut: '-',
    icon: <List className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'numbered-list',
    titleAr: 'قائمة رقمية',
    titleEn: 'Numbered List',
    descAr: 'ترتيب تسلسلي مرقم للخطوات أو الشروط',
    descEn: 'Ordered sequential list',
    shortcut: '1.',
    icon: <ListOrdered className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'toggle-list',
    titleAr: 'قائمة مطوية (Toggle)',
    titleEn: 'Toggle List',
    descAr: 'كتلة مطوية لإخفاء وإظهار الشروح المطولة',
    descEn: 'Collapsible section with toggle triangle',
    icon: <ChevronRight className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'checkbox',
    titleAr: 'مهمة / تدقيق (Checkbox)',
    titleEn: 'To-do Checkbox',
    descAr: 'قائمة مربعات اختيار لمهام المقابلة والتحقيق',
    descEn: 'Task item with checkbox',
    shortcut: '[]',
    icon: <CheckSquare className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'quote',
    titleAr: 'اقتباس تراثي',
    titleEn: 'Scholarly Quote',
    descAr: 'اقتباس منسوب مع خط حاشية عمودي',
    descEn: 'Blockquote with manuscript lineation',
    shortcut: '>',
    icon: <Quote className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'callout',
    titleAr: 'تنبيه / حاشية (Callout)',
    titleEn: 'Scholarly Callout',
    descAr: 'صندوق حاشية مميز للفوائد والتنبيهات',
    descEn: 'Highlighted box for warnings and marginalia',
    icon: <AlertCircle className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'code',
    titleAr: 'كتلة برمجية (Code)',
    titleEn: 'Code Block',
    descAr: 'كود برمجي مع تمييز النصوص واللغة',
    descEn: 'Syntax-highlighted code block',
    shortcut: '```',
    icon: <Code2 className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'math',
    titleAr: 'معادلة رياضية (KaTeX)',
    titleEn: 'Math Formula',
    descAr: 'صياغة المعادلات الرياضية والرموز بنظام LaTeX',
    descEn: 'Mathematical notation with KaTeX',
    shortcut: '$$',
    icon: <Sigma className="w-4 h-4 text-[#0D5C75]" />,
  },
  {
    type: 'table',
    titleAr: 'جدول مقارنة (Table)',
    titleEn: 'Table',
    descAr: 'جدول لمقارنة النسخ والبيانات المنسقة',
    descEn: 'Tabular data with editable rows and columns',
    icon: <TableIcon className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'gradebook',
    titleAr: 'سجل درجات ومتابعة (Gradebook)',
    titleEn: 'Teacher Gradebook',
    descAr: 'سجل إلكتروني متكامل للدرجات واستيراد الأسماء بالكاميرا أو Excel',
    descEn: 'Full gradebook with OCR camera & Excel roster import',
    shortcut: '/grades',
    icon: <TableIcon className="w-4 h-4 text-[#2383E2]" />,
  },
  {
    type: 'exam',
    titleAr: 'اختبار تفاعلي (قابل للحل والتصحيح)',
    titleEn: 'Interactive Exam / Quiz',
    descAr: 'اختبار بأسئلة اختيار من متعدد وصح/خطأ مع التصحيح التلقائي والنتيجة',
    descEn: 'Solvable quiz with instant auto-grading & scoring',
    shortcut: '/exam',
    icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
  },
  {
    type: 'quran',
    titleAr: 'مقتبس قرآني بالرسم العثماني',
    titleEn: 'Quran Verse & Tafsir',
    descAr: 'آيات بالخط العثماني المصحفي مع التفسير والبيان',
    descEn: 'Holy Quran verse in Uthmani calligraphy with Tafsir',
    shortcut: '/quran',
    icon: <Quote className="w-4 h-4 text-emerald-600" />,
  },
  {
    type: 'teacher-log',
    titleAr: 'سجل زيارات وتقييم المعلمين (رؤساء الأقسام)',
    titleEn: 'Teacher Observation Log',
    descAr: 'استمارة إشرافية لرؤساء الأقسام لتقييم الحصص الدراسية',
    descEn: 'HOD classroom observation form with star ratings',
    shortcut: '/hod',
    icon: <AlertCircle className="w-4 h-4 text-sky-600" />,
  },
  {
    type: 'kanban',
    titleAr: 'لوحة كانبان للمهام (Kanban Board)',
    titleEn: 'Kanban Project Board',
    descAr: 'لوحة تفاعلية لإدارة المهام والمشاريع بأسلوب نوشن',
    descEn: 'Notion-style agile Kanban board with to-do columns',
    shortcut: '/kanban',
    icon: <TableIcon className="w-4 h-4 text-indigo-600" />,
  },
  {
    type: 'image',
    titleAr: 'صورة / وثيقة مصورة',
    titleEn: 'Image / Attachment',
    descAr: 'إدراج صورة مخطوط أو رسم بياني في المرفقات',
    descEn: 'Upload or link an image stored in vault attachments',
    icon: <ImageIcon className="w-4 h-4 text-[#5C6B7A]" />,
  },
  {
    type: 'divider',
    titleAr: 'فاصل مخطوط (Divider)',
    titleEn: 'Divider',
    descAr: 'خط فاصل بين المباحث والفصول',
    descEn: 'Horizontal rule dividing sections',
    shortcut: '---',
    icon: <Minus className="w-4 h-4 text-[#5C6B7A]" />,
  },
];

interface SlashMenuProps {
  filterText: string;
  onSelect: (item: SlashMenuItem) => void;
  onClose: () => void;
  isArabic: boolean;
  position: { top: number; left: number };
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  filterText,
  onSelect,
  onClose,
  isArabic,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = MENU_ITEMS.filter(item => {
    if (!filterText) return true;
    const query = filterText.toLowerCase();
    return (
      item.titleAr.toLowerCase().includes(query) ||
      item.titleEn.toLowerCase().includes(query) ||
      item.descAr.toLowerCase().includes(query) ||
      item.descEn.toLowerCase().includes(query) ||
      (item.shortcut && item.shortcut.includes(query))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

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

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-white border border-[#E2E7ED] rounded-lg shadow-lg p-1 text-sm font-sans"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="px-2 py-1.5 text-xs font-semibold text-[#5C6B7A] border-b border-[#E2E7ED]/70 mb-1 flex items-center justify-between">
        <span>{isArabic ? 'إدراج كتلة جديدة' : 'Insert Block'}</span>
        <kbd className="px-1 py-0.5 bg-[#F4F6F8] rounded text-[10px] text-[#5C6B7A] border border-[#E2E7ED]">
          ESC
        </kbd>
      </div>

      <div className="space-y-0.5">
        {filteredItems.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-start px-2 py-1.5 rounded flex items-center gap-2.5 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#0D5C75]/10 text-[#0D5C75]'
                  : 'hover:bg-[#F4F6F8] text-[#13171C]'
              }`}
            >
              <div
                className={`p-1 rounded shrink-0 ${
                  isSelected ? 'bg-white text-[#0D5C75]' : 'bg-[#F4F6F8] text-[#5C6B7A]'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate flex items-center justify-between">
                  <span>{isArabic ? item.titleAr : item.titleEn}</span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-[#5C6B7A] opacity-70">
                      {item.shortcut}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#5C6B7A] truncate">
                  {isArabic ? item.descAr : item.descEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
