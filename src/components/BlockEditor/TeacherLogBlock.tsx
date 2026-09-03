import React from 'react';
import { UserCheck, Star, Calendar, Clock, BookOpen, Award, CheckCircle } from 'lucide-react';
import { TeacherLogData } from '../../types';

interface TeacherLogBlockProps {
  data?: TeacherLogData;
  isArabic: boolean;
  onChange: (updated: TeacherLogData) => void;
}

export const TeacherLogBlock: React.FC<TeacherLogBlockProps> = ({
  data,
  isArabic,
  onChange,
}) => {
  const log: TeacherLogData = data || {
    date: '2026-03-15',
    teacherName: isArabic ? 'أ. جاسم محمد المنصور' : 'Mr. Jassem Al-Mansoor',
    department: isArabic ? 'قسم الرياضيات والعلوم' : 'Department of Math & Science',
    subject: isArabic ? 'الرياضيات المتقدمة' : 'Advanced Mathematics',
    topic: isArabic ? 'تطبيقات التفاضل والتكامل في الهندسة' : 'Calculus Applications in Engineering',
    period: 3,
    classroom: isArabic ? 'الصف الحادي عشر - علمي 2' : 'Grade 11 - Sci 2',
    observations: isArabic
      ? 'استخدام رائع للتقنيات التفاعلية ومشاركة واسعة من الطلاب.'
      : 'Excellent use of interactive pedagogical simulations.',
    evaluations: {
      preparation: 5,
      engagement: 5,
      timeManagement: 4,
      classroomControl: 5,
    },
    recommendations: isArabic
      ? 'مواصلة تعزيز مهارات التفكير الناقد وحل المشكلات.'
      : 'Continue promoting critical thinking and active learning.',
    hodSignature: isArabic ? 'رئيس القسم: د. حسن السبتي' : 'HOD: Dr. Hassan Al-Sabti',
  };

  const handleUpdate = (partial: Partial<TeacherLogData>) => {
    onChange({ ...log, ...partial });
  };

  const renderStars = (key: keyof TeacherLogData['evaluations'], currentVal: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(val => (
          <button
            key={val}
            type="button"
            onClick={() => {
              handleUpdate({
                evaluations: { ...log.evaluations, [key]: val },
              });
            }}
            className={`p-0.5 transition-transform hover:scale-110 ${
              val <= currentVal ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
            }`}
          >
            <Star className={`w-4 h-4 ${val <= currentVal ? 'fill-amber-500' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="my-4 rounded-xl border border-sky-200/80 bg-white shadow-xs overflow-hidden text-xs">
      {/* Header Banner */}
      <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-sky-950">
              {isArabic ? 'استمارة الزيارة الإشرافية وتقييم المعلم' : 'Supervisory Observation & Evaluation Log'}
            </h4>
            <span className="text-[11px] text-sky-700">
              {isArabic ? 'سجل رئيس القسم والموجه الفني' : 'Head of Department & Inspector Log'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-semibold text-[11px]">
            {log.date}
          </span>
        </div>
      </div>

      {/* Teacher & Lesson Details Form */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#FAF9F7]/40 border-b border-[#E9E9E8]">
        <div>
          <label className="block text-[#787774] text-[11px] mb-1">{isArabic ? 'اسم المعلم:' : 'Teacher Name:'}</label>
          <input
            type="text"
            value={log.teacherName}
            onChange={e => handleUpdate({ teacherName: e.target.value })}
            className="w-full p-2 bg-white border border-[#E9E9E8] rounded-md font-medium text-[#37352F] outline-hidden focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[#787774] text-[11px] mb-1">{isArabic ? 'القسم / المادة:' : 'Subject:'}</label>
          <input
            type="text"
            value={log.subject}
            onChange={e => handleUpdate({ subject: e.target.value })}
            className="w-full p-2 bg-white border border-[#E9E9E8] rounded-md font-medium text-[#37352F] outline-hidden focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[#787774] text-[11px] mb-1">{isArabic ? 'موضوع الدرس:' : 'Lesson Topic:'}</label>
          <input
            type="text"
            value={log.topic}
            onChange={e => handleUpdate({ topic: e.target.value })}
            className="w-full p-2 bg-white border border-[#E9E9E8] rounded-md font-medium text-[#37352F] outline-hidden focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-[#787774] text-[11px] mb-1">{isArabic ? 'الحصة:' : 'Period:'}</label>
          <input
            type="number"
            value={log.period}
            onChange={e => handleUpdate({ period: parseInt(e.target.value) || 1 })}
            className="w-full p-2 bg-white border border-[#E9E9E8] rounded-md font-medium text-[#37352F] outline-hidden focus:border-sky-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[#787774] text-[11px] mb-1">{isArabic ? 'الفصل الدراسي:' : 'Classroom:'}</label>
          <input
            type="text"
            value={log.classroom}
            onChange={e => handleUpdate({ classroom: e.target.value })}
            className="w-full p-2 bg-white border border-[#E9E9E8] rounded-md font-medium text-[#37352F] outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Pedagogical Evaluation Matrix */}
      <div className="p-4 border-b border-[#E9E9E8]">
        <h5 className="font-semibold text-xs text-[#37352F] mb-3">
          {isArabic ? 'معايير التقييم والأداء الصفي (1 - 5 نجوم):' : 'Classroom Performance Matrix (1-5 Stars):'}
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F3] border border-[#E9E9E8]">
            <span className="text-[#37352F]">{isArabic ? 'الإعداد والتحضير الكتابي والذهني' : 'Preparation & Planning'}</span>
            {renderStars('preparation', log.evaluations.preparation)}
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F3] border border-[#E9E9E8]">
            <span className="text-[#37352F]">{isArabic ? 'تفاعل ومشاركة الطلاب في الحصة' : 'Student Engagement'}</span>
            {renderStars('engagement', log.evaluations.engagement)}
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F3] border border-[#E9E9E8]">
            <span className="text-[#37352F]">{isArabic ? 'إدارة الوقت والتدرج في المهارات' : 'Time Management'}</span>
            {renderStars('timeManagement', log.evaluations.timeManagement)}
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F3] border border-[#E9E9E8]">
            <span className="text-[#37352F]">{isArabic ? 'التحكم بالبيئة الصفية والتعزيز' : 'Classroom Management'}</span>
            {renderStars('classroomControl', log.evaluations.classroomControl)}
          </div>
        </div>
      </div>

      {/* Observations & Recommendations */}
      <div className="p-4 space-y-3">
        <div>
          <label className="block font-semibold text-xs text-[#37352F] mb-1">
            {isArabic ? 'أبرز الإيجابيات والملاحظات الصفية:' : 'Key Strengths & Observations:'}
          </label>
          <textarea
            rows={2}
            value={log.observations}
            onChange={e => handleUpdate({ observations: e.target.value })}
            className="w-full p-2.5 bg-white border border-[#E9E9E8] rounded-lg text-xs outline-hidden focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-xs text-[#37352F] mb-1">
            {isArabic ? 'التوصيات والتوجيهات للتطوير المهني:' : 'Recommendations for Growth:'}
          </label>
          <textarea
            rows={2}
            value={log.recommendations}
            onChange={e => handleUpdate({ recommendations: e.target.value })}
            className="w-full p-2.5 bg-white border border-[#E9E9E8] rounded-lg text-xs outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E8]">
          <span className="text-[#787774] text-[11px]">{isArabic ? 'اعتماد رئيس القسم:' : 'HOD Approval:'}</span>
          <input
            type="text"
            value={log.hodSignature || ''}
            onChange={e => handleUpdate({ hodSignature: e.target.value })}
            placeholder={isArabic ? 'توقيع أو اسم رئيس القسم' : 'Signature'}
            className="p-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs font-semibold text-[#37352F] outline-hidden w-60 text-end"
          />
        </div>
      </div>
    </div>
  );
};
