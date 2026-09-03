import React, { useState, useEffect, useCallback } from 'react';
import { NoteItem, VaultInfo, UserAccount } from './types';
import { Sidebar } from './components/Sidebar';
import { BlockEditor } from './components/BlockEditor/BlockEditor';
import { RightContextPanel } from './components/RightContextPanel';
import { SearchModal } from './components/SearchModal';
import { TagIndexModal } from './components/TagIndexModal';
import { VaultSelectorModal } from './components/VaultSelectorModal';
import { RecordModal } from './components/Audio/RecordModal';
import { PersistentRecordingBar } from './components/Audio/PersistentRecordingBar';
import { AudioPlayerModal } from './components/Audio/AudioPlayerModal';
import { RecordingsLibraryModal } from './components/Audio/RecordingsLibraryModal';
import { CrashSafetyTestModal } from './components/Audio/CrashSafetyTestModal';
import { SyncModal } from './components/SyncModal';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
import { ExportImportModal } from './components/ExportImportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { KuwaitTeacherHubModal } from './components/KuwaitTeacherHubModal';
import { TemplateItem } from './data/templates';
import { ToastContainer, toast } from './components/Toast';
import { audioRecorder } from './services/audioRecorder';
import { markdownToBlocks, blocksToMarkdown } from './utils/markdown';
import { normalizeArabic } from './utils/arabic';
import { BookOpen, Plus, FolderArchive, PanelLeft, PanelLeftClose, Menu } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeVaultId, setActiveVaultId] = useState<string>('default-scholarly-vault');
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isArabic, setIsArabic] = useState<boolean>(() => {
    const saved = localStorage.getItem('daftar_lang');
    return saved ? saved === 'ar' : true;
  });

  // Sidebar & Layout Toggling State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('daftar_sidebar_open');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('daftar_right_panel_open');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' ? window.innerWidth >= 1200 : true;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('daftar_sidebar_open', String(next));
      return next;
    });
  }, []);

  const toggleRightPanel = useCallback(() => {
    setIsRightPanelOpen(prev => {
      const next = !prev;
      localStorage.setItem('daftar_right_panel_open', String(next));
      return next;
    });
  }, []);

  // Global Keyboard Shortcuts (⌘\ / Ctrl+\ or ⌘B / Ctrl+B for Menu Toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input/textarea and it's not a modifier combo
      if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Modal States
  const [searchOpen, setSearchOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [tagIndexOpen, setTagIndexOpen] = useState(false);
  const [selectedTagForIndex, setSelectedTagForIndex] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [kuwaitTeacherHubOpen, setKuwaitTeacherHubOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Audio Recording Modals & Player State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [crashTestModalOpen, setCrashTestModalOpen] = useState(false);
  const [activePlaybackSessionId, setActivePlaybackSessionId] = useState<string | null>(null);
  const [activePlaybackSeekTime, setActivePlaybackSeekTime] = useState<number | undefined>(undefined);

  // Sync HTML tag direction & language
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    localStorage.setItem('daftar_lang', isArabic ? 'ar' : 'en');
  }, [isArabic]);

  // Fetch all notes for active vault
  const fetchNotes = useCallback(async (selectNoteId?: string) => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      const loadedNotes: NoteItem[] = (data.notes || []).map((n: any) => ({
        ...n,
        blocks: markdownToBlocks(n.content),
      }));

      setNotes(loadedNotes);

      // Collect all tags
      const tagSet = new Set<string>();
      for (const n of loadedNotes) {
        for (const t of n.tags || []) tagSet.add(t);
      }
      setAllTags(Array.from(tagSet));

      if (selectNoteId) {
        setActiveNoteId(selectNoteId);
      } else if (!activeNoteId && loadedNotes.length > 0) {
        setActiveNoteId(loadedNotes[0].id);
      } else if (activeNoteId && !loadedNotes.some(n => n.id === activeNoteId)) {
        setActiveNoteId(loadedNotes[0]?.id || null);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeNoteId]);

  // Fetch active vault info
  const fetchVaultInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/vaults');
      const data = await res.json();
      const active = (data.vaults || []).find((v: any) => v.id === data.activeVaultId);
      if (active) {
        setVaultInfo(active);
        setActiveVaultId(active.id);
      }
    } catch (err) {
      console.error('Error fetching vault info:', err);
    }
  }, []);

  // Fetch active user profile
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.warn('Error fetching current user:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVaultInfo();
    fetchNotes();
    fetchCurrentUser();
  }, [fetchVaultInfo, fetchNotes, fetchCurrentUser]);

  // File Watching via SSE: auto-refresh notes on external filesystem changes
  useEffect(() => {
    const eventSource = new EventSource('/api/vault/watch');

    eventSource.addEventListener('vault-changed', (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.vaultId === activeVaultId) {
          fetchNotes();
        }
      } catch (err) {
        console.error('Watch event parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [activeVaultId, fetchNotes]);

  // Global Keyboard Shortcuts (Search ⌘K, Record ⌘⇧R, Mark Moment ⌘⇧M / Alt+M, Lang ⌘⇧L)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Cmd/Ctrl + Shift + R: One-tap Record / Open Record Modal
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (audioRecorder.isActive()) {
          // If already recording, prompt or show persistent bar focus
        } else {
          setRecordModalOpen(true);
        }
        return;
      }

      // Cmd/Ctrl + Shift + M OR Alt + M: Fast Mark Moment during lecture
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'm') ||
        (e.altKey && e.key.toLowerCase() === 'm')
      ) {
        if (audioRecorder.isActive()) {
          e.preventDefault();
          audioRecorder.markMoment(isArabic ? 'موضع مهم (اختصار)' : 'Important moment (hotkey)');
        }
        return;
      }

      // Cmd/Ctrl + Shift + L: Toggle AR/EN
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsArabic(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isArabic]);

  // Open audio player for a specific session and optional timestamp
  const handleOpenAudioPlayer = (sessionId: string, timestampSeconds?: number) => {
    setActivePlaybackSessionId(sessionId);
    setActivePlaybackSeekTime(timestampSeconds);
  };

  // Apply Notion template handler
  const handleApplyTemplate = async (tpl: TemplateItem) => {
    const title = isArabic ? tpl.titleAr : tpl.titleEn;
    const markdown = blocksToMarkdown(tpl.blocks);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: markdown,
          folder: 'root',
          icon: tpl.icon,
          coverUrl: tpl.coverUrl,
          tags: tpl.tags,
          direction: isArabic ? 'rtl' : 'ltr',
        }),
      });
      const data = await res.json();
      if (data.note) {
        await fetchNotes(data.note.id);
      }
    } catch (err) {
      console.error('Error applying template:', err);
    }
  };

  // Insert generated Kuwait MOE content or template into current or new note
  const handleInsertFromKuwaitHub = async (contentMarkdown: string, titleHint?: string) => {
    try {
      const title = titleHint || (isArabic ? 'تحضير / سجل كويتي معتمد' : 'Kuwait MOE Plan');
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: contentMarkdown,
          folder: 'root',
          icon: '🇰🇼',
          tags: ['وزارة_التربية', 'الكويت', 'تحضير_معتمد'],
          direction: isArabic ? 'rtl' : 'ltr',
        }),
      });
      const data = await res.json();
      if (data.note) {
        await fetchNotes(data.note.id);
      }
    } catch (err) {
      console.error('Error inserting Kuwait MOE content:', err);
    }
  };

  // Switch vault handler
  const handleSelectVault = async (vaultId: string) => {
    try {
      await fetch('/api/vaults/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vaultId }),
      });
      setActiveVaultId(vaultId);
      setActiveNoteId(null);
      await fetchVaultInfo();
      await fetchNotes();
    } catch (err) {
      console.error('Error switching vault:', err);
    }
  };

  // Create new note handler
  const handleCreateNote = async (folder?: string) => {
    const baseTitle = isArabic ? 'وثيقة جديدة' : 'Untitled Note';
    let title = baseTitle;
    let count = 1;
    while (notes.some(n => n.title.toLowerCase() === title.toLowerCase())) {
      title = `${baseTitle} (${count++})`;
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          folder: folder || 'root',
          direction: isArabic ? 'rtl' : 'ltr',
        }),
      });
      const data = await res.json();
      if (data.note) {
        await fetchNotes(data.note.id);
      }
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  // Create new folder handler
  const handleCreateFolder = async () => {
    const name = window.prompt(
      isArabic ? 'أدخل اسم المبحث / المجلد الجديد:' : 'Enter new folder name:'
    );
    if (!name || !name.trim()) return;

    try {
      await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      await fetchNotes();
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  // Delete note handler
  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
        method: 'DELETE',
      });
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }
      await fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Save note handler (Atomic)
  const handleSaveNote = async (updatedNote: NoteItem) => {
    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(updatedNote.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedNote.title,
          content: updatedNote.content,
          folder: updatedNote.folder,
          direction: updatedNote.direction,
        }),
      });
      const data = await res.json();

      // Update local state without jarring reload
      setNotes(prev =>
        prev.map(n =>
          n.id === updatedNote.id
            ? {
                ...updatedNote,
                id: data.noteId || updatedNote.id,
                path: data.path || updatedNote.path,
                tags: data.tags || updatedNote.tags,
                outgoingLinks: data.outgoingLinks || updatedNote.outgoingLinks,
              }
            : n
        )
      );

      if (data.noteId && data.noteId !== updatedNote.id) {
        setActiveNoteId(data.noteId);
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  // WikiLink navigation / creation
  const handleWikiLinkClick = async (targetTitle: string) => {
    const targetNorm = normalizeArabic(targetTitle);
    const existing = notes.find(n => normalizeArabic(n.title) === targetNorm);

    if (existing) {
      setActiveNoteId(existing.id);
    } else {
      // Ask user to create linked note
      if (
        window.confirm(
          isArabic
            ? `الوثيقة "${targetTitle}" غير موجودة، هل تريد إنشاءها الآن؟`
            : `Note "${targetTitle}" does not exist. Create it now?`
        )
      ) {
        try {
          const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: targetTitle,
              folder: 'root',
              direction: isArabic ? 'rtl' : 'ltr',
            }),
          });
          const data = await res.json();
          if (data.note) {
            await fetchNotes(data.note.id);
          }
        } catch (err) {
          console.error('Error creating linked note:', err);
        }
      }
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  return (
    <div
      id="daftar-app"
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#F4F6F8] text-[#13171C] font-body selection:bg-[#0D5C75]/20 selection:text-[#13171C]"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Persistent Audio Recording Status & Control Bar */}
      <PersistentRecordingBar
        isArabic={isArabic}
        onOpenPlayback={(sessionId) => handleOpenAudioPlayer(sessionId)}
      />

      {/* Three-Pane Scholarly Study Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay when sidebar is open on small screens */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Left / Start Pane: Sidebar Note Tree with Smooth Toggle Transition */}
        <div
          className={`h-full transition-all duration-300 ease-in-out shrink-0 z-40 md:z-auto ${
            isSidebarOpen
              ? 'fixed inset-y-0 start-0 w-80 max-w-[85vw] md:relative md:w-64 lg:w-72 opacity-100 translate-x-0 shadow-2xl md:shadow-none'
              : 'fixed pointer-events-none opacity-0 md:relative md:w-0 overflow-hidden border-none ltr:-translate-x-full rtl:translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            vaultName={vaultInfo?.name || ''}
            notes={notes}
            activeNoteId={activeNoteId}
            allTags={allTags}
            isArabic={isArabic}
            currentUser={currentUser}
            isOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            onSelectNote={(noteId) => {
              setActiveNoteId(noteId);
              // On mobile, close sidebar when note is selected
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            onCreateNote={(folder) => {
              handleCreateNote(folder);
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            onCreateFolder={handleCreateFolder}
            onDeleteNote={handleDeleteNote}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenVaultSelector={() => setVaultModalOpen(true)}
            onOpenTagIndex={(tag?: string) => {
              setSelectedTagForIndex(tag || null);
              setTagIndexOpen(true);
            }}
            onToggleLanguage={() => setIsArabic(!isArabic)}
            onOpenSyncModal={() => setSyncModalOpen(true)}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenExportImportModal={() => setExportImportModalOpen(true)}
            onOpenPrivacyPolicy={() => setPrivacyModalOpen(true)}
            onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
            onOpenKuwaitTeacherHub={() => setKuwaitTeacherHubOpen(true)}
          />
        </div>

        {/* Center Pane: Manuscript Block Editor */}
        {activeNote ? (
          <BlockEditor
            key={activeNote.id}
            note={activeNote}
            notes={notes}
            allTags={allTags}
            isArabic={isArabic}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={toggleRightPanel}
            onSaveNote={handleSaveNote}
            onWikiLinkClick={handleWikiLinkClick}
            onTagClick={tag => {
              setSelectedTagForIndex(tag);
              setTagIndexOpen(true);
            }}
            onSeekAudio={(timestampSeconds) => {
              // If there's an associated recording, jump to it
              fetch(`/api/recordings?noteId=${encodeURIComponent(activeNote.id)}`)
                .then(r => r.json())
                .then(data => {
                  if (data.recordings && data.recordings.length > 0) {
                    handleOpenAudioPlayer(data.recordings[0].sessionId, timestampSeconds);
                  } else {
                    toast.info(isArabic ? 'لا يوجد تسجيل صوتي مرتبط بهذه الوثيقة بعد.' : 'No audio recording associated with this note yet.');
                  }
                })
                .catch(() => {});
            }}
          />
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-[#F4F6F8] relative">
            {/* Top Bar for Empty State with Sidebar Toggle */}
            <div className="absolute top-3 start-4 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSidebar}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  !isSidebarOpen
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 font-bold'
                    : 'bg-white text-[#787774] hover:text-[#37352F] border-[#E9E9E8] hover:bg-[#F7F6F3]'
                }`}
                title={isSidebarOpen ? (isArabic ? 'إخفاء القائمة (⌘\\)' : 'Hide sidebar (⌘\\)') : (isArabic ? 'إظهار القائمة (⌘\\)' : 'Show sidebar (⌘\\)')}
              >
                {!isSidebarOpen ? (
                  <>
                    <Menu className="w-4 h-4" />
                    <span className="text-xs">{isArabic ? 'فتح القائمة الجانبية' : 'Open Sidebar'}</span>
                  </>
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            <BookOpen className="w-12 h-12 text-[#0D5C75] opacity-40 mb-3" />
            <h2 className="font-scholarly font-bold text-xl text-[#13171C] mb-2">
              {isArabic ? 'دفتر | خزانة المخطوطات والتحقيق والتسجيل' : 'Daftar Scholarly Codex & Audio'}
            </h2>
            <p className="text-xs text-[#5C6B7A] max-w-sm mb-6 leading-relaxed">
              {isArabic
                ? 'أنشئ وثيقة جديدة، أو ابدأ تسجيلاً صوتياً للمحاضرة مع التوثيق المباشر بالوقت.'
                : 'Select a note from the tree or start an audio recording to capture lecture notes.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCreateNote()}
                className="px-4 py-2 bg-[#0D5C75] text-white text-xs font-semibold rounded-lg hover:bg-[#083E50] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? 'إنشاء وثيقة جديدة' : 'New Note'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRecordModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>{isArabic ? '🎙️ بدء تسجيل محاضرة' : '🎙️ Record Audio'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Backdrop Overlay when right panel is open on small screens */}
        {isRightPanelOpen && (
          <div
            onClick={() => setIsRightPanelOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Right / End Pane: Marginalia & Context Panel (Ḥāshiya) with Audio Tab with Smooth Toggle Transition */}
        <div
          className={`h-full transition-all duration-300 ease-in-out shrink-0 z-40 md:z-auto ${
            isRightPanelOpen
              ? 'fixed inset-y-0 end-0 w-80 max-w-[85vw] md:relative md:w-80 opacity-100 translate-x-0 shadow-2xl md:shadow-none'
              : 'fixed pointer-events-none opacity-0 md:relative md:w-0 overflow-hidden border-none ltr:translate-x-full rtl:-translate-x-full md:translate-x-0'
          }`}
        >
          <RightContextPanel
            note={activeNote}
            allNotes={notes}
            isArabic={isArabic}
            onTogglePanel={toggleRightPanel}
            onSelectNote={setActiveNoteId}
            onWikiLinkClick={handleWikiLinkClick}
            onTagClick={tag => {
              setSelectedTagForIndex(tag);
              setTagIndexOpen(true);
            }}
            onOpenAudioPlayer={(sessionId, timestamp) => handleOpenAudioPlayer(sessionId, timestamp)}
            onStartRecording={() => setRecordModalOpen(true)}
          />
        </div>
      </div>

      {/* Record Modal */}
      <RecordModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        activeNote={activeNote}
        isArabic={isArabic}
      />

      {/* Audio Playback Modal with Waveform, Anchored Notes, Markers, Variable Speed */}
      {activePlaybackSessionId && (
        <AudioPlayerModal
          sessionId={activePlaybackSessionId}
          isOpen={true}
          onClose={() => {
            setActivePlaybackSessionId(null);
            setActivePlaybackSeekTime(undefined);
          }}
          isArabic={isArabic}
          initialSeekTime={activePlaybackSeekTime}
          notes={notes}
          onSelectNote={setActiveNoteId}
        />
      )}

      {/* Recordings Library Modal */}
      <RecordingsLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        isArabic={isArabic}
        notes={notes}
        onOpenPlayback={(sessionId) => handleOpenAudioPlayer(sessionId)}
      />

      {/* Crash Safety Verification Modal */}
      <CrashSafetyTestModal
        isOpen={crashTestModalOpen}
        onClose={() => setCrashTestModalOpen(false)}
        isArabic={isArabic}
      />

      {/* Full-Text Search Modal with Arabic Normalization */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={setActiveNoteId}
        isArabic={isArabic}
      />

      {/* Tag Index Modal */}
      <TagIndexModal
        isOpen={tagIndexOpen}
        onClose={() => setTagIndexOpen(false)}
        onSelectNote={setActiveNoteId}
        isArabic={isArabic}
        initialSelectedTag={selectedTagForIndex}
      />

      {/* Vault Switcher & Manager Modal */}
      <VaultSelectorModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        onSelectVault={handleSelectVault}
        isArabic={isArabic}
      />

      {/* Phase 5: Cloud Sync & Backup Modal */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        vaultId={activeVaultId}
        isArabic={isArabic}
        onVaultContentChanged={fetchNotes}
      />

      {/* Phase 5: Export (PDF, DOCX, MD) & Import (Notion, Obsidian) Modal */}
      <ExportImportModal
        isOpen={exportImportModalOpen}
        onClose={() => setExportImportModalOpen(false)}
        activeNote={activeNote}
        vaultId={activeVaultId}
        isArabic={isArabic}
        onNotesImported={fetchNotes}
      />

      {/* Phase 5: Real Privacy Policy & RootKw Rights Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        isArabic={isArabic}
      />

      {/* Notion-style Templates Gallery Modal */}
      <TemplateGalleryModal
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        isArabic={isArabic}
      />

      {/* Kuwait Teachers & School Leadership Hub Modal */}
      <KuwaitTeacherHubModal
        isOpen={kuwaitTeacherHubOpen}
        onClose={() => setKuwaitTeacherHubOpen(false)}
        isArabic={isArabic}
        onInsertContent={handleInsertFromKuwaitHub}
      />

      {/* Google & Apple / iCloud Auth & Account Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isArabic={isArabic}
        onUserChanged={(updatedUser) => setCurrentUser(updatedUser)}
      />

      {/* Startup Animated Splash Screen */}
      {showSplash && (
        <SplashScreen
          isArabic={isArabic}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}

