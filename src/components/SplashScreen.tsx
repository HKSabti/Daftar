import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Cloud, CheckCircle2, Shield, Lock, Layers } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  isArabic: boolean;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  isArabic,
  minDurationMs = 1800,
}) => {
  const [progress, setProgress] = useState(10);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const stepsAr = [
    { label: 'تهيئة الخزانة ومساحة العمل...', detail: 'Local Vault & Storage' },
    { label: 'فحص مزامنة Google Drive و Apple iCloud...', detail: 'Cloud Sync Verification' },
    { label: 'تحميل الملاحظات والوثائق ونماذج الكويت...', detail: 'Scholarly & Kuwait Modules' },
    { label: 'جاهز للانطلاق والتسجيل!', detail: 'Workspace Ready' },
  ];

  const stepsEn = [
    { label: 'Initializing local scholarly vault...', detail: 'Local Vault & Storage' },
    { label: 'Checking Google Drive & Apple iCloud sync...', detail: 'Cloud Sync Verification' },
    { label: 'Loading notes, registers, and templates...', detail: 'Scholarly & Kuwait Modules' },
    { label: 'Daftar Workspace is ready!', detail: 'Ready to write' },
  ];

  const steps = isArabic ? stepsAr : stepsEn;

  useEffect(() => {
    // Step progression timer
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18) + 12;
        return next > 100 ? 100 : next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setCurrentStepIndex(0);
    } else if (progress < 65) {
      setCurrentStepIndex(1);
    } else if (progress < 90) {
      setCurrentStepIndex(2);
    } else {
      setCurrentStepIndex(3);
    }

    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onFinish();
        }, 400);
      }, 350);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, onFinish]);

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          id="app-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-[#FAF8F5] dark:bg-[#0E1217] text-[#1E293B] dark:text-[#E2E8F0] overflow-hidden"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Subtle ambient lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar with Brand Pill */}
          <div className="w-full max-w-md flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isArabic ? 'إصدار 2026 المعتمد' : 'Daftar v2026'}</span>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-[#78716C] dark:text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
            >
              {isArabic ? 'تخطي ↵' : 'Skip ↵'}
            </button>
          </div>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center text-center space-y-6 z-10 my-auto max-w-md w-full">
            {/* Animated Logo Icon with Rings */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-br from-[#1E293B] to-[#0F172A] dark:from-[#1E293B] dark:to-[#090D14] shadow-2xl flex items-center justify-center border border-white/20 relative z-10 text-4xl sm:text-5xl"
              >
                📓
              </motion.div>

              {/* Glowing Aura Ring */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute inset-0 -m-3 rounded-3xl bg-emerald-500/20 dark:bg-emerald-400/20 blur-lg -z-0"
              />
            </div>

            {/* Title & Slogan */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] dark:text-white font-sans">
                  {isArabic ? 'دَفْتَـر | DAFTAR' : 'DAFTAR CODEX'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  🇰🇼 الكويت
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed max-w-sm">
                {isArabic
                  ? 'مساحة التدوين والبحث العلمي وتحاضير وسجلات الميدان التربوي'
                  : 'Scholarly codex, voice notes, and official educational hub'}
              </p>
            </div>

            {/* Loading Step Card */}
            <div className="w-full bg-white/80 dark:bg-[#151B23]/80 backdrop-blur-md rounded-2xl p-4 border border-[#E2D9CC] dark:border-[#26313F] shadow-lg space-y-3">
              {/* Active Step Label */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="truncate">{steps[currentStepIndex]?.label}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  {progress}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 bg-[#EFE9E0] dark:bg-[#202936] rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-linear-to-r from-emerald-600 via-teal-500 to-sky-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>

              {/* Feature Badges */}
              <div className="pt-2 border-t border-[#EFE9E0] dark:border-[#202936] grid grid-cols-3 gap-1.5 text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                <div className="flex items-center justify-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Google & iCloud</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{isArabic ? 'تشفير محلي' : 'Local First'}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{isArabic ? 'ذكاء كفايات 2026' : 'AI Modules'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="w-full max-w-md text-center text-[11px] text-[#78716C] dark:text-[#94A3B8] z-10">
            <span>
              {isArabic
                ? 'تطوير: حسن السبتي • مبادرة RootKw للتعليم والبحث'
                : 'Crafted by Hassan Al-Sabti • RootKw Educational Initiative'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
