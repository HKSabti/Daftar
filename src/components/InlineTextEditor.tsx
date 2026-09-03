import React, { useMemo } from 'react';
import { extractWikiLinks, extractTags } from '../utils/arabic';

interface InlineFormattedTextProps {
  text: string;
  onWikiLinkClick?: (noteTitle: string) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
  isEditing?: boolean;
}

/**
 * Renders inline text with highlight for:
 * - [[Wiki Links]] -> styled scholarly cyan anchor
 * - #tags -> styled slate badge
 * - **bold** and *italic*
 * - `code` -> monospaced badge with bdi isolation
 */
export const InlineFormattedText: React.FC<InlineFormattedTextProps> = ({
  text,
  onWikiLinkClick,
  onTagClick,
  className = '',
}) => {
  const elements = useMemo(() => {
    if (!text) return null;

    // Tokenize text for inline markdown: [[link]], #tag, `code`, **bold**, *italic*
    const regex = /(\[\[(?:[^\]|]+)(?:\|(?:[^\]]+))?\]\]|#[\w\u0600-\u06FF_-]+|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Wiki-link [[Note Title]] or [[Note Title|Custom Label]]
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const inner = part.slice(2, -2);
        const [target, label] = inner.split('|').map(s => s.trim());
        const display = label || target;

        return (
          <button
            key={index}
            type="button"
            onClick={e => {
              e.stopPropagation();
              onWikiLinkClick?.(target);
            }}
            className="inline-flex items-center text-[#0D5C75] hover:text-[#083E50] hover:underline font-medium decoration-[#0D5C75]/40 transition-colors mx-0.5 cursor-pointer"
            title={`الانتقال إلى: ${target}`}
          >
            <span className="opacity-40 text-xs font-mono select-none">⟦</span>
            <span className="px-0.5">{display}</span>
            <span className="opacity-40 text-xs font-mono select-none">⟧</span>
          </button>
        );
      }

      // Tag #example or #تحقيق
      if (part.startsWith('#') && part.length > 1) {
        const tag = part.slice(1);
        return (
          <button
            key={index}
            type="button"
            onClick={e => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[#E2E7ED]/70 text-[#5C6B7A] hover:bg-[#0D5C75]/10 hover:text-[#0D5C75] transition-colors mx-0.5 cursor-pointer align-baseline"
          >
            <span className="opacity-60 mr-0.5">#</span>
            <span>{tag}</span>
          </button>
        );
      }

      // Inline code `const x = 1` with BDI isolation
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const code = part.slice(1, -1);
        return (
          <bdi
            key={index}
            className="inline-block px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-[#E2E7ED]/60 text-[#13171C] rounded border border-[#E2E7ED] align-baseline bdi-isolate"
          >
            {code}
          </bdi>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-bold text-[#13171C]">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic text-[#13171C]">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={index}>{part}</span>;
    });
  }, [text, onWikiLinkClick, onTagClick]);

  return <span className={className}>{elements}</span>;
};
