import React, { useState, useEffect } from 'react';
import {
  Mic,
  Monitor,
  HardDrive,
  AlertTriangle,
  Radio,
  X,
  Info,
  Layers,
  Sparkles,
  Settings2,
} from 'lucide-react';
import { audioRecorder } from '../../services/audioRecorder';
import { NoteItem, StorageStatus, RecordingSession } from '../../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote: NoteItem | null;
  onRecordingStarted: (session: RecordingSession) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  currentNote,
  onRecordingStarted,
}) => {
  const [sourceType, setSourceType] = useState<'microphone' | 'system'>('microphone');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [attachToNote, setAttachToNote] = useState(true);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supportsSystemAudio = typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof (navigator.mediaDevices as any).getDisplayMedia === 'function';

  // Fetch audio devices and storage status
  useEffect(() => {
    if (!isOpen) return;

    // Default title
    const dateStr = new Date().toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setTitle(`تسجيل محاضرة (${dateStr})`);
    setErrorMsg(null);

    // Enumerate audio input devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      }).catch(() => {});
    }

    // Query storage status
    fetch('/api/storage/status')
      .then(res => res.json())
      .then(data => setStorageStatus(data))
      .catch(() => {});
  }, [isOpen]);

  const handleStart = async () => {
    setIsStarting(true);
    setErrorMsg(null);

    try {
      const session = await audioRecorder.startRecording({
        title: title.trim() || 'تسجيل صوتي',
        noteId: attachToNote && currentNote ? currentNote.id : undefined,
        noteTitle: attachToNote && currentNote ? currentNote.title : undefined,
        sourceType,
        deviceId: sourceType === 'microphone' ? selectedDeviceId : undefined,
      });

      setIsStarting(false);
      onRecordingStarted(session);
      onClose();
    } catch (err: any) {
      setIsStarting(false);
      setErrorMsg(err.message || 'حدث خطأ أثناء بدء التسجيل');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="record-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-[#F4F6F8] text-[#13171C] border border-[#E2E7ED] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7ED] bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#13171C]">بدء تسجيل جديد</h2>
              <p className="text-xs text-[#5C6B7A]">
                ترميز Opus خفيف (24 kbps) مع حفظ تلقائي ضد انقطاع الطاقة
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Storage Guard Banner */}
          {storageStatus && (
            <div
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
                storageStatus.isLowSpace
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-[#E2E7ED]/40 border-[#E2E7ED] text-[#5C6B7A]'
              }`}
            >
              <HardDrive
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  storageStatus.isLowSpace ? 'text-red-600' : 'text-[#0D5C75]'
                }`}
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-medium text-[#13171C]">
                  <span>مساحة القرص المتوفرة: {storageStatus.freeSpaceReadable}</span>
                  <span className="text-[#0D5C75] font-normal">
                    (يكفي لأكثر من {storageStatus.estimatedHoursRemaining} ساعة تسجيل)
                  </span>
                </div>
                {storageStatus.isLowSpace && (
                  <p className="text-red-700 font-semibold">
                    تنبيه: مساحة التخزين منخفضة، يُنصح بتفريغ مساحة قبل بدء تسجيل طويل.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-[#5C6B7A] mb-1.5">
              عنوان التسجيل / المحاضرة
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: محاضرة مناهج التحقيق - الأسبوع الثالث"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E7ED] rounded-xl text-base sm:text-sm text-[#13171C] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/30 focus:border-[#0D5C75]"
            />
          </div>

          {/* Audio Source Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#5C6B7A] mb-2">
              مصدر التقاط الصوت
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Mic Source */}
              <button
                type="button"
                onClick={() => setSourceType('microphone')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  sourceType === 'microphone'
                    ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] font-semibold ring-1 ring-[#0D5C75]'
                    : 'border-[#E2E7ED] bg-white text-[#5C6B7A] hover:border-gray-300'
                }`}
              >
                <Mic className="w-5 h-5 mb-1.5" />
                <span className="text-sm">الميكروفون (صوت الغرفة)</span>
                <span className="text-[10px] opacity-75 mt-0.5">صوت المحاضر أو قاعة الدرس</span>
              </button>

              {/* System / Screen Audio Source */}
              <button
                type="button"
                onClick={() => {
                  if (supportsSystemAudio) {
                    setSourceType('system');
                  } else {
                    setErrorMsg('التقاط صوت النظام المباشر غير مدعوم على متصفحات الهواتف الذكية (iOS Safari). يرجى استخدام الميكروفون.');
                  }
                }}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                  !supportsSystemAudio ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                } ${
                  sourceType === 'system'
                    ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] font-semibold ring-1 ring-[#0D5C75]'
                    : 'border-[#E2E7ED] bg-white text-[#5C6B7A] hover:border-gray-300'
                }`}
              >
                <Monitor className="w-5 h-5 mb-1.5" />
                <span className="text-sm">صوت النظام (محاضرة أونلاين)</span>
                <span className="text-[10px] opacity-75 mt-0.5">
                  {supportsSystemAudio ? 'Zoom / Teams / المتصفح' : 'متاح لأجهزة سطح المكتب فقط'}
                </span>
              </button>
            </div>
          </div>

          {/* Device dropdown if microphone */}
          {sourceType === 'microphone' && audioDevices.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-[#5C6B7A] mb-1.5">
                جهاز الإدخال المحدد
              </label>
              <select
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2E7ED] rounded-xl text-xs text-[#13171C] focus:outline-none focus:border-[#0D5C75]"
              >
                {audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `ميكروفون ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* macOS Guidance Callout for System Audio */}
          {sourceType === 'system' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>إرشاد التقاط صوت النظام على نظام macOS:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                عند النقر على «بدء التسجيل»، ستظهر نافذة مشاركة الشاشة في المتصفح. تأكد من تفعيل
                خيار <strong>«مشاركة صوت النظام / تبويب المتصفح»</strong>. إذا كنت تستخدم تطبيق
                مكتبي مثل Zoom، يمكنك أيضاً استخدام أداة صوت افتراضية (مثل BlackHole أو Loopback)
                لتمرير الصوت بدقة نقية وبدون صدى.
              </p>
            </div>
          )}

          {/* Attach to current note checkbox */}
          {currentNote && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-white border border-[#E2E7ED]">
              <input
                type="checkbox"
                checked={attachToNote}
                onChange={e => setAttachToNote(e.target.checked)}
                className="w-4 h-4 text-[#0D5C75] rounded focus:ring-0 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#13171C]">
                  ربط التسجيل بالمذكرة الحالية:
                </span>{' '}
                <span className="text-[#0D5C75]">{currentNote.title}</span>
                <p className="text-[11px] text-[#5C6B7A]">
                  سيتم توثيق كل فقرة تكتبها بطابع زمني متزامن مع موضع الصوت.
                </p>
              </div>
            </label>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E7ED] bg-[#FFFFFF]">
          <span className="text-[11px] text-[#5C6B7A] font-mono">
            اختصار سريع: <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">⌘⇧R</kbd>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C6B7A] hover:bg-[#E2E7ED]/50 transition-colors"
            >
              إلغاء
            </button>
            <button
              id="confirm-start-record-btn"
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{isStarting ? 'جاري التهيئة...' : 'بدء التسجيل الآن'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
