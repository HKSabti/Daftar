import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  Tag as TagIcon,
  ListTree,
  Info,
  Clock,
  FileText,
  Bookmark,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Mic,
  Play,
  Download,
  PanelRightClose,
  X
} from 'lucide-react';
import { NoteItem, BacklinkItem, RecordingSession } from '../types';
import { InlineFormattedText } from './InlineTextEditor';
import { formatAudioTime } from '../utils/markdown';

interface RightContextPanelProps {
  note: NoteItem | null;
  allNotes: NoteItem[];
  isArabic: boolean;
  onTogglePanel?: () => void;
  onSelectNote: (noteId: string) => void;
  onWikiLinkClick: (title: string) => void;
  onTagClick: (tag: string) => void;
  onPlayRecording?: (session: RecordingSession) => void;
  onOpenAudioPlayer?: (sessionId: string, timestamp?: number) => void;
  onStartRecording?: () => void;
}

export const RightContextPanel: React.FC<RightContextPanelProps> = ({
  note,
  allNotes,
  isArabic,
  onTogglePanel,
  onSelectNote,
  onWikiLinkClick,
  onTagClick,
  onPlayRecording,
  onOpenAudioPlayer,
  onStartRecording,
}) => {
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
  const [noteRecordings, setNoteRecordings] = useState<RecordingSession[]>([]);
  const [activeTab, setActiveTab] = useState<'backlinks' | 'recordings' | 'outline' | 'info'>('backlinks');
  const [isLoadingBacklinks, setIsLoadingBacklinks] = useState(false);

  // Fetch backlinks & recordings from server whenever active note changes
  useEffect(() => {
    if (!note) {
      setBacklinks([]);
      setNoteRecordings([]);
      return;
    }

    const fetchContextData = async () => {
      setIsLoadingBacklinks(true);
      try {
        const res = await fetch(`/api/backlinks/${encodeURIComponent(note.id)}`);
        const data = await res.json();
        setBacklinks(data.backlinks || []);

        // Fetch recordings for this note
        const recRes = await fetch(`/api/recordings?noteId=${encodeURIComponent(note.id)}`);
        const recData = await recRes.json();
        setNoteRecordings(recData.recordings || []);
      } catch (err) {
        console.error('Error loading backlinks/recordings:', err);
      } finally {
        setIsLoadingBacklinks(false);
      }
    };

    fetchContextData();
  }, [note?.id, note?.title]);

  if (!note) {
    return (
      <aside className="w-80 border-s border-[#E2E7ED] bg-[#F4F6F8] p-6 text-center text-xs text-[#5C6B7A] flex flex-col items-center justify-center">
        <Bookmark className="w-8 h-8 opacity-30 text-[#0D5C75] mb-2" />
        <p className="font-scholarly text-sm text-[#13171C] font-semibold mb-1">
          {isArabic ? 'الحاشية والتعليقات' : 'Marginalia & Context'}
        </p>
        <p>{isArabic ? 'اختر وثيقة لعرض الروابط المعاكسة والشروح الهامشية' : 'Select a note to inspect backlinks & marginalia'}</p>
      </aside>
    );
  }

  // Calculate note statistics
  const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = note.content.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Extract headings for outline
  const headingLines = (note.content || '').split('\n').filter(l => l.startsWith('#'));

  return (
    <aside className="w-80 border-s border-[#E2E7ED] bg-[#F4F6F8] flex flex-col h-full overflow-hidden text-xs shrink-0">
      {/* Marginalia Header inspired by Arabic Manuscript Ḥāshiya Tradition */}
      <div className="p-3.5 border-b border-[#E2E7ED] bg-white/70 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#0D5C75]" />
          <div>
            <h3 className="font-scholarly font-bold text-sm text-[#13171C] leading-none">
              {isArabic ? 'الحاشية والتعليق' : 'Marginalia'}
            </h3>
            <span className="text-[10px] text-[#5C6B7A]">{isArabic ? 'الروابط وفهارس الوثيقة' : 'Backlinks & Note Index'}</span>
          </div>
        </div>

        {onTogglePanel && (
          <button
            type="button"
            onClick={onTogglePanel}
            className="p-1 rounded-md hover:bg-[#EAEAE8] text-[#5C6B7A] hover:text-[#13171C] transition-colors cursor-pointer"
            title={isArabic ? 'إخفاء الحاشية' : 'Hide panel'}
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E7ED] bg-white/40 px-2 pt-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('backlinks')}
          className={`flex-1 py-1.5 px-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'backlinks'
              ? 'border-[#0D5C75] text-[#0D5C75] bg-[#F4F6F8]'
              : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{isArabic ? 'الروابط' : 'Links'}</span>
          {backlinks.length > 0 && (
            <span className="px-1 py-0.1 rounded-full bg-[#0D5C75]/10 text-[#0D5C75] text-[9px]">
              {backlinks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recordings')}
          className={`flex-1 py-1.5 px-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'recordings'
              ? 'border-[#0D5C75] text-[#0D5C75] bg-[#F4F6F8]'
              : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-red-600" />
          <span>{isArabic ? 'الصوتيات' : 'Audio'}</span>
          {noteRecordings.length > 0 && (
            <span className="px-1 py-0.1 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">
              {noteRecordings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outline')}
          className={`flex-1 py-1.5 px-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'outline'
              ? 'border-[#0D5C75] text-[#0D5C75] bg-[#F4F6F8]'
              : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
          }`}
        >
          <ListTree className="w-3.5 h-3.5" />
          <span>{isArabic ? 'الفهرس' : 'Outline'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-1.5 px-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'info'
              ? 'border-[#0D5C75] text-[#0D5C75] bg-[#F4F6F8]'
              : 'border-transparent text-[#5C6B7A] hover:text-[#13171C]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{isArabic ? 'بيانات' : 'Info'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'backlinks' && (
          <div className="space-y-4">
            {/* Backlinks (Incoming Links) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
                  {isArabic ? 'الروابط الواردة (Backlinks)' : 'Incoming Backlinks'}
                </span>
                <span className="text-[10px] text-[#5C6B7A]">{backlinks.length}</span>
              </div>

              {isLoadingBacklinks ? (
                <div className="p-3 text-center text-xs text-[#5C6B7A]">
                  {isArabic ? 'جارِ فحص الروابط...' : 'Scanning backlinks...'}
                </div>
              ) : backlinks.length === 0 ? (
                <div className="p-4 rounded border border-dashed border-[#E2E7ED] text-center text-xs text-[#5C6B7A]">
                  <p className="font-medium text-[#13171C] mb-1">
                    {isArabic ? 'لا توجد روابط واردة بعد' : 'No incoming backlinks yet'}
                  </p>
                  <p className="text-[11px]">
                    {isArabic
                      ? `لربط وثيقة أخرى بهذه، اكتب [[${note.title}]] في أي وثيقة.`
                      : `Type [[${note.title}]] in any other note to link here.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backlinks.map((b, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectNote(b.sourceNoteId)}
                      className="w-full text-start p-2.5 rounded-md bg-white border border-[#E2E7ED] hover:border-[#0D5C75]/50 transition-colors group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0D5C75] mb-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{b.sourceNoteTitle}</span>
                      </div>
                      <p className="text-[11px] text-[#5C6B7A] line-clamp-2 leading-relaxed bg-[#F4F6F8] p-1.5 rounded border border-[#E2E7ED]/50 font-serif">
                        "{b.excerpt}"
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
                  {isArabic ? 'الروابط الصادرة' : 'Outgoing Links'}
                </span>
                <span className="text-[10px] text-[#5C6B7A]">{note.outgoingLinks.length}</span>
              </div>

              {note.outgoingLinks.length === 0 ? (
                <p className="text-[11px] text-[#5C6B7A] italic">
                  {isArabic ? 'لا توجد روابط صادرة' : 'No outgoing links'}
                </p>
              ) : (
                <div className="space-y-1">
                  {note.outgoingLinks.map((linkTitle, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onWikiLinkClick(linkTitle)}
                      className="w-full text-start px-2 py-1.5 rounded bg-white border border-[#E2E7ED] hover:border-[#0D5C75]/40 text-xs flex items-center justify-between text-[#13171C] transition-colors cursor-pointer"
                    >
                      <span className="truncate font-medium">{linkTitle}</span>
                      <ExternalLink className="w-3 h-3 text-[#5C6B7A] opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags on this note */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
                  {isArabic ? 'الوسوم في هذا النص' : 'Tags in Note'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {note.tags.length === 0 ? (
                  <p className="text-[11px] text-[#5C6B7A] italic">
                    {isArabic ? 'لم تُضف وسوم بعد (#وسم)' : 'No tags yet (#tag)'}
                  </p>
                ) : (
                  note.tags.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onTagClick(tag)}
                      className="px-2 py-0.5 rounded bg-white border border-[#E2E7ED] hover:bg-[#0D5C75]/10 hover:text-[#0D5C75] text-[#5C6B7A] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <TagIcon className="w-3 h-3 opacity-60" />
                      <span>#{tag}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Note Audio Recordings Tab */}
        {activeTab === 'recordings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
                {isArabic ? 'التسجيلات المرتبطة بالمذكرة' : 'Attached Recordings'}
              </span>
              <span className="text-[10px] text-[#5C6B7A]">{noteRecordings.length}</span>
            </div>

            {noteRecordings.length === 0 ? (
              <div className="p-4 rounded border border-dashed border-[#E2E7ED] text-center text-xs text-[#5C6B7A]">
                <Mic className="w-6 h-6 mx-auto mb-1.5 text-[#5C6B7A] opacity-40" />
                <p className="font-medium text-[#13171C] mb-1">
                  {isArabic ? 'لا توجد تسجيلات صوتية لهذه المذكرة' : 'No audio recordings yet'}
                </p>
                <p className="text-[11px]">
                  {isArabic
                    ? 'انقر على زر التسجيل في الأعلى أو استخدم ⌘⇧R لبدء تسجيل المحاضرة.'
                    : 'Click Record above or press ⌘⇧R to start recording.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {noteRecordings.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-white border border-[#E2E7ED] hover:border-[#0D5C75]/50 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="truncate flex-1">
                        <h4 className="font-semibold text-xs text-[#13171C] truncate">
                          {rec.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#5C6B7A] mt-0.5">
                          <span>{new Date(rec.startTime).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="font-mono text-[#0D5C75] font-bold">
                            {formatAudioTime(rec.duration || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(rec.markers?.length || 0) > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <Bookmark className="w-3 h-3 text-amber-500" />
                        <span>{rec.markers?.length} علامات موضع</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <a
                        href={`/api/recordings/${rec.id}/audio`}
                        download={`${rec.title}.webm`}
                        className="p-1 text-[#5C6B7A] hover:text-[#13171C] rounded"
                        title="تنزيل"
                      >
                        <Download className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => onPlayRecording && onPlayRecording(rec)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#0D5C75] hover:bg-[#0E6C8A] text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                        <span>تشغيل ومزامنة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B7A]">
              {isArabic ? 'فهرس العناوين والمسائل' : 'Table of Contents'}
            </span>

            {headingLines.length === 0 ? (
              <p className="text-[11px] text-[#5C6B7A] italic py-2">
                {isArabic ? 'أدرج عناوين (# أو ##) لتكوين الفهرس' : 'Add headings (# or ##) to generate outline'}
              </p>
            ) : (
              <div className="space-y-1 border-s border-[#E2E7ED] ps-2">
                {headingLines.map((hLine, i) => {
                  const level = hLine.match(/^#+/)?.[0].length || 1;
                  const text = hLine.replace(/^#+\s*/, '');
                  return (
                    <div
                      key={i}
                      className={`text-xs py-1 hover:text-[#0D5C75] transition-colors ${
                        level === 1
                          ? 'font-bold text-[#13171C]'
                          : level === 2
                          ? 'ps-2 font-medium text-[#13171C]/90'
                          : 'ps-4 text-[#5C6B7A]'
                      }`}
                    >
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3 bg-white p-3 rounded-lg border border-[#E2E7ED]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E7ED]/50 text-xs">
              <span className="text-[#5C6B7A]">{isArabic ? 'عدد الكلمات:' : 'Word Count:'}</span>
              <span className="font-mono font-semibold text-[#13171C]">{wordCount}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E7ED]/50 text-xs">
              <span className="text-[#5C6B7A]">{isArabic ? 'عدد الحروف:' : 'Characters:'}</span>
              <span className="font-mono font-semibold text-[#13171C]">{charCount}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E7ED]/50 text-xs">
              <span className="text-[#5C6B7A]">{isArabic ? 'زمن القراءة التقديري:' : 'Est. Reading:'}</span>
              <span className="font-mono font-semibold text-[#13171C]">
                {readTimeMinutes} {isArabic ? 'دقيقة' : 'min'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E7ED]/50 text-xs">
              <span className="text-[#5C6B7A]">{isArabic ? 'المسار في الخزانة:' : 'Vault Path:'}</span>
              <span className="font-mono text-[10px] text-[#13171C] truncate max-w-[140px]">{note.path}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5C6B7A]">{isArabic ? 'آخر تعديل:' : 'Last Modified:'}</span>
              <span className="text-[10px] text-[#5C6B7A]">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

