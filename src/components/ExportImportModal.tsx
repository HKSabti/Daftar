import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  Printer,
  FileCode,
  FolderArchive,
  Layers,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { NoteItem } from '../types';
import {
  exportNoteToMarkdown,
  printOrExportNoteToPDF,
  exportNoteToDocx,
  parseImportedFiles,
  downloadFile
} from '../utils/exportImport';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNote: NoteItem | null;
  vaultId: string;
  isArabic: boolean;
  onNotesImported: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  activeNote,
  vaultId,
  isArabic,
  onNotesImported,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Single Note Exports
  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const md = exportNoteToMarkdown(activeNote);
    downloadFile(`${activeNote.title.replace(/[\s/\\?%*:|"<>]+/g, '_')}.md`, md, 'text/markdown;charset=utf-8');
  };

  const handleExportPDF = () => {
    if (!activeNote) return;
    printOrExportNoteToPDF(activeNote, isArabic);
  };

  const handleExportDocx = () => {
    if (!activeNote) return;
    exportNoteToDocx(activeNote, isArabic);
  };

  // Full Vault Export
  const handleExportFullVaultArchive = () => {
    window.location.href = `/api/vault/export-archive/${vaultId}`;
  };

  // Handle Import (Notion, Obsidian, Plain Markdown)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsImporting(true);
    setImportStatusMsg(null);

    try {
      const parsedNotes = await parseImportedFiles(e.target.files);
      let count = 0;

      for (const item of parsedNotes) {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            folder: item.folder,
            content: item.content,
            direction: isArabic ? 'rtl' : 'ltr',
          }),
        });
        count++;
      }

      setIsImporting(false);
      setImportStatusMsg(
        isArabic
          ? `تم بنجاح استيراد ${count} وثيقة إلى الخزانة الحالية!`
          : `Successfully imported ${count} notes into your codex!`
      );
      onNotesImported();
    } catch (err: any) {
      setIsImporting(false);
      setImportStatusMsg(isArabic ? 'حدث خطأ أثناء قراءة الملفات' : 'Error importing files');
    }
  };

  return (
    <div
      id="export-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-[#FFFFFF] text-[#13171C] border border-[#E2E7ED] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7ED] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#13171C]">
                {isArabic ? 'تصدير واستيراد الوثائق والخزائن' : 'Export & Import Notes'}
              </h2>
              <p className="text-xs text-[#5C6B7A]">
                PDF مع اتجاه عربي منضبط • DOCX • Markdown • Notion • Obsidian
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5C6B7A] hover:text-[#13171C] hover:bg-[#E2E7ED]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E7ED] bg-[#F8FAFC] px-6 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'export'
                ? 'border-[#0D5C75] text-[#0D5C75]'
                : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isArabic ? 'تصدير (Export)' : 'Export'}</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'import'
                ? 'border-[#0D5C75] text-[#0D5C75]'
                : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isArabic ? 'استيراد من Notion / Obsidian' : 'Import'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'export' && (
            <div className="space-y-4">
              {activeNote && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-[#13171C]">
                    {isArabic ? 'تصدير الوثيقة النشطة:' : 'Export Current Note:'}{' '}
                    <span className="text-[#0D5C75] font-semibold">{activeNote.title}</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* PDF Export */}
                    <button
                      onClick={handleExportPDF}
                      className="p-3 rounded-xl border border-[#E2E7ED] hover:border-[#0D5C75] hover:bg-[#0D5C75]/5 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <Printer className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs text-[#13171C]">PDF (عربي RTL)</span>
                      <span className="text-[10px] text-[#5C6B7A]">طباعة منضبطة</span>
                    </button>

                    {/* Word / DOCX Export */}
                    <button
                      onClick={handleExportDocx}
                      className="p-3 rounded-xl border border-[#E2E7ED] hover:border-[#0D5C75] hover:bg-[#0D5C75]/5 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <FileText className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs text-[#13171C]">Word (DOCX)</span>
                      <span className="text-[10px] text-[#5C6B7A]">ملف مايكروسوفت</span>
                    </button>

                    {/* Markdown Export */}
                    <button
                      onClick={handleExportMarkdown}
                      className="p-3 rounded-xl border border-[#E2E7ED] hover:border-[#0D5C75] hover:bg-[#0D5C75]/5 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <FileCode className="w-5 h-5 text-[#0D5C75] group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs text-[#13171C]">Markdown (.md)</span>
                      <span className="text-[10px] text-[#5C6B7A]">نص خام قياسي</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Vault Export Section */}
              <div className="pt-3 border-t border-[#E2E7ED] space-y-2">
                <h3 className="font-bold text-xs text-[#13171C]">
                  {isArabic ? 'تصدير الخزانة بالكامل:' : 'Full Codex Vault Export:'}
                </h3>
                <button
                  onClick={handleExportFullVaultArchive}
                  className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E7ED] hover:border-[#0D5C75] flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-[#13171C]">
                    <FolderArchive className="w-5 h-5 text-[#0D5C75]" />
                    <div className="text-start">
                      <span>{isArabic ? 'تنزيل أرشيف الخزانة بالكامل' : 'Download Complete Vault Archive'}</span>
                      <p className="text-[10px] font-normal text-[#5C6B7A]">
                        {isArabic ? 'يشمل جميع ملفات الماركداون والوسوم' : 'Includes all Markdown files & tags'}
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#0D5C75]" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4 text-xs">
              <div className="p-6 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-3">
                <Upload className="w-8 h-8 text-[#0D5C75] mx-auto opacity-75" />
                <div>
                  <h4 className="font-bold text-sm text-[#13171C]">
                    {isArabic ? 'اسحب الملفات هنا أو انقر للاستيراد' : 'Drag & Drop files or click to import'}
                  </h4>
                  <p className="text-[11px] text-[#5C6B7A] mt-1 max-w-xs mx-auto">
                    {isArabic
                      ? 'يدعم تصدير Notion (مع إزالة المعرفات العشوائية)، وخزائن Obsidian، وملفات الماركداون العادية (.md)'
                      : 'Supports Notion ZIP exports, Obsidian vaults, and plain .md markdown files.'}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".md,.markdown,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-5 py-2 rounded-xl bg-[#0D5C75] hover:bg-[#0E6C8A] text-white font-bold text-xs shadow-xs"
                >
                  {isImporting ? (isArabic ? 'جاري الاستيراد...' : 'Importing...') : (isArabic ? 'تحديد الملفات للاستيراد' : 'Browse Files')}
                </button>
              </div>

              {importStatusMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importStatusMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
