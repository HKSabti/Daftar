import React, { useState, useEffect } from 'react';
import {
  Mic,
  Search,
  Play,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Clock,
  Bookmark,
  HardDrive,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { RecordingSession, NoteItem } from '../../types';
import { formatAudioTime } from '../../utils/markdown';
import { normalizeArabic } from '../../utils/arabic';

interface RecordingsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote: NoteItem | null;
  onPlayRecording: (session: RecordingSession) => void;
  onJumpToNote?: (noteId: string) => void;
}

export const RecordingsLibraryModal: React.FC<RecordingsLibraryModalProps> = ({
  isOpen,
  onClose,
  currentNote,
  onPlayRecording,
  onJumpToNote,
}) => {
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [unfinalized, setUnfinalized] = useState<RecordingSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNoteOnly, setFilterNoteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  const fetchRecordings = async () => {
    setIsLoading(true);
    try {
      // Fetch normal recordings
      const url = filterNoteOnly && currentNote
        ? `/api/recordings?noteId=${encodeURIComponent(currentNote.id)}`
        : '/api/recordings';
      const res = await fetch(url);
      const data = await res.json();
      setRecordings(data.recordings || []);

      // Fetch unfinalized / crashed sessions
      const unfinRes = await fetch('/api/recordings/unfinalized');
      const unfinData = await unfinRes.json();
      setUnfinalized(unfinData.unfinalized || []);
    } catch (err) {
      console.warn('Error fetching recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecordings();
    }
  }, [isOpen, filterNoteOnly, currentNote]);

  const handleRecover = async (sessionId: string) => {
    setRecoveringId(sessionId);
    try {
      const res = await fetch(`/api/recordings/${sessionId}/recover`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        await fetchRecordings();
        if (data.session) {
          onPlayRecording(data.session);
        }
      }
    } catch (err) {
      console.warn('Error recovering recording:', err);
    } finally {
      setRecoveringId(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التسجيل؟')) return;
    try {
      await fetch(`/api/recordings/${sessionId}`, { method: 'DELETE' });
      setRecordings(prev => prev.filter(r => r.id !== sessionId));
      setUnfinalized(prev => prev.filter(r => r.id !== sessionId));
    } catch {}
  };

  const handleRename = async (sessionId: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await fetch(`/api/recordings/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      setRecordings(prev =>
        prev.map(r => (r.id === sessionId ? { ...r, title: editingTitle.trim() } : r))
      );
      setEditingId(null);
    } catch {}
  };

  if (!isOpen) return null;

  // Filter recordings by search
  const filteredRecordings = recordings.filter(rec => {
    if (!searchQuery.trim()) return true;
    const qNorm = normalizeArabic(searchQuery);
    const titleNorm = normalizeArabic(rec.title || '');
    const noteTitleNorm = normalizeArabic(rec.noteTitle || '');
    const markersMatch = (rec.markers || []).some(m => normalizeArabic(m.label).includes(qNorm));
    return titleNorm.includes(qNorm) || noteTitleNorm.includes(qNorm) || markersMatch;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div
      id="recordings-library-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-[#F4F6F8] text-[#13171C] border border-[#E2E7ED] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7ED] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75] border border-[#0D5C75]/20">
              <Mic className="w-5 h-5 text-[#0D5C75]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#13171C]">مكتبة التسجيلات الصوتية</h2>
              <p className="text-xs text-[#5C6B7A]">
                محاضرات وجلسات التحقيق المسجلة في الخزانة الحالية
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

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white border-b border-[#E2E7ED] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6B7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث في التسجيلات وعلامات المواضع والمذكرات..."
              className="w-full pl-3 pr-9 py-2 bg-[#F4F6F8] border border-[#E2E7ED] rounded-xl text-xs text-[#13171C] focus:outline-none focus:border-[#0D5C75]"
            />
          </div>

          <div className="flex items-center gap-2">
            {currentNote && (
              <button
                onClick={() => setFilterNoteOnly(!filterNoteOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filterNoteOnly
                    ? 'bg-[#0D5C75] text-white border-[#0D5C75]'
                    : 'bg-white text-[#5C6B7A] border-[#E2E7ED] hover:border-gray-400'
                }`}
              >
                تصفية لمذكرة: {currentNote.title}
              </button>
            )}

            <button
              onClick={fetchRecordings}
              className="p-2 rounded-xl border border-[#E2E7ED] bg-white text-[#5C6B7A] hover:text-[#13171C] transition-colors"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Unfinalized / Crashed Sessions Banner if any */}
          {unfinalized.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>تم اكتشاف تسجيلات غير مكتملة (حماية انقطاع الطاقة / Crash Safety)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                المقاطع محفوظة بالكامل على القرص، يمكنك استردادها فوراً دون فقدان أي بيانات:
              </p>
              <div className="space-y-2 pt-1">
                {unfinalized.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-amber-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-amber-950 truncate">{u.title}</span>
                      <span className="text-[#5C6B7A] font-mono text-[11px]">
                        ({u.chunkCount || '?'} مقاطع محفوظة)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRecover(u.id)}
                      disabled={recoveringId === u.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{recoveringId === u.id ? 'جاري الاسترداد...' : 'استرداد التسجيل الآن'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recordings List */}
          {filteredRecordings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E2E7ED] text-[#5C6B7A] flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#13171C]">لا توجد تسجيلات مطابقة</h3>
              <p className="text-xs text-[#5C6B7A] max-w-sm mx-auto">
                ابدأ تسجيلاً جديداً بالنقر على زر التسجيل في الأعلى أو استخدم الاختصار ⌘⇧R.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecordings.map(rec => (
                <div
                  key={rec.id}
                  className="bg-white border border-[#E2E7ED] rounded-xl p-4 shadow-sm hover:border-[#0D5C75]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      {editingId === rec.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRename(rec.id)}
                            autoFocus
                            className="px-2 py-1 bg-[#F4F6F8] border border-[#0D5C75] rounded text-xs text-[#13171C] flex-1"
                          />
                          <button
                            onClick={() => handleRename(rec.id)}
                            className="p-1 text-[#0D5C75] hover:bg-gray-100 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1 truncate">
                          <h3 className="font-bold text-sm text-[#13171C] truncate">
                            {rec.title}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingId(rec.id);
                              setEditingTitle(rec.title);
                            }}
                            className="p-1 text-[#5C6B7A] hover:text-[#13171C] opacity-60 hover:opacity-100"
                            title="تعديل العنوان"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0D5C75]/10 text-[#0D5C75] rounded-full shrink-0">
                        {formatAudioTime(rec.duration || 0)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C6B7A]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(rec.startTime).toLocaleDateString('ar-EG', {
                            dateStyle: 'medium',
                          })}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>{formatFileSize(rec.sizeBytes)}</span>
                      </span>
                      {(rec.markers?.length || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-700">
                            <Bookmark className="w-3 h-3 text-amber-500" />
                            <span>{rec.markers?.length} مواضع مهمة</span>
                          </span>
                        </>
                      )}
                    </div>

                    {rec.noteTitle && (
                      <div className="pt-1">
                        <span
                          onClick={() => {
                            if (rec.noteId && onJumpToNote) {
                              onJumpToNote(rec.noteId);
                              onClose();
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-[#0D5C75] bg-[#0D5C75]/5 px-2 py-0.5 rounded border border-[#0D5C75]/15 hover:underline cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{rec.noteTitle}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E7ED]">
                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/recordings/${rec.id}/audio`}
                        download={`${rec.title || 'recording'}.webm`}
                        className="p-1.5 text-[#5C6B7A] hover:text-[#13171C] hover:bg-[#E2E7ED]/50 rounded-lg transition-colors"
                        title="تنزيل الملف الصوتي (.webm)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-1.5 text-[#5C6B7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف التسجيل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onPlayRecording(rec);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D5C75] hover:bg-[#0E6C8A] text-white rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      <span>تشغيل التسجيل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E2E7ED] bg-white text-xs text-[#5C6B7A]">
          <span>إجمالي التسجيلات: {recordings.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#E2E7ED] hover:bg-gray-300 text-[#13171C] font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
