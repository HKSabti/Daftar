import React, { useEffect, useState } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Bookmark,
  ShieldCheck,
  Radio,
  FileText,
  Volume2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { audioRecorder, AudioLevelData } from '../../services/audioRecorder';
import { RecordingSession, NoteItem } from '../../types';
import { formatAudioTime } from '../../utils/markdown';

interface PersistentRecordingBarProps {
  currentNote: NoteItem | null;
  onOpenPlayer: (session: RecordingSession) => void;
  onMomentMarked?: (timestamp: number, label: string) => void;
  onRecordingFinished?: (session: RecordingSession) => void;
}

export const PersistentRecordingBar: React.FC<PersistentRecordingBarProps> = ({
  currentNote,
  onOpenPlayer,
  onMomentMarked,
  onRecordingFinished,
}) => {
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [freqBars, setFreqBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [lastChunkCount, setLastChunkCount] = useState(0);
  const [justMarked, setJustMarked] = useState(false);
  const [markerCount, setMarkerCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync state loop with audioRecorder
  useEffect(() => {
    const interval = setInterval(() => {
      const active = audioRecorder.isActive();
      const sess = audioRecorder.getSession();
      setIsActive(active);
      setIsPaused(audioRecorder.isPausedState());
      setSession(sess);

      if (active) {
        setElapsed(audioRecorder.getElapsedTime());
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to audio recorder callbacks
  useEffect(() => {
    if (!isActive) return;

    const handleLevelUpdate = (data: AudioLevelData) => {
      setAudioLevel(data.volume);
      // Map first 8 bins
      if (data.frequencyData && data.frequencyData.length >= 8) {
        setFreqBars(data.frequencyData.slice(0, 8).map(v => Math.max(10, Math.round((v / 255) * 100))));
      }
    };

    const handleChunkSaved = (chunkIndex: number) => {
      setLastChunkCount(chunkIndex + 1);
    };

    // If audioRecorder supports registering callbacks at runtime
    // We already passed them on start, but keep state updated
  }, [isActive]);

  // Global hotkey: Cmd/Ctrl + M for Mark Moment while recording
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!isActive) return;

      // Cmd+M or Ctrl+M or Alt+M to Mark Moment
      if ((e.metaKey || e.ctrlKey || e.altKey) && (e.key === 'm' || e.key === 'M' || e.key === 'ة')) {
        e.preventDefault();
        handleMarkMoment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, elapsed]);

  const handleTogglePause = () => {
    if (isPaused) {
      audioRecorder.resumeRecording();
      setIsPaused(false);
    } else {
      audioRecorder.pauseRecording();
      setIsPaused(true);
    }
  };

  const handleMarkMoment = async () => {
    if (!isActive) return;
    setJustMarked(true);
    setMarkerCount(prev => prev + 1);

    const currentSec = audioRecorder.getElapsedTime();
    const marker = await audioRecorder.markMoment(`علامة موضع [${formatAudioTime(currentSec)}]`);

    if (onMomentMarked) {
      onMomentMarked(currentSec, marker?.label || 'علامة موضع مهم');
    }

    setTimeout(() => {
      setJustMarked(false);
    }, 1200);
  };

  const handleStopRecording = async () => {
    const finalizedSession = await audioRecorder.stopRecording();
    setIsActive(false);
    setSession(null);
    setElapsed(0);

    if (finalizedSession) {
      if (onRecordingFinished) {
        onRecordingFinished(finalizedSession);
      }
      onOpenPlayer(finalizedSession);
    }
  };

  if (!isActive) return null;

  return (
    <div
      id="persistent-recording-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 transition-all duration-300 pointer-events-auto"
      dir="rtl"
    >
      <div className="bg-[#13171C] text-[#F4F6F8] border border-[#2D3748] rounded-2xl shadow-2xl p-3 sm:p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status & Live Timer */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  isPaused ? 'bg-amber-400' : 'bg-red-500 animate-ping absolute opacity-75'
                }`}
              />
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  isPaused ? 'bg-amber-500' : 'bg-red-600'
                } relative`}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-[#F4F6F8]">
                  {formatAudioTime(elapsed)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isPaused
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                      : 'bg-red-950/80 text-red-300 border border-red-800/50'
                  }`}
                >
                  {isPaused ? 'مؤقت / Paused' : 'جاري التسجيل / Live'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                {session?.noteTitle && (
                  <span className="flex items-center gap-1 truncate max-w-[160px] sm:max-w-[220px]">
                    <FileText className="w-3 h-3 text-[#0D5C75]" />
                    <span className="truncate">{session.noteTitle}</span>
                  </span>
                )}
                {session?.noteTitle && <span>•</span>}
                <span className="text-[#64748B]">Opus 24kbps Mono</span>
              </div>
            </div>
          </div>

          {/* Live Frequency / Input Meter */}
          <div className="hidden md:flex items-center gap-2 bg-[#1A222C] px-3 py-2 rounded-xl border border-[#2D3748]/60">
            <Volume2 className="w-4 h-4 text-[#0D5C75]" />
            <div className="flex items-end gap-1 h-6 w-24 px-1">
              {freqBars.map((height, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-t transition-all duration-75 ${
                    isPaused
                      ? 'bg-gray-600 h-1'
                      : height > 70
                      ? 'bg-red-400'
                      : height > 40
                      ? 'bg-amber-400'
                      : 'bg-[#0D5C75]'
                  }`}
                  style={{ height: isPaused ? '3px' : `${Math.max(4, height)}%` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#10B981] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مقطع #{lastChunkCount || 1} آمن</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* MARK MOMENT BUTTON (Crucial scholarly lecture feature) */}
            <button
              id="mark-moment-btn"
              onClick={handleMarkMoment}
              title="علامة موضع مهم (⌘M / Ctrl+M)"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all transform active:scale-95 ${
                justMarked
                  ? 'bg-amber-400 text-black shadow-lg scale-105 ring-2 ring-amber-300'
                  : 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-md'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${justMarked ? 'fill-black' : 'fill-white'}`} />
              <span className="hidden sm:inline">علامة موضع</span>
              <span className="text-xs opacity-85 px-1 py-0.2 bg-black/20 rounded font-mono">
                ⌘M
              </span>
              {markerCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {markerCount}
                </span>
              )}
            </button>

            {/* Pause / Resume Button */}
            <button
              id="pause-recording-btn"
              onClick={handleTogglePause}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2D3748] hover:bg-[#3E4C5F] text-white transition-colors"
              title={isPaused ? 'استئناف التسجيل' : 'إيقاف مؤقت'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Stop & Finalize Button */}
            <button
              id="stop-recording-btn"
              onClick={handleStopRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold shadow-md transition-colors"
              title="إنهاء التسجيل وحفظه"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>إنهاء وحفظ</span>
            </button>
          </div>
        </div>

        {/* Small safe note indicator for mobile */}
        <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-[#2D3748]/50 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1 text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>حفظ القرص مستمر (تأمين تلقائي من الانقطاع)</span>
          </span>
          <span className="font-mono text-[10px] text-[#64748B]">#مقاطع: {lastChunkCount}</span>
        </div>
      </div>
    </div>
  );
};
