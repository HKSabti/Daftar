import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Bookmark,
  FileText,
  Clock,
  Download,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { RecordingSession, RecordingMarker, RecordingCapturedBlock, NoteItem } from '../../types';
import { formatAudioTime } from '../../utils/markdown';

interface AudioPlayerModalProps {
  session: RecordingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onJumpToNote?: (noteId: string, timestamp?: number) => void;
  onInsertAudioLinkIntoNote?: (session: RecordingSession) => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  session,
  isOpen,
  onClose,
  onJumpToNote,
  onInsertAudioLinkIntoNote,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'markers' | 'notes'>('timeline');
  const [markers, setMarkers] = useState<RecordingMarker[]>([]);
  const [newMarkerText, setNewMarkerText] = useState('');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Sync with session
  useEffect(() => {
    if (!session || !isOpen) return;

    setDuration(session.duration || 0);
    setMarkers(session.markers || []);
    setCurrentTime(0);
    setIsPlaying(false);

    // If session has peaks, use them; otherwise generate standard visualizer peaks
    if (session.waveformPeaks && session.waveformPeaks.length > 0) {
      setPeaks(session.waveformPeaks);
    } else {
      // Synthesize aesthetic peaks for visualization
      const samplePeaks: number[] = [];
      const count = 100;
      for (let i = 0; i < count; i++) {
        const factor = Math.sin(i * 0.2) * 0.4 + 0.5 + Math.random() * 0.3;
        samplePeaks.push(Math.min(1, Math.max(0.1, Number(factor.toFixed(2)))));
      }
      setPeaks(samplePeaks);
    }

    // Refresh full session from server if needed
    fetch(`/api/recordings/${session.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setMarkers(data.session.markers || []);
          if (data.session.waveformPeaks && data.session.waveformPeaks.length > 0) {
            setPeaks(data.session.waveformPeaks);
          }
          if (data.session.duration) {
            setDuration(data.session.duration);
          }
        }
      })
      .catch(() => {});
  }, [session, isOpen]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [session]);

  // Hotkey controls: Space (Play/Pause), Left/Right Arrows (-5s, +5s)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(5); // In RTL: left goes forward or backward depending on preference
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(-5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, currentTime, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(duration || 1000, seconds));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const seekRelative = (deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seekTo(audio.currentTime + deltaSeconds);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || duration === 0) return;
    const rect = waveformRef.current.getBoundingClientRect();
    // In RTL, 0 is on the right side
    const clickX = e.clientX - rect.left;
    const ratio = (rect.width - clickX) / rect.width; // RTL calculation
    const targetSec = Math.max(0, Math.min(duration, ratio * duration));
    seekTo(targetSec);
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleAddMarker = async () => {
    if (!session || !newMarkerText.trim()) return;

    const currentSec = Math.round(currentTime);
    const newMarker: RecordingMarker = {
      id: `m_${Date.now()}`,
      timestamp: currentSec,
      label: newMarkerText.trim(),
      createdAt: Date.now(),
    };

    const updated = [...markers, newMarker].sort((a, b) => a.timestamp - b.timestamp);
    setMarkers(updated);
    setNewMarkerText('');
    setIsAddingMarker(false);

    // Save to server
    try {
      await fetch(`/api/recordings/${session.id}/marker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: currentSec, label: newMarker.label }),
      });
    } catch {}
  };

  const handleDeleteMarker = async (markerId: string) => {
    if (!session) return;
    const updated = markers.filter(m => m.id !== markerId);
    setMarkers(updated);
    try {
      await fetch(`/api/recordings/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers: updated }),
      });
    } catch {}
  };

  if (!isOpen || !session) return null;

  const effectiveDuration = Math.max(duration, session.duration || 1);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  return (
    <div
      id="audio-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-[#13171C] text-[#F4F6F8] border border-[#2D3748] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={`/api/recordings/${session.id}/audio`}
          preload="auto"
          playsInline
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3748] bg-[#1A222C]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0D5C75]/20 text-[#0D5C75] border border-[#0D5C75]/40">
              <Volume2 className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#F4F6F8] truncate max-w-md">
                {session.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span>{new Date(session.startTime).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                <span>•</span>
                <span>ترميز صوتي Opus 24kbps</span>
                {session.noteTitle && (
                  <>
                    <span>•</span>
                    <span className="text-[#38BDF8] truncate max-w-[200px]">
                      مربوط بـ: {session.noteTitle}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/recordings/${session.id}/audio`}
              download={`${session.title || 'recording'}.webm`}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F4F6F8] hover:bg-[#2D3748] transition-colors"
              title="تنزيل الملف الصوتي (.webm)"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F4F6F8] hover:bg-[#2D3748] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Waveform & Interactive Timeline Section */}
        <div className="p-6 space-y-6">
          {/* Waveform Canvas Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span className="text-lg font-bold text-[#F4F6F8]">
                {formatAudioTime(currentTime)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span>المدة الكلية:</span>
                <span className="font-bold text-[#CBD5E1]">
                  {formatAudioTime(effectiveDuration)}
                </span>
              </div>
            </div>

            {/* Interactive Waveform Container */}
            <div
              ref={waveformRef}
              onClick={handleWaveformClick}
              className="relative h-20 sm:h-24 bg-[#1A222C] border border-[#2D3748] rounded-xl cursor-pointer select-none overflow-hidden group p-2 flex items-center justify-between"
            >
              {/* Progress Background Tint */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-[#0D5C75]/25 border-l-2 border-[#38BDF8] transition-all duration-75 pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Waveform Bars */}
              <div className="w-full h-full flex items-center justify-between gap-[2px] z-10">
                {peaks.map((peak, idx) => {
                  const barProgress = (idx / peaks.length) * 100;
                  const isPassed = barProgress <= progressPercent;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex items-center justify-center h-full"
                    >
                      <div
                        className={`w-full max-w-[4px] rounded-full transition-all duration-100 ${
                          isPassed ? 'bg-[#38BDF8]' : 'bg-[#334155] group-hover:bg-[#475569]'
                        }`}
                        style={{ height: `${Math.max(12, peak * 85)}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Marker Pins Overlay on Waveform */}
              {markers.map(m => {
                const markerPos = (m.timestamp / effectiveDuration) * 100;
                return (
                  <div
                    key={m.id}
                    onClick={e => {
                      e.stopPropagation();
                      seekTo(m.timestamp);
                    }}
                    style={{ right: `${markerPos}%` }}
                    className="absolute top-1 -translate-x-1/2 z-20 group/marker cursor-pointer"
                    title={`${m.label} [${formatAudioTime(m.timestamp)}]`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow ring-1 ring-amber-300 transform group-hover/marker:scale-150 transition-transform" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Transport Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#2D3748]/50">
            {/* Speed Multipliers */}
            <div className="flex items-center gap-1 bg-[#1A222C] p-1 rounded-xl border border-[#2D3748]">
              {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(speed => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                    playbackRate === speed
                      ? 'bg-[#0D5C75] text-white font-bold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play, Pause, Skips */}
            <div className="flex items-center gap-3">
              {/* Skip Back 10s */}
              <button
                onClick={() => seekRelative(-10)}
                className="p-2.5 rounded-xl bg-[#1A222C] hover:bg-[#2D3748] text-[#CBD5E1] transition-colors flex items-center gap-1 text-xs"
                title="تراجع 10 ثوانٍ (سهم يمين)"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[10px] font-mono">10-</span>
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0D5C75] hover:bg-[#0E6C8A] text-white shadow-lg transition-transform active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت (مسافة)' : 'تشغيل (مسافة)'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                )}
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => seekRelative(10)}
                className="p-2.5 rounded-xl bg-[#1A222C] hover:bg-[#2D3748] text-[#CBD5E1] transition-colors flex items-center gap-1 text-xs"
                title="تقديم 10 ثوانٍ (سهم يسار)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-mono">+10</span>
              </button>
            </div>

            {/* Mark Moment Quick Trigger during playback */}
            <button
              onClick={() => setIsAddingMarker(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D97706]/20 hover:bg-[#D97706]/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>إضافة علامة موضع</span>
            </button>
          </div>

          {/* Add Marker Popup Bar */}
          {isAddingMarker && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1A222C] border border-amber-500/50 animate-in fade-in">
              <span className="text-xs font-mono text-amber-400">
                [{formatAudioTime(currentTime)}]
              </span>
              <input
                type="text"
                value={newMarkerText}
                onChange={e => setNewMarkerText(e.target.value)}
                placeholder="عنوان علامة الموضع (مثال: تعريف المخطوطة الأم)..."
                onKeyDown={e => e.key === 'Enter' && handleAddMarker()}
                autoFocus
                className="flex-1 px-3 py-1.5 bg-[#13171C] border border-[#2D3748] rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleAddMarker}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-xs transition-colors"
              >
                حفظ
              </button>
              <button
                onClick={() => setIsAddingMarker(false)}
                className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                إلغاء
              </button>
            </div>
          )}

          {/* Tabs for Synced Markers and Anchored Notes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-[#2D3748] pb-1">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-[#0D5C75] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>الخط الزمني المدمج ({markers.length + (session.capturedBlocks?.length || 0)})</span>
              </button>
              <button
                onClick={() => setActiveTab('markers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'markers'
                    ? 'bg-[#0D5C75] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>علامات المواضع المهمة ({markers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-[#0D5C75] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>الفقرات المكتوبة أثناء التسجيل ({session.capturedBlocks?.length || 0})</span>
              </button>
            </div>

            {/* List Content */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {/* Combine & sort all events for timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-1.5">
                  {markers.length === 0 && (!session.capturedBlocks || session.capturedBlocks.length === 0) ? (
                    <div className="p-4 text-center text-xs text-[#64748B]">
                      لم يتم تسجيل علامات أو فقرات أثناء هذا التسجيل.
                    </div>
                  ) : (
                    [
                      ...markers.map(m => ({ ...m, kind: 'marker' as const })),
                      ...(session.capturedBlocks || []).map(b => ({
                        id: b.blockId,
                        timestamp: b.timestamp,
                        label: b.contentSnippet || 'فقرة مدونة',
                        kind: 'block' as const,
                      })),
                    ]
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .map((item, idx) => {
                        const isCurrent = Math.abs(currentTime - item.timestamp) < 4;
                        return (
                          <div
                            key={idx}
                            onClick={() => seekTo(item.timestamp)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-[#0D5C75]/30 border-[#38BDF8] text-white shadow-sm'
                                : 'bg-[#1A222C] border-[#2D3748] text-[#CBD5E1] hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black/40 text-amber-300 rounded border border-white/10">
                                {formatAudioTime(item.timestamp)}
                              </span>
                              {item.kind === 'marker' ? (
                                <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                              )}
                              <span className="text-xs truncate">{item.label}</span>
                            </div>
                            <span className="text-[10px] text-[#94A3B8] font-sans shrink-0 mr-2">
                              انقر للانتقال ↶
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              )}

              {/* Markers Tab */}
              {activeTab === 'markers' && (
                <div className="space-y-1.5">
                  {markers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#64748B]">
                      لا توجد علامات مواضع بعد. انقر على «إضافة علامة موضع» لتحديد نقطة هامة.
                    </div>
                  ) : (
                    markers.map(m => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A222C] border border-[#2D3748] hover:border-gray-500 transition-colors"
                      >
                        <div
                          onClick={() => seekTo(m.timestamp)}
                          className="flex items-center gap-2.5 cursor-pointer flex-1 truncate"
                        >
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black/40 text-amber-300 rounded border border-white/10">
                            {formatAudioTime(m.timestamp)}
                          </span>
                          <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs text-[#CBD5E1] truncate">{m.label}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMarker(m.id)}
                          className="p-1 text-[#64748B] hover:text-red-400 transition-colors"
                          title="حذف العلامة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-1.5">
                  {!session.capturedBlocks || session.capturedBlocks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#64748B]">
                      لا توجد فقرات تم التقاطها أثناء التسجيل.
                    </div>
                  ) : (
                    session.capturedBlocks.map((b, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          seekTo(b.timestamp);
                          if (session.noteId && onJumpToNote) {
                            onJumpToNote(session.noteId, b.timestamp);
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A222C] border border-[#2D3748] hover:border-gray-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate flex-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black/40 text-[#38BDF8] rounded border border-white/10">
                            {formatAudioTime(b.timestamp)}
                          </span>
                          <FileText className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                          <span className="text-xs text-[#CBD5E1] truncate">
                            {b.contentSnippet || 'فقرة مدونة'}
                          </span>
                        </div>
                        {session.noteId && onJumpToNote && (
                          <span className="text-[10px] text-[#38BDF8] hover:underline shrink-0 mr-2 flex items-center gap-1">
                            <span>فتح في المذكرة</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#2D3748] bg-[#1A222C] text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            {session.noteId && onInsertAudioLinkIntoNote && (
              <button
                onClick={() => onInsertAudioLinkIntoNote(session)}
                className="flex items-center gap-1 text-[#38BDF8] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج رابط هذا التسجيل في المذكرة</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2D3748] hover:bg-[#3E4C5F] text-white font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
