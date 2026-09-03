import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Send,
} from 'lucide-react';
import { ExamData, ExamQuestion } from '../../types';

interface ExamBlockProps {
  data?: ExamData;
  isArabic: boolean;
  onChange: (updatedData: ExamData) => void;
}

export const ExamBlock: React.FC<ExamBlockProps> = ({
  data,
  isArabic,
  onChange,
}) => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

  const exam: ExamData = data || {
    title: isArabic ? 'اختبار تقويم المهارات والمعارف' : 'Interactive Skills & Knowledge Test',
    description: isArabic ? 'أجب عن الأسئلة بدقة واضغط على تسليم الاختبار لمعرفة نتيجتك فوراً.' : 'Answer the questions and submit to grade instantly.',
    timeLimitMinutes: 10,
    totalPoints: 20,
    questions: [
      {
        id: 'q1',
        question: isArabic ? 'ما هو أصل كتاب "المناظر" ومؤلفه الرائد في علم البصريات؟' : 'Who is the author of Book of Optics?',
        type: 'multiple-choice',
        options: isArabic ? ['الحسن بن الهيثم', 'ابن سينا', 'جابر بن حيان', 'الكندي'] : ['Ibn al-Haytham', 'Avicenna', 'Al-Kindi', 'Geber'],
        correctAnswer: 0,
        points: 10,
        explanation: isArabic ? 'الحسن بن الهيثم هو مؤلف كتاب المناظر الذي وضع أسس المنهج التجريبي والبصريات الحديثة.' : 'Al-Hasan Ibn al-Haytham revolutionized optical sciences.',
      },
      {
        id: 'q2',
        question: isArabic ? 'تعتبر سرعة الضوء في الفراغ ثابتة وتبلغ تقريباً 300,000 كم/ثانية.' : 'The speed of light in vacuum is approx 300,000 km/s.',
        type: 'true-false',
        options: isArabic ? ['صواب', 'خطأ'] : ['True', 'False'],
        correctAnswer: 'true',
        points: 10,
        explanation: isArabic ? 'صحيح، سرعة الضوء في الفراغ تساوي 299,792,458 م/ثانية.' : 'True, approx 3x10^8 m/s.',
      },
    ],
  };

  useEffect(() => {
    if (exam.submitted) {
      setIsSubmitted(true);
      if (exam.score !== undefined) setScore(exam.score);
      if (exam.userAnswers) setUserAnswers(exam.userAnswers);
    }
  }, [exam]);

  const handleUpdate = (partial: Partial<ExamData>) => {
    onChange({ ...exam, ...partial });
  };

  const handleAnswerSelect = (questionId: string, answer: string | number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateGrade = () => {
    let earnedPoints = 0;
    let totalPossible = 0;

    for (const q of exam.questions) {
      totalPossible += q.points;
      const userAns = userAnswers[q.id];

      if (q.type === 'multiple-choice') {
        if (Number(userAns) === Number(q.correctAnswer)) {
          earnedPoints += q.points;
        }
      } else if (q.type === 'true-false') {
        if (String(userAns).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
          earnedPoints += q.points;
        }
      } else if (q.type === 'short-answer') {
        const cleanUser = String(userAns || '').trim().toLowerCase();
        const cleanCorrect = String(q.correctAnswer || '').trim().toLowerCase();
        if (cleanUser && cleanCorrect.includes(cleanUser) || cleanUser.includes(cleanCorrect)) {
          earnedPoints += q.points;
        }
      } else {
        // essay: full or provisional
        if (userAns && String(userAns).trim().length > 5) {
          earnedPoints += q.points;
        }
      }
    }

    setScore(earnedPoints);
    setIsSubmitted(true);
    handleUpdate({
      submitted: true,
      score: earnedPoints,
      userAnswers,
    });
  };

  const handleResetExam = () => {
    setIsSubmitted(false);
    setUserAnswers({});
    setScore(null);
    handleUpdate({
      submitted: false,
      score: undefined,
      userAnswers: {},
    });
  };

  // Add a new question in Teacher Editing Mode
  const handleAddQuestion = (type: ExamQuestion['type']) => {
    const newQ: ExamQuestion = {
      id: `q-${Date.now()}`,
      question: isArabic ? 'نص السؤال الجديد...' : 'New question text...',
      type,
      options: type === 'multiple-choice' ? [
        isArabic ? 'الخيار 1' : 'Option 1',
        isArabic ? 'الخيار 2' : 'Option 2',
        isArabic ? 'الخيار 3' : 'Option 3',
        isArabic ? 'الخيار 4' : 'Option 4',
      ] : type === 'true-false' ? [
        isArabic ? 'صواب' : 'True',
        isArabic ? 'خطأ' : 'False',
      ] : undefined,
      correctAnswer: type === 'multiple-choice' ? 0 : type === 'true-false' ? 'true' : '',
      points: 5,
      explanation: isArabic ? 'شرح الإجابة الصحيحة للطلاب' : 'Explanation for students',
    };

    handleUpdate({
      questions: [...exam.questions, newQ],
      totalPoints: exam.totalPoints + 5,
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    const updated = exam.questions.filter(q => q.id !== qId);
    handleUpdate({
      questions: updated,
      totalPoints: updated.reduce((acc, q) => acc + q.points, 0),
    });
  };

  const totalPossiblePoints = exam.questions.reduce((acc, q) => acc + q.points, 0);

  return (
    <div className="my-4 rounded-xl border border-[#E9E9E8] bg-white shadow-xs overflow-hidden text-sm">
      {/* Exam Header */}
      <div className="p-4 border-b border-[#E9E9E8] bg-[#F7F6F3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
            📝
          </div>
          <div>
            <input
              type="text"
              value={exam.title}
              onChange={e => handleUpdate({ title: e.target.value })}
              placeholder={isArabic ? 'عنوان الاختبار...' : 'Exam Title...'}
              className="font-semibold text-base text-[#37352F] bg-transparent border-none outline-hidden focus:ring-1 focus:ring-[#2383E2] rounded-xs px-1"
            />
            <div className="flex items-center gap-2 text-xs text-[#787774] mt-0.5 px-1">
              <span>{exam.questions.length} {isArabic ? 'أسئلة' : 'Questions'}</span>
              <span>•</span>
              <span>{totalPossiblePoints} {isArabic ? 'درجة' : 'Points'}</span>
              {exam.timeLimitMinutes && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exam.timeLimitMinutes} {isArabic ? 'دقيقة' : 'min'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Teacher Edit Mode Toggle vs Student Solve Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isEditingMode
                ? 'bg-[#37352F] text-white border-[#37352F]'
                : 'border-[#E9E9E8] bg-white text-[#37352F] hover:bg-[#F1F1EF]'
            }`}
          >
            {isEditingMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {isEditingMode
                ? isArabic ? 'معاينة وحل الاختبار' : 'Preview / Solve'
                : isArabic ? 'تعديل الأسئلة (وضع المعلم)' : 'Edit Questions'}
            </span>
          </button>
        </div>
      </div>

      {/* Result Banner if submitted */}
      {isSubmitted && score !== null && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                {isArabic ? 'تم تصحيح الاختبار بنجاح!' : 'Exam Submitted & Graded!'}
              </h4>
              <p className="text-xs text-emerald-700">
                {isArabic ? 'الدرجة المحرزة:' : 'Your Score:'}{' '}
                <span className="font-bold font-mono text-emerald-900 text-sm">
                  {score} / {totalPossiblePoints}
                </span>{' '}
                ({Math.round((score / (totalPossiblePoints || 1)) * 100)}%)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetExam}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة الاختبار' : 'Retake Exam'}</span>
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="p-5 space-y-6">
        {exam.questions.map((q, qIndex) => {
          const userAns = userAnswers[q.id];
          const isCorrect =
            q.type === 'multiple-choice'
              ? Number(userAns) === Number(q.correctAnswer)
              : q.type === 'true-false'
              ? String(userAns).toLowerCase() === String(q.correctAnswer).toLowerCase()
              : true;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-[#E9E9E8] bg-[#FAF9F7]/50'
              }`}
            >
              {/* Question Top Bar */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#37352F] text-white flex items-center justify-center font-mono text-xs font-bold">
                    {qIndex + 1}
                  </span>
                  <span className="text-xs font-medium text-[#787774] px-2 py-0.5 rounded-full bg-[#E9E9E8]">
                    {q.points} {isArabic ? 'درجات' : 'pts'}
                  </span>
                </div>

                {isEditingMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-[#9B9A97] hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Question Title */}
              {isEditingMode ? (
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={e => {
                    const updated = exam.questions.map(item =>
                      item.id === q.id ? { ...item, question: e.target.value } : item
                    );
                    handleUpdate({ questions: updated });
                  }}
                  className="w-full p-2 border border-[#E9E9E8] rounded-lg text-xs font-medium text-[#37352F] focus:ring-1 focus:ring-[#2383E2] outline-hidden mb-3"
                />
              ) : (
                <p className="font-semibold text-[#37352F] text-sm mb-3">{q.question}</p>
              )}

              {/* Options for Multiple Choice */}
              {q.type === 'multiple-choice' && (
                <div className="space-y-2 mb-3">
                  {q.options?.map((opt, optIndex) => {
                    const isSelected = userAns !== undefined && Number(userAns) === optIndex;
                    const isRightOption = Number(q.correctAnswer) === optIndex;

                    return (
                      <div
                        key={optIndex}
                        onClick={() => !isEditingMode && handleAnswerSelect(q.id, optIndex)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSubmitted
                            ? isRightOption
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                              : isSelected && !isRightOption
                              ? 'border-rose-500 bg-rose-50 text-rose-900'
                              : 'border-[#E9E9E8] bg-white opacity-60'
                            : isSelected
                            ? 'border-[#2383E2] bg-[#2383E2]/5 text-[#2383E2] font-medium'
                            : 'border-[#E9E9E8] bg-white hover:bg-[#F7F6F3] text-[#37352F]'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                            isSelected
                              ? 'border-[#2383E2] bg-[#2383E2] text-white'
                              : 'border-[#D4D4D2] text-[#787774]'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>

                        {isEditingMode ? (
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const newOpts = [...(q.options || [])];
                              newOpts[optIndex] = e.target.value;
                              const updated = exam.questions.map(item =>
                                item.id === q.id ? { ...item, options: newOpts } : item
                              );
                              handleUpdate({ questions: updated });
                            }}
                            className="w-full bg-transparent border-none outline-hidden"
                          />
                        ) : (
                          <span className="flex-1">{opt}</span>
                        )}

                        {isSubmitted && isRightOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {isSubmitted && isSelected && !isRightOption && (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Options for True / False */}
              {q.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {['true', 'false'].map(choice => {
                    const isSelected = userAns !== undefined && String(userAns) === choice;
                    const isRightOption = String(q.correctAnswer).toLowerCase() === choice;
                    const label = choice === 'true' ? (isArabic ? 'صواب ✔' : 'True ✔') : (isArabic ? 'خطأ ✖' : 'False ✖');

                    return (
                      <button
                        type="button"
                        key={choice}
                        onClick={() => !isEditingMode && handleAnswerSelect(q.id, choice)}
                        className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                          isSubmitted
                            ? isRightOption
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : isSelected && !isRightOption
                              ? 'border-rose-500 bg-rose-50 text-rose-900'
                              : 'border-[#E9E9E8] bg-white opacity-60'
                            : isSelected
                            ? 'border-[#2383E2] bg-[#2383E2]/10 text-[#2383E2]'
                            : 'border-[#E9E9E8] bg-white hover:bg-[#F7F6F3] text-[#37352F]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {q.type === 'short-answer' && (
                <div className="mb-3">
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={String(userAns || '')}
                    onChange={e => handleAnswerSelect(q.id, e.target.value)}
                    placeholder={isArabic ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
                    className="w-full p-2.5 bg-white border border-[#E9E9E8] rounded-lg text-xs focus:ring-1 focus:ring-[#2383E2] outline-hidden"
                  />
                </div>
              )}

              {/* Explanation & Answer Model (Shown when submitted or in edit mode) */}
              {(isSubmitted || isEditingMode) && q.explanation && (
                <div className="p-2.5 rounded-lg bg-[#F1F1EF] text-xs text-[#787774] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2383E2] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#37352F]">
                      {isArabic ? 'نموذج الإجابة والشرح: ' : 'Explanation: '}
                    </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exam Bottom Action Bar */}
      <div className="p-4 border-t border-[#E9E9E8] bg-[#F7F6F3] flex flex-wrap items-center justify-between gap-3">
        {isEditingMode ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddQuestion('multiple-choice')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-[#E9E9E8] text-[#37352F] hover:bg-[#F1F1EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة سؤال اختيار من متعدد' : 'Add Multiple Choice'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('true-false')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-[#E9E9E8] text-[#37352F] hover:bg-[#F1F1EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة سؤال صح / خطأ' : 'Add True/False'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('short-answer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-[#E9E9E8] text-[#37352F] hover:bg-[#F1F1EF]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة سؤال مقالي / قصير' : 'Add Short Answer'}</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-[#787774]">
              {isArabic ? 'تمت الإجابة على:' : 'Answered:'}{' '}
              <strong className="text-[#37352F]">{Object.keys(userAnswers).length}</strong> / {exam.questions.length}
            </span>

            {!isSubmitted ? (
              <button
                type="button"
                onClick={calculateGrade}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-[#2383E2] text-white hover:bg-[#1D6FB8] transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تسليم وتصحيح الاختبار' : 'Submit & Grade Exam'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetExam}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إعادة الاختبار' : 'Retake Exam'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
