import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Tag as TagIcon,
  Globe,
  Trash2,
  MoreVertical,
  Sparkles,
  Layout,
  Settings,
  Cloud,
  FileDown,
  Shield,
  BookOpen,
  FolderPlus,
  GraduationCap,
  ListTodo,
  CheckCircle2,
  Table as TableIcon,
  KeyRound,
  User,
  Apple,
  PanelLeftClose,
  PanelLeft,
  X
} from 'lucide-react';
import { NoteItem, VaultInfo, UserAccount } from '../types';

interface SidebarProps {
  vaultName: string;
  notes: NoteItem[];
  activeNoteId: string | null;
  allTags: string[];
  isArabic: boolean;
  currentUser?: UserAccount | null;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
  onSelectNote: (noteId: string) => void;
  onCreateNote: (folder?: string) => void;
  onCreateFolder: () => void;
  onDeleteNote: (noteId: string) => void;
  onOpenSearch: () => void;
  onOpenVaultSelector: () => void;
  onOpenTagIndex: (tag?: string) => void;
  onToggleLanguage: () => void;
  onOpenSyncModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenExportImportModal?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTemplateGallery?: () => void;
  onOpenKuwaitTeacherHub?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  vaultName,
  notes,
  activeNoteId,
  allTags,
  isArabic,
  currentUser,
  isOpen = true,
  onToggleSidebar,
  onSelectNote,
  onCreateNote,
  onCreateFolder,
  onDeleteNote,
  onOpenSearch,
  onOpenVaultSelector,
  onOpenTagIndex,
  onToggleLanguage,
  onOpenSyncModal,
  onOpenAuthModal,
  onOpenExportImportModal,
  onOpenPrivacyPolicy,
  onOpenTemplateGallery,
  onOpenKuwaitTeacherHub,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  // Group notes by folder
  const foldersMap: Record<string, NoteItem[]> = {};
  for (const note of notes) {
    const folder = note.folder || 'root';
    if (!foldersMap[folder]) foldersMap[folder] = [];
    foldersMap[folder].push(note);
  }

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('text/plain', noteId);
    setDraggedNoteId(noteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnFolder = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('text/plain') || draggedNoteId;
    if (!noteId) return;

    const targetNote = notes.find(n => n.id === noteId);
    if (targetNote && targetNote.folder !== targetFolder) {
      try {
        await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...targetNote,
            folder: targetFolder,
          }),
        });
      } catch (err) {
        console.error('Error moving note:', err);
      }
    }
    setDraggedNoteId(null);
  };

  const folderNames = Object.keys(foldersMap).filter(f => f !== 'root');

  return (
    <aside className="w-64 md:w-72 bg-[#F7F6F3] border-e border-[#E9E9E8] flex flex-col h-full overflow-hidden text-xs select-none font-notion text-[#37352F] shrink-0">
      {/* Notion-style Workspace Header */}
      <div className="p-3 border-b border-[#E9E9E8]/80">
        <div className="flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={onOpenVaultSelector}
            className="flex-1 min-w-0 text-start p-1.5 rounded-lg hover:bg-[#EFEFEF] transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[#37352F] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                📓
              </div>
              <div className="truncate">
                <span className="font-semibold text-xs text-[#37352F] block truncate">
                  {vaultName || (isArabic ? 'دفتر | مساحة العمل' : 'Daftar Workspace')}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9B9A97] group-hover:text-[#37352F] transition-colors shrink-0 ml-1" />
          </button>

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg hover:bg-[#EAEAE8] text-[#787774] hover:text-[#37352F] transition-colors cursor-pointer shrink-0"
              title={isArabic ? 'إخفاء القائمة الجانبية (⌘\\)' : 'Collapse sidebar (⌘\\)'}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Quick Action Links */}
        <div className="mt-2 space-y-0.5">
          {/* Quick Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full text-start px-2 py-1.5 rounded-md hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#787774]" />
              <span className="text-xs">{isArabic ? 'بحث سريع' : 'Quick Search'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-white border border-[#E9E9E8] rounded text-[10px] font-mono text-[#9B9A97]">
              ⌘K
            </kbd>
          </button>

          {/* Notion Templates Library */}
          <button
            type="button"
            onClick={onOpenTemplateGallery}
            className="w-full text-start px-2 py-1.5 rounded-md hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2383E2]" />
              <span className="text-xs font-medium text-[#2383E2]">{isArabic ? 'مكتبة النماذج (Templates)' : 'Templates'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2383E2]/10 text-[#2383E2] font-semibold">
              {isArabic ? 'نماذج' : 'Library'}
            </span>
          </button>

          {/* Kuwait Teachers & School Leadership Hub */}
          <button
            type="button"
            onClick={onOpenKuwaitTeacherHub}
            className="w-full text-start px-2 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between transition-colors cursor-pointer group border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">🇰🇼</span>
              <span className="text-xs font-bold truncate">
                {isArabic ? 'منصة معلمي وقيادات الكويت' : 'Kuwait Teachers Hub'}
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold shrink-0">
              AI
            </span>
          </button>
        </div>
      </div>

      {/* Main Pages List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Workspace Pages Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#787774] group">
            <span>{isArabic ? 'الصفحات والسجلات' : 'Pages & Registers'}</span>
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onCreateNote()}
                className="p-1 rounded hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] transition-colors"
                title={isArabic ? 'صفحة جديدة' : 'New page'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onCreateFolder}
                className="p-1 rounded hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] transition-colors"
                title={isArabic ? 'مجلد جديد' : 'New folder'}
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Root Notes / Pages */}
          <div className="space-y-0.5 mt-1">
            {(foldersMap['root'] || []).map(note => {
              const isSelected = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  draggable
                  onDragStart={e => handleDragStart(e, note.id)}
                  className="relative group/note"
                >
                  <button
                    type="button"
                    onClick={() => onSelectNote(note.id)}
                    className={`w-full text-start px-2 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-[#EFEFEF] text-[#37352F] font-semibold shadow-2xs'
                        : 'text-[#37352F] hover:bg-[#EFEFEF]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm select-none shrink-0">
                        {note.icon || '📄'}
                      </span>
                      <span className="truncate">{note.title}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          isArabic ? `هل تريد بالتأكيد حذف "${note.title}"؟` : `Delete note "${note.title}"?`
                        )
                      ) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="absolute top-1 end-1 p-1 rounded opacity-0 group-hover/note:opacity-100 text-[#9B9A97] hover:text-rose-500 hover:bg-rose-50 transition-opacity cursor-pointer"
                    title={isArabic ? 'حذف الصفحة' : 'Delete page'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Folders List */}
        {folderNames.length > 0 && (
          <div className="space-y-1">
            {folderNames.map(folderName => {
              const isCollapsed = collapsedFolders[folderName];
              const folderNotes = foldersMap[folderName] || [];

              return (
                <div
                  key={folderName}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDropOnFolder(e, folderName)}
                  className="space-y-0.5"
                >
                  <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-[#EFEFEF] text-[#787774] hover:text-[#37352F] transition-colors group cursor-pointer">
                    <div
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      onClick={() => toggleFolder(folderName)}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <Folder className="w-3.5 h-3.5 text-[#9B9A97] shrink-0" />
                      <span className="font-medium truncate text-xs">{folderName.replace(/_/g, ' ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCreateNote(folderName)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#D4D4D2] rounded text-[#37352F]"
                      title={isArabic ? 'إضافة صفحة داخل المجلد' : 'Add page in folder'}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Folder Notes */}
                  {!isCollapsed && (
                    <div className="ps-4 space-y-0.5">
                      {folderNotes.map(note => {
                        const isSelected = note.id === activeNoteId;
                        return (
                          <div
                            key={note.id}
                            draggable
                            onDragStart={e => handleDragStart(e, note.id)}
                            className="relative group/fn"
                          >
                            <button
                              type="button"
                              onClick={() => onSelectNote(note.id)}
                              className={`w-full text-start px-2 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-[#EFEFEF] text-[#37352F] font-semibold shadow-2xs'
                                  : 'text-[#37352F] hover:bg-[#EFEFEF]'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-xs select-none shrink-0">
                                  {note.icon || '📄'}
                                </span>
                                <span className="truncate">{note.title}</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    isArabic ? `هل تريد حذف "${note.title}"؟` : `Delete note "${note.title}"?`
                                  )
                                ) {
                                  onDeleteNote(note.id);
                                }
                              }}
                              className="absolute top-1 end-1 p-1 rounded opacity-0 group-hover/fn:opacity-100 text-[#9B9A97] hover:text-rose-500 hover:bg-rose-50 transition-opacity cursor-pointer"
                              title={isArabic ? 'حذف الصفحة' : 'Delete page'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-[#E9E9E8]">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#787774]">
              <span>{isArabic ? 'الوسوم' : 'Tags'}</span>
              <button
                type="button"
                onClick={() => onOpenTagIndex()}
                className="text-[10px] text-[#2383E2] hover:underline font-medium cursor-pointer"
              >
                {isArabic ? 'عرض الكل' : 'View All'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1 px-1 mt-1">
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onOpenTagIndex(tag)}
                  className="px-2 py-0.5 bg-white border border-[#E9E9E8] hover:border-[#2383E2] hover:text-[#2383E2] rounded-md text-[11px] text-[#787774] transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notion-style Footer Toolbar */}
      <div className="p-3 border-t border-[#E9E9E8] bg-[#F7F6F3] space-y-2">
        {/* User Account / Sign In Widget */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="w-full text-start p-2 rounded-xl bg-white border border-[#E9E9E8] hover:border-emerald-500/50 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
              currentUser?.provider === 'google'
                ? 'bg-sky-600'
                : currentUser?.provider === 'apple'
                ? 'bg-black'
                : 'bg-emerald-700'
            }`}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="truncate">
              <span className="font-semibold text-xs text-[#37352F] block truncate group-hover:text-emerald-700 transition-colors">
                {currentUser?.name || (isArabic ? 'تسجيل الدخول / الحساب' : 'Sign in / Account')}
              </span>
              <span className="text-[10px] text-[#787774] font-mono block truncate">
                {currentUser?.email || (isArabic ? 'Google أو Apple iCloud' : 'Google / Apple')}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            {currentUser?.provider === 'google' ? (
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
            ) : currentUser?.provider === 'apple' ? (
              <Apple className="w-3.5 h-3.5 fill-black" />
            ) : (
              <KeyRound className="w-3.5 h-3.5 text-[#787774]" />
            )}
          </div>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="px-2 py-1.5 rounded-lg bg-white border border-[#E9E9E8] hover:border-[#2383E2]/50 text-[#37352F] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Cloud className="w-3.5 h-3.5 text-[#2383E2]" />
            <span>{isArabic ? 'مزامنة سحابية' : 'Cloud Sync'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportImportModal}
            className="px-2 py-1.5 rounded-lg bg-white border border-[#E9E9E8] hover:border-[#2383E2]/50 text-[#37352F] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5 text-[#787774]" />
            <span>{isArabic ? 'تصدير / استيراد' : 'Export / PDF'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] text-[#787774]">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="p-1 rounded hover:bg-[#EFEFEF] flex items-center gap-1 text-[#37352F]"
          >
            <Globe className="w-3 h-3 text-[#2383E2]" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="p-1 rounded hover:bg-[#EFEFEF] hover:text-[#37352F]"
          >
            {isArabic ? 'الخصوصية • RootKw' : 'Privacy • RootKw'}
          </button>
        </div>
      </div>
    </aside>
  );
};
