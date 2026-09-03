import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { Sigma, Check, Edit2 } from 'lucide-react';
import { Block } from '../../types';

interface MathBlockProps {
  block: Block;
  onChange: (updated: Partial<Block>) => void;
  isArabic: boolean;
  onFocus?: () => void;
}

export const MathBlock: React.FC<MathBlockProps> = ({
  block,
  onChange,
  isArabic,
  onFocus,
}) => {
  const [isEditing, setIsEditing] = useState(!block.mathFormula && !block.content);
  const [formula, setFormula] = useState(block.mathFormula || block.content || 'E = mc^2');
  const renderedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renderedRef.current && !isEditing) {
      try {
        const mathStr = formula || block.mathFormula || block.content || '';
        katex.render(mathStr, renderedRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        if (renderedRef.current) {
          renderedRef.current.innerHTML = `<span class="text-rose-600 text-xs font-mono">LaTeX Error: ${err}</span>`;
        }
      }
    }
  }, [formula, isEditing, block.mathFormula, block.content]);

  const handleSave = () => {
    onChange({
      mathFormula: formula,
      content: formula,
    });
    setIsEditing(false);
  };

  return (
    <div
      className="my-3 p-4 rounded-lg bg-white border border-[#E2E7ED] hover:border-[#0D5C75]/40 transition-colors group relative"
      onClick={onFocus}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E7ED]/50 text-xs text-[#5C6B7A]">
        <div className="flex items-center gap-1.5 font-medium">
          <Sigma className="w-3.5 h-3.5 text-[#0D5C75]" />
          <span>{isArabic ? 'معادلة رياضية (KaTeX / LaTeX)' : 'Math Formula (KaTeX)'}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="px-2 py-1 rounded bg-[#F4F6F8] hover:bg-[#E2E7ED] text-[#13171C] text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          {isEditing ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{isArabic ? 'تم وتطبيق' : 'Apply'}</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3 h-3 text-[#5C6B7A]" />
              <span>{isArabic ? 'تعديل الصيغة' : 'Edit LaTeX'}</span>
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={formula}
            onChange={e => setFormula(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder={
              isArabic
                ? 'اكتب صيغة LaTeX مثل: \\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}'
                : 'Write LaTeX formula e.g.: \\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}'
            }
            className="w-full h-20 p-2.5 font-mono text-sm bg-[#F4F6F8] border border-[#E2E7ED] rounded focus:outline-none focus:border-[#0D5C75] text-[#13171C] resize-y"
            dir="ltr"
            autoFocus
          />
          <div className="text-[11px] text-[#5C6B7A] flex items-center justify-between" dir={isArabic ? 'rtl' : 'ltr'}>
            <span>{isArabic ? 'اضغط Ctrl+Enter لتطبيق المعادلة' : 'Press Ctrl+Enter to apply'}</span>
            <div className="space-x-1" dir="ltr">
              <button
                type="button"
                onClick={() => setFormula('\\frac{a}{b} = \\sqrt{c^2 + d^2}')}
                className="px-1.5 py-0.5 bg-[#E2E7ED]/70 hover:bg-[#E2E7ED] rounded text-[10px] font-mono cursor-pointer"
              >
                \frac
              </button>
              <button
                type="button"
                onClick={() => setFormula('\\sum_{i=1}^{n} x_i')}
                className="px-1.5 py-0.5 bg-[#E2E7ED]/70 hover:bg-[#E2E7ED] rounded text-[10px] font-mono cursor-pointer"
              >
                \sum
              </button>
              <button
                type="button"
                onClick={() => setFormula('\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}')}
                className="px-1.5 py-0.5 bg-[#E2E7ED]/70 hover:bg-[#E2E7ED] rounded text-[10px] font-mono cursor-pointer"
              >
                \int
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={renderedRef}
          className="py-4 text-center overflow-x-auto text-lg text-[#13171C] select-text"
          dir="ltr"
        />
      )}
    </div>
  );
};
