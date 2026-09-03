import React from 'react';
import {
  Bookmark,
  AlertCircle,
  Sparkles,
  Quote as QuoteIcon,
  HelpCircle,
} from 'lucide-react';
import { Block } from '../../types';

interface CalloutBlockProps {
  block: Block;
  onChange: (updated: Partial<Block>) => void;
  isArabic: boolean;
  onFocus?: () => void;
}

const CALLOUT_TYPES = [
  {
    type: 'scholarly' as const,
    labelAr: 'حاشية تحقيق',
    labelEn: 'Scholarly Note',
    icon: <Bookmark className="w-4 h-4 text-[#0D5C75]" />,
    bg: 'bg-[#0D5C75]/5',
    border: 'border-[#0D5C75]/30',
    titleColor: 'text-[#0D5C75]',
  },
  {
    type: 'note' as const,
    labelAr: 'تنبيه فائدة',
    labelEn: 'Note / Insight',
    icon: <Sparkles className="w-4 h-4 text-[#0D5C75]" />,
    bg: 'bg-white',
    border: 'border-[#E2E7ED]',
    titleColor: 'text-[#13171C]',
  },
  {
    type: 'warning' as const,
    labelAr: 'تنبيه احتراز',
    labelEn: 'Caution',
    icon: <AlertCircle className="w-4 h-4 text-amber-700" />,
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    titleColor: 'text-amber-800',
  },
  {
    type: 'quote' as const,
    labelAr: 'نص مسند',
    labelEn: 'Attributed Citation',
    icon: <QuoteIcon className="w-4 h-4 text-[#5C6B7A]" />,
    bg: 'bg-[#F4F6F8]',
    border: 'border-[#E2E7ED]',
    titleColor: 'text-[#5C6B7A]',
  },
];

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  onChange,
  isArabic,
  onFocus,
}) => {
  const currentType = block.calloutType || 'scholarly';
  const config =
    CALLOUT_TYPES.find(c => c.type === currentType) || CALLOUT_TYPES[0];

  return (
    <div
      className={`my-3 p-3.5 rounded-lg border ${config.bg} ${config.border} transition-colors group`}
      onClick={onFocus}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E7ED]/50 text-xs">
        <div className="flex items-center gap-2">
          {config.icon}
          <input
            type="text"
            value={block.calloutTitle || ''}
            onChange={e => onChange({ calloutTitle: e.target.value })}
            placeholder={
              isArabic
                ? config.labelAr
                : config.labelEn
            }
            className={`font-semibold bg-transparent focus:outline-none placeholder:text-[#5C6B7A]/60 ${config.titleColor}`}
          />
        </div>

        <select
          value={currentType}
          onChange={e => onChange({ calloutType: e.target.value as any })}
          className="bg-transparent text-xs text-[#5C6B7A] focus:outline-none cursor-pointer"
        >
          {CALLOUT_TYPES.map(t => (
            <option key={t.type} value={t.type}>
              {isArabic ? t.labelAr : t.labelEn}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
        placeholder={
          isArabic
            ? 'اكتب نص التنبيه أو الشرح الهامشي هنا...'
            : 'Write the callout content or marginal note here...'
        }
        className="w-full bg-transparent text-sm leading-relaxed text-[#13171C] focus:outline-none resize-y min-h-[60px]"
        rows={2}
      />
    </div>
  );
};
