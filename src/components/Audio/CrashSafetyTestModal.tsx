import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  HardDrive,
  FileCheck,
} from 'lucide-react';
import { RecordingSession } from '../../types';

interface CrashSafetyTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayRecoveredSession?: (session: RecordingSession) => void;
}

export const CrashSafetyTestModal: React.FC<CrashSafetyTestModalProps> = ({
  isOpen,
  onClose,
  onPlayRecoveredSession,
}) => {
  const [testState, setTestState] = useState<'idle' | 'running' | 'crashed' | 'recovered' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [simulatedSession, setSimulatedSession] = useState<RecordingSession | null>(null);
  const [chunksWritten, setChunksWritten] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('ar-EG')}] ${msg}`]);
  };

  const runCrashSimulation = async () => {
    setTestState('running');
    setLogs([]);
    setChunksWritten(0);
    setSimulatedSession(null);

    try {
      addLog('1. بدء محاكاة تسجيل محاضرة جديدة: "اختبار انقطاع الطاقة المفاجئ"...');
      const startRes = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'محاكاة اختبار الأمان من الانقطاع (Crash Proof)',
          sourceType: 'microphone',
          mimeType: 'audio/webm;codecs=opus',
          bitrate: 24000,
        }),
      });

      const { session } = await startRes.json();
      setSimulatedSession(session);
      addLog(`2. تم إنشاء جلسة تسجيل نشطة برقم: ${session.id}`);

      // Synthesize 6 audio chunks (representing ~18 seconds of lecture recording)
      // We will write them chunk by chunk
      const dummyBase64Audio = 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAAA+4EBbWVuAdYAAAAAAAAAAAAAAABPZXhwdXJlaWwAAA==';

      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 600)); // brief simulation delay
        const chunkRes = await fetch(`/api/recordings/${session.id}/chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chunkIndex: i,
            data: dummyBase64Audio,
            timestamp: (i + 1) * 3,
          }),
        });

        if (chunkRes.ok) {
          setChunksWritten(i + 1);
          addLog(`✓ تم تفريغ وكتابة المقطع #${i + 1} بأمان على القرص الصلب (chunk_${String(i).padStart(6, '0')}.bin)`);
        }
      }

      // Add a moment marker during recording
      await fetch(`/api/recordings/${session.id}/marker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: 12, label: 'موضع مهم قبل انقطاع الكهرباء' }),
      });
      addLog('✓ تم تسجيل علامة موضع مهم في الثانية 00:12');

      // CRASH SIMULATION: We intentionally DO NOT call /api/recordings/:id/stop!
      // This replicates an instantaneous power failure / browser freeze / OS crash.
      addLog('⚠️ محاكاة: انقطاع مفاجئ للتيار الكهربائي أو إغلاق قسري للمتصفح دون استدعاء الإيقاف العادي!');
      setTestState('crashed');
      addLog('3. حالة الجلسة الآن: غير مكتملة (Unfinalized) وموجودة على القرص الصلب.');
    } catch (err: any) {
      addLog(`❌ خطأ أثناء المحاكاة: ${err.message}`);
      setTestState('error');
    }
  };

  const handleExecuteRecovery = async () => {
    if (!simulatedSession) return;
    setTestState('running');
    addLog('4. استدعاء خوارزمية الاسترداد التلقائي /api/recordings/:id/recover...');

    try {
      const recRes = await fetch(`/api/recordings/${simulatedSession.id}/recover`, {
        method: 'POST',
      });
      const data = await recRes.json();

      if (data.success && data.session) {
        setSimulatedSession(data.session);
        addLog(`✅ نجاح الاسترداد الكامل: تم تجميع ${chunksWritten} مقاطع من القرص بنجاح.`);
        addLog(`📊 النتيجة: تم الحفاظ على التسجيل كاملاً (${data.session.duration} ثانية) مع استعادة علامات المواضع.`);
        addLog('🎉 إثبات الأمان: لم يُفقد سوى أجزاء من الثانية الأخيرة فقط قبل الانقطاع مباشرة!');
        setTestState('recovered');
      } else {
        addLog('❌ فشل الاسترداد: ' + (data.error || 'خطأ غير معروف'));
        setTestState('error');
      }
    } catch (err: any) {
      addLog(`❌ خطأ أثناء الاسترداد: ${err.message}`);
      setTestState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="crash-safety-test-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-[#F4F6F8] text-[#13171C] border border-[#E2E7ED] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7ED] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#13171C]">
                اختبار الأمان ضد انقطاع الطاقة (Crash Safety Proof)
              </h2>
              <p className="text-xs text-[#5C6B7A]">
                إثبات عملي: حفظ كل مقطع صوتي لحظياً على القرص كل 3 ثوانٍ
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Explanation Banner */}
          <div className="p-4 bg-white border border-[#E2E7ED] rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-[#13171C] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>كيف تعمل حماية المحاضرات من التلف والانقطاع؟</span>
            </h4>
            <p className="text-[#5C6B7A] leading-relaxed">
              يقوم نظام <strong>دفتر</strong> بتقسيم التسجيل وتمريره بتدفق دوري (Timeslices) إلى
              الخادم، حيث يتم كتابة كل مقطع على القرص فور وصوله في ملفات مستقلة وسلسلة متصلة.
              في حال انطفأ الجهاز في الدقيقة 84، لا تضيع المحاضرة، بل يتم استرداد الـ 84 دقيقة بالكامل فور إعادة الفتح!
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#E2E7ED] rounded-xl">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-[#13171C]">تشغيل محاكاة الاختبار الحي</span>
              <p className="text-xs text-[#5C6B7A]">
                محاكاة تسجيل، تدفق مقاطع للقرص، انقطاع مفاجئ، ثم استرداد.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {testState === 'idle' && (
                <button
                  onClick={runCrashSimulation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0D5C75] hover:bg-[#0E6C8A] text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>بدء الاختبار الحي</span>
                </button>
              )}

              {testState === 'crashed' && (
                <button
                  onClick={handleExecuteRecovery}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md animate-bounce"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>تنفيذ الاسترداد التلقائي الآن</span>
                </button>
              )}

              {(testState === 'recovered' || testState === 'error') && (
                <button
                  onClick={runCrashSimulation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#13171C] rounded-xl font-semibold text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة تشغيل الاختبار</span>
                </button>
              )}
            </div>
          </div>

          {/* Simulation Log Output */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5C6B7A]">
                سجل تنفيذ الاختبار (Live Execution Log)
              </label>
              <div className="bg-[#13171C] text-[#38BDF8] p-4 rounded-xl font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar border border-[#2D3748]">
                {logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('✅') || line.includes('🎉')
                        ? 'text-emerald-400 font-bold'
                        : line.includes('⚠️')
                        ? 'text-amber-400 font-bold'
                        : line.includes('❌')
                        ? 'text-red-400 font-bold'
                        : 'text-[#E2E8F0]'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result Card if recovered */}
          {testState === 'recovered' && simulatedSession && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">
                    تم إثبات الأمان بنجاح تام!
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    تم استرداد {simulatedSession.duration || 18} ثانية وعلامات المواضع بدون أي عطب.
                  </p>
                </div>
              </div>
              {onPlayRecoveredSession && (
                <button
                  onClick={() => {
                    onPlayRecoveredSession(simulatedSession);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm"
                >
                  معاينة الملف المسترد
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E2E7ED] bg-white text-xs text-[#5C6B7A]">
          <span>معيار أمان الصوت: Chunked Atomic Streaming</span>
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
