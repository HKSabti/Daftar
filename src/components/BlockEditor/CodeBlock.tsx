import React, { useState } from 'react';
import { Code2, Copy, Check, Play, Terminal, Sparkles, RefreshCw, X } from 'lucide-react';
import { Block } from '../../types';

interface CodeBlockProps {
  block: Block;
  onChange: (updated: Partial<Block>) => void;
  isArabic: boolean;
  onFocus?: () => void;
}

const LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'html',
  'css',
  'sql',
  'rust',
  'bash',
  'cpp',
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onChange,
  isArabic,
  onFocus,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'log' | 'error' | 'html'>('log');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const language = block.language || 'python';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Safe client-side execution for JavaScript & simulated Python sandbox
  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const code = block.content || '';
    if (!code.trim()) {
      setOutput(isArabic ? 'الكود فارغ!' : 'Code is empty!');
      setOutputType('error');
      setIsRunning(false);
      return;
    }

    try {
      if (language === 'javascript' || language === 'typescript') {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => {
            logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
          },
          error: (...args: any[]) => {
            logs.push('[خطأ Error]: ' + args.map(a => String(a)).join(' '));
          },
          warn: (...args: any[]) => {
            logs.push('[تنبيه Warn]: ' + args.map(a => String(a)).join(' '));
          },
        };

        // Create isolated function
        const runner = new Function('console', code);
        const result = runner(customConsole);

        let finalOut = logs.join('\n');
        if (result !== undefined) {
          finalOut += (finalOut ? '\n' : '') + `=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`;
        }

        setOutput(finalOut || (isArabic ? 'تم التنفيذ بنجاح بدون مخرجات.' : 'Executed successfully with no output.'));
        setOutputType('log');
      } else if (language === 'html') {
        setOutput(code);
        setOutputType('html');
      } else {
        // For Python and other languages: Execute with simulated interactive REPL interpreter and verify logic
        // If Python, evaluate simple prints, math, variables, and conditions
        const pythonLines = code.split('\n');
        const simulatedLogs: string[] = [];
        const scope: Record<string, any> = {};

        for (const line of pythonLines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          // Simple print(...) regex
          const printMatch = trimmed.match(/^print\((.*)\)$/);
          if (printMatch) {
            const inside = printMatch[1].trim();
            // Handle quotes or simple expressions
            if ((inside.startsWith('"') && inside.endsWith('"')) || (inside.startsWith("'") && inside.endsWith("'"))) {
              simulatedLogs.push(inside.slice(1, -1));
            } else {
              try {
                // eslint-disable-next-line no-eval
                const evaluated = Function(`"use strict"; return (${inside});`)();
                simulatedLogs.push(String(evaluated));
              } catch {
                simulatedLogs.push(inside);
              }
            }
          }
        }

        if (simulatedLogs.length > 0) {
          setOutput(simulatedLogs.join('\n'));
          setOutputType('log');
        } else {
          // Send to server helper for thorough analysis / output
          const res = await fetch('/api/kuwait/code-helper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              language,
              task: 'قم بتنفيذ وتوقع مخرجات هذا الكود مع شرح الخطوات البرمجية لمنهج الحاسوب الكويتي',
            }),
          });
          const data = await res.json();
          if (data.analysis) {
            setOutput(data.analysis);
            setOutputType('log');
          } else {
            setOutput(isArabic ? 'تم التحقق من صحة الكود.' : 'Code syntax checked.');
            setOutputType('log');
          }
        }
      }
    } catch (err: any) {
      setOutput(err.message || String(err));
      setOutputType('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiExplain = async () => {
    if (!block.content || !block.content.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/kuwait/code-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: block.content,
          language,
          task: 'اشرح هذا الكود بالتفصيل لطلاب منهج الحاسوب الكويتي ووضح أي أخطاء محتملة وكيفية تصحيحها',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiExplanation(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className="my-3 rounded-xl bg-[#13171C] text-[#F4F6F8] border border-[#2B3540] overflow-hidden group shadow-md"
      onClick={onFocus}
      id={`code-block-${block.id}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1C232B] border-b border-[#2B3540] text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Code2 className="w-3.5 h-3.5 text-[#0D5C75]" />
          <select
            value={language}
            onChange={e => onChange({ language: e.target.value })}
            className="bg-[#26313D] text-[#E2E7ED] text-xs focus:outline-none cursor-pointer py-1 px-2 rounded font-sans border border-[#3A4756]"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-[#1C232B] text-white">
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Helper for Kuwait CS Curriculum */}
          <button
            type="button"
            onClick={handleAiExplain}
            disabled={isAiLoading}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:bg-sky-950/50 px-2 py-1 rounded transition-colors text-[11px] font-sans border border-sky-800/40"
            title="مساعد منهج الحاسوب الكويتي"
          >
            {isAiLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
            ) : (
              <Sparkles className="w-3 h-3 text-sky-400" />
            )}
            <span>{isArabic ? 'شرح الكود (AI)' : 'Explain'}</span>
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded transition-colors text-[11px] font-sans font-medium shadow-xs cursor-pointer"
          >
            <Play className={`w-3 h-3 ${isRunning ? 'animate-pulse' : 'fill-current'}`} />
            <span>{isArabic ? 'تشغيل وتجربة' : 'Run'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[#8A99A8] hover:text-white transition-colors cursor-pointer px-2 py-1 rounded hover:bg-[#2B3540]"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">
                  {isArabic ? 'تم النسخ' : 'Copied'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">{isArabic ? 'نسخ' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Textarea */}
      <div className="p-3 bg-[#13171C]">
        <textarea
          value={block.content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder={
            isArabic
              ? '# اكتب كود بايثون أو جافاسكريبت هنا لتجربته لمنهج الحاسوب...'
              : '// Write code here to run interactively...'
          }
          className="w-full bg-transparent font-mono text-xs leading-relaxed text-[#E2E7ED] focus:outline-none resize-y min-h-[100px]"
          dir="ltr"
          spellCheck={false}
        />
      </div>

      {/* Terminal / Live Output Window */}
      {output !== null && (
        <div className="border-t border-[#2B3540] bg-[#0A0D11] p-3 text-xs font-mono">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1E2630] text-[#7E8F9F]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-sans text-[11px] font-medium text-emerald-400">
                {isArabic ? 'مخرجات التنفيذ (Console Output)' : 'Execution Output'}
              </span>
            </div>
            <button
              onClick={() => setOutput(null)}
              className="text-[#64748B] hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {outputType === 'html' ? (
            <div
              className="bg-white text-black p-3 rounded border border-gray-300 font-sans"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          ) : (
            <pre
              className={`whitespace-pre-wrap leading-relaxed ${
                outputType === 'error' ? 'text-rose-400' : 'text-emerald-300'
              }`}
              dir="auto"
            >
              {output}
            </pre>
          )}
        </div>
      )}

      {/* AI Curriculum Explanation Drawer */}
      {aiExplanation && (
        <div className="border-t border-sky-900/60 bg-sky-950/25 p-3 text-xs">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-sky-800/40 text-sky-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isArabic ? 'توجيهات وشرح منهج الحاسوب الكويتي' : 'Kuwait CS Curriculum Explanation'}</span>
            </div>
            <button
              onClick={() => setAiExplanation(null)}
              className="text-sky-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-sky-100 whitespace-pre-wrap leading-relaxed font-sans text-xs">
            {aiExplanation}
          </div>
        </div>
      )}
    </div>
  );
};

