import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Check,
  X,
  Plus,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Flame,
  Layout,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { TEMPLATES, TemplateItem } from '../data/templates';
import { NoteItem } from '../types';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  isArabic: boolean;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  isArabic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<TemplateItem | null>(TEMPLATES[0]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelAr: 'جميع القوالب 🌟', labelEn: 'All Templates' },
    { id: 'education', labelAr: 'المعلمين والدرجات 📊', labelEn: 'Teachers & Grades' },
    { id: 'management', labelAr: 'رؤساء الأقسام والتوجيه 📋', labelEn: 'HODs & Supervision' },
    { id: 'exam', labelAr: 'الاختبارات وحل الأسئلة 📝', labelEn: 'Exams & Quizzes' },
    { id: 'quran', labelAr: 'القرآن والتفسير والحفظ 📖', labelEn: 'Quran & Tafsir' },
    { id: 'general', labelAr: 'تنظيم الحياة والعادات 🌱', labelEn: 'Daily Life Essentials' },
  ];

  const filteredTemplates = TEMPLATES.filter(tpl => {
    const matchesCat = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tpl.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] max-h-[780px] rounded-2xl shadow-2xl border border-[#E9E9E8] flex flex-col overflow-hidden text-[#37352F]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E9E9E8] bg-[#F7F6F3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2383E2]/10 text-[#2383E2] flex items-center justify-center font-bold text-xl">
              ✨
            </div>
            <div>
              <h2 className="font-bold text-base text-[#37352F]">
                {isArabic ? 'مكتبة النماذج والقوالب الجاهزة' : 'Notion Templates Library'}
              </h2>
              <p className="text-xs text-[#787774]">
                {isArabic
                  ? 'نماذج متخصصة للمعلمين، رؤساء الأقسام، سجلات الدرجات، الاختبارات التفاعلية، والقرآن الكريم'
                  : 'Pre-built templates for educators, department heads, solvable exams & lifestyle.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="p-4 border-b border-[#E9E9E8] bg-white flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'ابحث في القوالب والنماذج...' : 'Search templates...'}
              className="w-full ps-9 pe-3 py-2 bg-[#F7F6F3] border border-[#E9E9E8] rounded-xl text-xs outline-hidden focus:border-[#2383E2] focus:bg-white"
            />
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#2383E2] text-white shadow-xs'
                    : 'bg-[#F7F6F3] text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F]'
                }`}
              >
                {isArabic ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Area: Left/Right Split (List & Live Preview) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Primary List */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-e border-[#E9E9E8] overflow-y-auto p-3 space-y-2.5">
            {filteredTemplates.map(tpl => {
              const isSelected = activePreviewTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setActivePreviewTemplate(tpl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-start ${
                    isSelected
                      ? 'border-[#2383E2] bg-[#2383E2]/5 shadow-xs'
                      : 'border-[#E9E9E8] bg-white hover:bg-[#F7F6F3]'
                  }`}
                >
                  <span className="text-2xl select-none">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-xs text-[#37352F] truncate">
                        {isArabic ? tpl.titleAr : tpl.titleEn}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#787774] line-clamp-2 leading-relaxed mb-2">
                      {isArabic ? tpl.descriptionAr : tpl.descriptionEn}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tpl.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-sm bg-[#EFEFEF] text-[10px] text-[#787774]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right / Preview & Apply Pane */}
          <div className="flex-1 flex flex-col bg-[#FAF9F7] overflow-hidden">
            {activePreviewTemplate ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview Banner Cover */}
                {activePreviewTemplate.coverUrl && (
                  <div className="h-32 w-full relative overflow-hidden bg-slate-200">
                    <img
                      src={activePreviewTemplate.coverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  </div>
                )}

                {/* Preview Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{activePreviewTemplate.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-[#37352F]">
                        {isArabic ? activePreviewTemplate.titleAr : activePreviewTemplate.titleEn}
                      </h3>
                      <p className="text-xs text-[#787774]">
                        {isArabic ? activePreviewTemplate.descriptionAr : activePreviewTemplate.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Checklist */}
                  <div className="my-4 p-3.5 bg-white rounded-xl border border-[#E9E9E8] text-xs space-y-2">
                    <div className="font-semibold text-[#37352F] flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isArabic ? 'المميزات التفاعلية المضمنة:' : 'Interactive features included:'}</span>
                    </div>
                    <ul className="list-disc list-inside text-[#787774] space-y-1 text-[11px] leading-relaxed">
                      {activePreviewTemplate.category === 'education' && (
                        <>
                          <li>{isArabic ? 'سجل درجات ذكي مع حساب المتوسط والنسب المئوية' : 'Smart gradebook with automatic % calculation'}</li>
                          <li>{isArabic ? 'مسح وقراءة كشوفات الأسماء من كاميرا الهاتف أو Excel' : 'Camera OCR & Excel roster import'}</li>
                        </>
                      )}
                      {activePreviewTemplate.category === 'exam' && (
                        <>
                          <li>{isArabic ? 'اختبار تفاعلي قابل للإجابة والتصحيح الفوري' : 'Interactive test with instant auto-grading'}</li>
                          <li>{isArabic ? 'نماذج إجابات وشروحات تعليمية للطلاب' : 'Detailed question explanations'}</li>
                        </>
                      )}
                      {activePreviewTemplate.category === 'quran' && (
                        <>
                          <li>{isArabic ? 'رسم عثماني أصيل بالخط المصحفي مع التفسير والبيان' : 'Authentic Uthmani Quranic typography'}</li>
                          <li>{isArabic ? 'نسخ ومشاركة الآيات بضغطة زر واحدة' : 'One-click verse copying and study links'}</li>
                        </>
                      )}
                      {activePreviewTemplate.category === 'management' && (
                        <>
                          <li>{isArabic ? 'تقييم معايير الأداء الصفي بالنجوم والملاحظات' : 'Star rating performance matrix'}</li>
                          <li>{isArabic ? 'اعتماد وتوقيع رئيس القسم والموجه' : 'Head of department signature authorization'}</li>
                        </>
                      )}
                      <li>{isArabic ? 'جاهز للاستخدام والتعديل المباشر داخل دفترك' : 'Ready to use and customize in your vault'}</li>
                    </ul>
                  </div>
                </div>

                {/* Footer Apply Button */}
                <div className="p-4 bg-white border-t border-[#E9E9E8] flex items-center justify-between">
                  <span className="text-xs text-[#787774]">
                    {isArabic ? 'سيتم إنشاء صفحة جديدة بهذا القالب' : 'Creates a new page with this template'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(activePreviewTemplate);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2383E2] hover:bg-[#1D6FB8] text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isArabic ? 'استخدام هذا القالب الآن' : 'Use this template'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#787774]">
                {isArabic ? 'اختر قالباً لعرض تفاصيله' : 'Select a template to preview'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
