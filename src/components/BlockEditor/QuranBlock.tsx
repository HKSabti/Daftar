import React, { useState } from 'react';
import { BookOpen, Copy, Check, Sparkles, BookMarked, MessageSquare } from 'lucide-react';
import { QuranVerseData } from '../../types';

interface QuranBlockProps {
  data?: QuranVerseData;
  isArabic: boolean;
  onChange: (updated: QuranVerseData) => void;
}

export const QuranBlock: React.FC<QuranBlockProps> = ({
  data,
  isArabic,
  onChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTafsir, setShowTafsir] = useState(true);

  const quranData: QuranVerseData = data || {
    surahNumber: 96,
    surahNameAr: 'سورة العلق',
    surahNameEn: 'Surah Al-Alaq',
    verseNumber: 1,
    textUthmani: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴿١﴾ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ﴿٢﴾ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ﴿٣﴾ الَّذِي عَلَّمَ بِالْقَلَمِ ﴿٤﴾ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ ﴿٥﴾',
    tafsir: 'أول ما نزل من القرآن العظيم تنويهاً بأهمية العلم والقراءة والكتابة بالقلم.',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quranData.textUthmani);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-emerald-200/80 bg-linear-to-b from-emerald-50/40 to-white shadow-xs overflow-hidden">
      {/* Quran Header Badge */}
      <div className="px-4 py-2.5 bg-emerald-100/50 border-b border-emerald-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-emerald-700" />
          <span className="font-semibold text-xs text-emerald-900">
            {quranData.surahNameAr} ({quranData.surahNameEn})
          </span>
          <span className="text-[11px] text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-200/50">
            {isArabic ? 'الرسم العثماني' : 'Uthmani Script'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-emerald-800 hover:bg-emerald-200/50 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ الآية' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Main Quran Calligraphic Verse Display */}
      <div className="p-6 text-center">
        <p
          dir="rtl"
          className="font-scholarly text-xl sm:text-2xl md:text-3xl leading-loose text-[#1B4332] tracking-wide selection:bg-emerald-200"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {quranData.textUthmani}
        </p>
      </div>

      {/* Tafsir & Scholarly Notes Section */}
      {quranData.tafsir && (
        <div className="px-4 py-3 bg-emerald-50/30 border-t border-emerald-100 text-xs text-emerald-900">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-semibold">
                {isArabic ? 'التفسير والبيان: ' : 'Tafsir: '}
              </strong>
              <span className="leading-relaxed opacity-90">{quranData.tafsir}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
