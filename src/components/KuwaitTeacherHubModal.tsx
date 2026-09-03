import React, { useState, useEffect } from 'react';
import { toast } from './Toast';
import {
  Sparkles,
  BookOpen,
  FolderKanban,
  FileText,
  Code2,
  Users,
  Share2,
  Download,
  ThumbsUp,
  Search,
  Plus,
  RefreshCw,
  Copy,
  Check,
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  Send,
  Upload,
  Play,
  Terminal,
  X,
  BookCheck,
  FileCheck2,
} from 'lucide-react';
import {
  KUWAIT_DEPARTMENTS,
  KUWAIT_STAGES,
  KUWAIT_ZONES,
  KUWAIT_ADMIN_REGISTERS,
  KuwaitDepartment,
  KuwaitAdminRegister,
} from '../data/kuwaitEducationData';

interface KuwaitTeacherHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
  onInsertMarkdownToNote: (markdown: string, title?: string) => void;
  activeNoteContent?: string;
  activeNoteTitle?: string;
}

type TabType = 'lesson_plan' | 'admin_records' | 'curriculum_qa' | 'coding_studio' | 'community';

export const KuwaitTeacherHubModal: React.FC<KuwaitTeacherHubModalProps> = ({
  isOpen,
  onClose,
  isArabic,
  onInsertMarkdownToNote,
  activeNoteContent,
  activeNoteTitle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('lesson_plan');

  // Tab 1: Lesson Plan Generator State
  const [planMode, setPlanMode] = useState<'create' | 'modernize'>('create');
  const [selectedDept, setSelectedDept] = useState<string>(KUWAIT_DEPARTMENTS[0].nameAr);
  const [selectedStage, setSelectedStage] = useState<string>('المرحلة الثانوية');
  const [selectedGrade, setSelectedGrade] = useState<string>('الصف العاشر');
  const [selectedZone, setSelectedZone] = useState<string>(KUWAIT_ZONES[0]);
  const [topic, setTopic] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [duration, setDuration] = useState<number>(45);
  const [lessonType, setLessonType] = useState<string>('درس جديد');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [oldPlanText, setOldPlanText] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [generatedPlanMarkdown, setGeneratedPlanMarkdown] = useState<string>('');
  const [planCopied, setPlanCopied] = useState<boolean>(false);

  // Tab 2: Admin Registers State
  const [adminCategory, setAdminCategory] = useState<'all' | 'hod' | 'vice_principal' | 'principal' | 'moe_forms'>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [selectedRegister, setSelectedRegister] = useState<KuwaitAdminRegister | null>(KUWAIT_ADMIN_REGISTERS[0]);
  const [registerCopied, setRegisterCopied] = useState<boolean>(false);

  // Tab 3: Curriculum Q&A State
  const [qaSubject, setQaSubject] = useState<string>('الفيزياء');
  const [qaGrade, setQaGrade] = useState<string>('الصف العاشر');
  const [qaInput, setQaInput] = useState<string>('');
  const [qaMessages, setQaMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'يا هلا ومسهلا بك! أنا مستشارك التعليمي الذكي لمناهج وكتب وزارة التربية بدولة الكويت 🇰🇼. آمر وتدلل، اسألني عن أي مسألة علمية، إعراب، قانون فيزيائي، أحكام فقهية، أو استخراج أسئلة ونماذج امتحانات من كتبنا المدرسية.',
      time: 'الآن',
    },
  ]);
  const [isQaLoading, setIsQaLoading] = useState<boolean>(false);

  // Tab 4: Coding Studio State
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript' | 'html'>('python');
  const [codeContent, setCodeContent] = useState<string>(`# برنامج حساب تقدير الطالب لمنهج الحاسوب الكويتي
def evaluate_student(name, score):
    print(f"طالب مدارس الكويت: {name}")
    if score >= 90:
        return "امتياز (فالك التوفيق!) 🌟"
    elif score >= 80:
        return "جيد جداً 👍"
    elif score >= 70:
        return "جيد"
    else:
        return "يحتاج خطة علاجية ودعم فردي"

# تجربة دالة التقييم
result = evaluate_student("عبدالله المطيري", 94)
print(f"النتيجة: {result}")
`);
  const [codeConsole, setCodeConsole] = useState<string | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [isCodeAiLoading, setIsCodeAiLoading] = useState<boolean>(false);
  const [codeAiNotes, setCodeAiNotes] = useState<string | null>(null);

  // Tab 5: Community Hub State
  const [communityList, setCommunityList] = useState<any[]>([]);
  const [communitySearch, setCommunitySearch] = useState<string>('');
  const [communityDeptFilter, setCommunityDeptFilter] = useState<string>('all');
  const [isCommunityLoading, setIsCommunityLoading] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareTitle, setShareTitle] = useState<string>(activeNoteTitle || '');
  const [shareDept, setShareDept] = useState<string>(KUWAIT_DEPARTMENTS[0].nameAr);
  const [shareTeacherName, setShareTeacherName] = useState<string>('أ. معلم متميز من الكويت');
  const [shareZone, setShareZone] = useState<string>(KUWAIT_ZONES[0]);
  const [shareSchool, setShareSchool] = useState<string>('مدرسة وزارة التربية');
  const [shareDesc, setShareDesc] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Load Community Templates
  const fetchCommunity = async () => {
    setIsCommunityLoading(true);
    try {
      const res = await fetch('/api/kuwait/community');
      const data = await res.json();
      if (data.templates) {
        setCommunityList(data.templates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommunityLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCommunity();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Department quick helper
  const currentDeptObj = KUWAIT_DEPARTMENTS.find(d => d.nameAr === selectedDept) || KUWAIT_DEPARTMENTS[0];

  // 1. Generate Lesson Plan
  const handleGeneratePlan = async () => {
    if (planMode === 'create' && !topic.trim()) return;
    if (planMode === 'modernize' && !oldPlanText.trim()) return;

    setIsGeneratingPlan(true);
    setGeneratedPlanMarkdown('');

    try {
      if (planMode === 'create') {
        const res = await fetch('/api/kuwait/lesson-plan/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: selectedDept,
            stage: selectedStage,
            grade: selectedGrade,
            unit: unit || 'الوحدة الدراسية المقررة',
            topic,
            durationMinutes: duration,
            lessonType,
            educationalZone: selectedZone,
            additionalNotes,
          }),
        });
        const data = await res.json();
        if (data.lessonPlanMarkdown) {
          setGeneratedPlanMarkdown(data.lessonPlanMarkdown);
          toast.success('تم توليد التحضير النموذجي بنجاح وفق معايير وزارة التربية');
        } else if (data.error) {
          toast.error(`خطأ: ${data.error}`);
        }
      } else {
        const res = await fetch('/api/kuwait/lesson-plan/modernize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldContent: oldPlanText,
            department: selectedDept,
            grade: selectedGrade,
            targetStandard: 'وثيقة الكفايات ومعايير وزارة التربية لدولة الكويت 2026',
          }),
        });
        const data = await res.json();
        if (data.modernizedMarkdown) {
          setGeneratedPlanMarkdown(data.modernizedMarkdown);
          toast.success('تم تحديث التحضير بنجاح وفق وثيقة الكفايات 2026');
        } else if (data.error) {
          toast.error(`خطأ: ${data.error}`);
        }
      }
    } catch (err: any) {
      toast.error(`فشل الاتصال: ${err.message}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 2. Q&A Submit
  const handleSendQa = async (queryText?: string) => {
    const q = queryText || qaInput;
    if (!q.trim() || isQaLoading) return;

    const userMsg = { role: 'user' as const, text: q, time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }) };
    const updatedMessages = [...qaMessages, userMsg];
    setQaMessages(updatedMessages);
    setQaInput('');
    setIsQaLoading(true);

    try {
      const res = await fetch('/api/kuwait/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          subject: qaSubject,
          grade: qaGrade,
          previousMessages: updatedMessages.slice(-4),
        }),
      });
      const data = await res.json();
      if (data.answer) {
        setQaMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer,
            time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setQaMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `عذراً، حدث خطأ في الاتصال: ${err.message}`,
          time: 'الآن',
        },
      ]);
    } finally {
      setIsQaLoading(false);
    }
  };

  // 3. Coding Execution
  const handleRunCode = async () => {
    setIsCodeRunning(true);
    setCodeConsole(null);

    try {
      if (codeLanguage === 'javascript') {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
          error: (...args: any[]) => logs.push('[Error]: ' + args.join(' ')),
        };
        const runner = new Function('console', codeContent);
        const res = runner(customConsole);
        let finalStr = logs.join('\n');
        if (res !== undefined) finalStr += (finalStr ? '\n' : '') + `=> ${String(res)}`;
        setCodeConsole(finalStr || 'تم التنفيذ بنجاح');
      } else {
        // Python simulated or AI assisted
        const res = await fetch('/api/kuwait/code-helper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: codeContent,
            language: codeLanguage,
            task: 'قم بتنفيذ وتوقع مخرجات هذا الكود مع كتابة المخرجات الناتجة بدقة',
          }),
        });
        const data = await res.json();
        setCodeConsole(data.analysis || 'تم الفحص بنجاح.');
      }
    } catch (err: any) {
      setCodeConsole(`[خطأ في الكود]: ${err.message}`);
    } finally {
      setIsCodeRunning(false);
    }
  };

  const handleExplainCodeWithAi = async () => {
    setIsCodeAiLoading(true);
    try {
      const res = await fetch('/api/kuwait/code-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeContent,
          language: codeLanguage,
          task: 'شرح هذا الكود لمنهج الحاسوب الكويتي وتوضيح مهارات التفكير البرمجي للطلاب',
        }),
      });
      const data = await res.json();
      setCodeAiNotes(data.analysis || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCodeAiLoading(false);
    }
  };

  // 4. Community Like & Download
  const handleLikeCommunity = async (id: string) => {
    try {
      const res = await fetch(`/api/kuwait/community/like/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCommunityList(prev => prev.map(item => (item.id === id ? { ...item, likes: data.likes } : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloneCommunity = async (item: any) => {
    try {
      await fetch(`/api/kuwait/community/download/${item.id}`, { method: 'POST' });
      onInsertMarkdownToNote(item.contentMarkdown, item.title);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareCurrentNote = async () => {
    if (!shareTitle.trim() || !activeNoteContent) {
      toast.warning('لا يوجد محتوى في الملاحظة الحالية للمشاركة');
      return;
    }
    setIsSharing(true);
    try {
      const res = await fetch('/api/kuwait/community/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: shareTitle,
          department: shareDept,
          grade: selectedGrade,
          teacherName: shareTeacherName,
          educationalZone: shareZone,
          school: shareSchool,
          description: shareDesc || 'تحضير متميز من معلمي الكويت',
          tags: [shareDept, 'كويت', 'معلم'],
          contentMarkdown: activeNoteContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تمت مشاركة التحضير بنجاح في مجتمع معلمي الكويت!');
        setShareModalOpen(false);
        fetchCommunity();
      }
    } catch (err: any) {
      toast.error(`خطأ أثناء المشاركة: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  // Filtered Admin Registers
  const filteredRegisters = KUWAIT_ADMIN_REGISTERS.filter(reg => {
    if (adminCategory !== 'all' && reg.category !== adminCategory) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return (
        reg.titleAr.toLowerCase().includes(q) ||
        reg.descriptionAr.toLowerCase().includes(q) ||
        reg.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      id="kuwait-teacher-hub-modal"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#FAF8F5] dark:bg-[#15191E] rounded-2xl shadow-2xl border border-[#E3DCD1] dark:border-[#2B3540] flex flex-col overflow-hidden text-[#2C2825] dark:text-[#E2E7ED]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#F2ECE4] dark:bg-[#1A2027] border-b border-[#E3DCD1] dark:border-[#2B3540]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xl shadow-xs">
              🇰🇼
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1E293B] dark:text-white">
                  ديوانية معلمي وقيادات مدارس دولة الكويت
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300 dark:border-emerald-800">
                  كفايات وزارة التربية 2026
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                زهّب تحضيرك وسجلاتك بضغطة زر، واستشر ذكاء المناهج الكويتية، وافحص كود الحاسوب، وشارك ربعك بالمدارس
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E4DCD0] dark:hover:bg-[#252D37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#EAE3D9] dark:bg-[#171D24] border-b border-[#E3DCD1] dark:border-[#2B3540] overflow-x-auto no-scrollbar text-xs font-medium">
          <button
            onClick={() => setActiveTab('lesson_plan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lesson_plan'
                ? 'bg-white dark:bg-[#232B35] text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-[#D5CBC0] dark:border-[#384554]'
                : 'text-[#5C554E] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E252F]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>زهّب تحضيرك (AI) 📝</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_records')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'admin_records'
                ? 'bg-white dark:bg-[#232B35] text-sky-800 dark:text-sky-300 font-bold shadow-xs border border-[#D5CBC0] dark:border-[#384554]'
                : 'text-[#5C554E] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E252F]'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>سجلات رئيس القسم والقيادة 📋</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum_qa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'curriculum_qa'
                ? 'bg-white dark:bg-[#232B35] text-amber-800 dark:text-amber-300 font-bold shadow-xs border border-[#D5CBC0] dark:border-[#384554]'
                : 'text-[#5C554E] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E252F]'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>مستشار المناهج وكتبنا (AI) 💬</span>
          </button>

          <button
            onClick={() => setActiveTab('coding_studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coding_studio'
                ? 'bg-white dark:bg-[#232B35] text-purple-800 dark:text-purple-300 font-bold shadow-xs border border-[#D5CBC0] dark:border-[#384554]'
                : 'text-[#5C554E] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E252F]'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>معمل بايثون وحاسوب الكويت 💻</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-white dark:bg-[#232B35] text-rose-800 dark:text-rose-300 font-bold shadow-xs border border-[#D5CBC0] dark:border-[#384554]'
                : 'text-[#5C554E] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-[#1E252F]'
            }`}
          >
            <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>ديوانية تبادل الخبرات 🌟</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5] dark:bg-[#15191E]">
          {/* ================= TAB 1: LESSON PLAN STUDIO ================= */}
          {activeTab === 'lesson_plan' && (
            <div className="space-y-6">
              {/* Top Selector Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1B222B] p-3 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlanMode('create')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      planMode === 'create'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    ✨ تحضير درس جديد على أصوله
                  </button>
                  <button
                    onClick={() => setPlanMode('modernize')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      planMode === 'modernize'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    🔄 طوّر تحضيرك القديم لكفايات 2026
                  </button>
                </div>

                <span className="text-[11px] text-[#78716C] dark:text-[#94A3B8]">
                  مطابق لتوجيهات وزارة التربية وموجهي العموم بدولة الكويت 🇰🇼
                </span>
              </div>

              {planMode === 'create' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Form: Parameters */}
                  <div className="lg:col-span-5 space-y-4 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <BookCheck className="w-4 h-4" />
                      بيانات الدرس والمادة
                    </h3>

                    {/* Department */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                        المادة / القسم العلمي والأدبي:
                      </label>
                      <select
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {KUWAIT_DEPARTMENTS.map(dept => (
                          <option key={dept.id} value={dept.nameAr}>
                            {dept.icon} {dept.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stage & Grade */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                          المرحلة الدراسية:
                        </label>
                        <select
                          value={selectedStage}
                          onChange={e => {
                            setSelectedStage(e.target.value);
                            const st = KUWAIT_STAGES.find(s => s.nameAr === e.target.value);
                            if (st && st.grades[0]) setSelectedGrade(st.grades[0]);
                          }}
                          className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {KUWAIT_STAGES.map(s => (
                            <option key={s.id} value={s.nameAr}>
                              {s.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                          الصف الدراسي:
                        </label>
                        <select
                          value={selectedGrade}
                          onChange={e => setSelectedGrade(e.target.value)}
                          className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {(
                            KUWAIT_STAGES.find(s => s.nameAr === selectedStage)?.grades || [
                              'الصف العاشر',
                              'الصف الحادي عشر',
                              'الصف الثاني عشر',
                            ]
                          ).map(g => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Topic Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-[#5C554E] dark:text-[#94A3B8]">
                          عنوان الدرس المستهدف:
                        </label>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          منهج وزارة التربية
                        </span>
                      </div>
                      <input
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="مثال: قوانين نيوتن للحركة، سورة الحجرات، المصفوفات..."
                        className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      {/* Quick Suggestions from Kuwait Curriculum */}
                      {currentDeptObj.topicsSample.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-[#78716C] dark:text-[#94A3B8] self-center">دروس مقترحة:</span>
                          {currentDeptObj.topicsSample.slice(0, 3).map(sample => (
                            <button
                              key={sample}
                              type="button"
                              onClick={() => setTopic(sample)}
                              className="text-[10px] bg-[#EFE9E0] dark:bg-[#252D37] hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[#4A423B] dark:text-[#CBD5E1] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              {sample}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Unit & Zone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                          الوحدة / المجال الدراسي:
                        </label>
                        <input
                          type="text"
                          value={unit}
                          onChange={e => setUnit(e.target.value)}
                          placeholder="مثال: الميكانيكا، النحو والصرف..."
                          className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                          المنطقة التعليمية:
                        </label>
                        <select
                          value={selectedZone}
                          onChange={e => setSelectedZone(e.target.value)}
                          className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {KUWAIT_ZONES.map(z => (
                            <option key={z} value={z}>
                              {z}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                        توجيهات واستراتيجيات خاصة (أو قيمة كويتية تربوية):
                      </label>
                      <input
                        type="text"
                        value={additionalNotes}
                        onChange={e => setAdditionalNotes(e.target.value)}
                        placeholder="مثال: ركز على التعلم التشاركي وغرس قيمة حب الكويت والولاء..."
                        className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Generate Action Button */}
                    <button
                      onClick={handleGeneratePlan}
                      disabled={isGeneratingPlan || !topic.trim()}
                      className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPlan ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>أبشر بعزك.. جاري تجهيز التحضير على سنقة عشرة ⏳</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>✨ زهّب التحضير الحين (معتمد كويتياً)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Preview Output */}
                  <div className="lg:col-span-7 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD1] dark:border-[#2B3540] mb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-[#1E293B] dark:text-white">
                          بطاقة التحضير المعتمدة لدرسك
                        </span>
                      </div>

                      {generatedPlanMarkdown && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPlanMarkdown);
                              setPlanCopied(true);
                              setTimeout(() => setPlanCopied(false), 2000);
                            }}
                            className="flex items-center gap-1 text-[11px] bg-[#EFE9E0] dark:bg-[#252D37] hover:bg-[#E5DDD2] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            {planCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{planCopied ? 'تم النسخ يا غالي 👍' : 'نسخ التحضير'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onInsertMarkdownToNote(generatedPlanMarkdown, `تحضير: ${topic || 'درس جديد'}`);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>حطّه بالنوتة على طول 📥</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#FAF8F5] dark:bg-[#13171C] p-4 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540] text-xs font-mono">
                      {generatedPlanMarkdown ? (
                        <pre className="whitespace-pre-wrap leading-relaxed font-sans text-xs text-[#2C2825] dark:text-[#CBD5E1]">
                          {generatedPlanMarkdown}
                        </pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-[#78716C] dark:text-[#94A3B8] p-6 space-y-3 font-sans">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-xs text-[#1E293B] dark:text-white">
                            حيّاك الله يا أستاذنا.. اختر المادة والدرس واضغط "زهّب التحضير الحين"
                          </p>
                          <p className="text-[11px] max-w-sm leading-relaxed">
                            بنجهز لك تحضير كامل بالمعايير، الكفايات الخاصة، التهيئة الحافزة، استراتيجيات التعلم النشط، التمايز، والتقويم وغرس القيم الكويتية الأصيلة.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Modernize Old Plan */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <RefreshCw className="w-4 h-4" />
                      تطوير وترقية تحضير قديم لنظام الكفايات 2026
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      الصق تحضيرك أو مسودتك القديمة هني، وراح نعيد صياغتها بالكامل لتوافق وثيقة الكفايات ومعايير التوجيه الفني الحديثة.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                        المادة والقسم:
                      </label>
                      <select
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      >
                        {KUWAIT_DEPARTMENTS.map(dept => (
                          <option key={dept.id} value={dept.nameAr}>
                            {dept.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                        نص التحضير القديم أو المسودة:
                      </label>
                      <textarea
                        value={oldPlanText}
                        onChange={e => setOldPlanText(e.target.value)}
                        placeholder="الصق تحضيرك القديم أو الأهداف والأنشطة هني..."
                        className="w-full h-48 bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans resize-none"
                      />
                    </div>

                    <button
                      onClick={handleGeneratePlan}
                      disabled={isGeneratingPlan || !oldPlanText.trim()}
                      className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPlan ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري ترقية التحضير وإعادة هيكلته...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>🔄 طوّر التحضير لنظام الكفايات 2026</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="lg:col-span-7 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD1] dark:border-[#2B3540] mb-3">
                      <span className="text-xs font-bold text-[#1E293B] dark:text-white">
                        التحضير بعد الترقية والتطوير الكويتي
                      </span>
                      {generatedPlanMarkdown && (
                        <button
                          onClick={() => {
                            onInsertMarkdownToNote(generatedPlanMarkdown, `تحضير مطوّر: ${selectedDept}`);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>حطّه بالنوتة على طول 📥</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#FAF8F5] dark:bg-[#13171C] p-4 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540] text-xs font-sans">
                      {generatedPlanMarkdown ? (
                        <pre className="whitespace-pre-wrap leading-relaxed text-[#2C2825] dark:text-[#CBD5E1]">
                          {generatedPlanMarkdown}
                        </pre>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#78716C] dark:text-[#94A3B8]">
                          الصق مسودة الدرس واضغط "طوّر التحضير" وتشوفه زاهب هني.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: LEADERSHIP REGISTERS & MOE FORMS ================= */}
          {activeTab === 'admin_records' && (
            <div className="space-y-6">
              {/* Category Pills & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1B222B] p-3 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540]">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setAdminCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      adminCategory === 'all'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    كل السجلات والنماذج الرسمية
                  </button>
                  <button
                    onClick={() => setAdminCategory('hod')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      adminCategory === 'hod'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    ⭐ سجلات رئيس القسم
                  </button>
                  <button
                    onClick={() => setAdminCategory('vice_principal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      adminCategory === 'vice_principal'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    ⏰ سجلات المدير المساعد والوكيل
                  </button>
                  <button
                    onClick={() => setAdminCategory('principal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      adminCategory === 'principal'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    🏛️ سجلات مدير المدرسة والمجلس
                  </button>
                  <button
                    onClick={() => setAdminCategory('moe_forms')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      adminCategory === 'moe_forms'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    📄 استمارات التوجيه الفني والوزارة
                  </button>
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                    placeholder="ابحث بالسجلات والنماذج..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Master-Detail Register Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* List of Registers */}
                <div className="lg:col-span-4 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                  {filteredRegisters.map(reg => {
                    const isSelected = selectedRegister?.id === reg.id;
                    return (
                      <div
                        key={reg.id}
                        onClick={() => setSelectedRegister(reg)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 shadow-xs'
                            : 'bg-white dark:bg-[#1B222B] border-[#E3DCD1] dark:border-[#2B3540] hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{reg.icon}</span>
                          <h4 className="text-xs font-bold text-[#1E293B] dark:text-white line-clamp-1">
                            {reg.titleAr}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2 leading-relaxed mb-2">
                          {reg.descriptionAr}
                        </p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="bg-[#EFE9E0] dark:bg-[#252D37] text-[#5C554E] dark:text-[#CBD5E1] px-2 py-0.5 rounded-md font-medium">
                            {reg.roleAr}
                          </span>
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">
                            معاينة السجل ←
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detail View of Register */}
                <div className="lg:col-span-8 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col h-[540px]">
                  {selectedRegister ? (
                    <>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD1] dark:border-[#2B3540] mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{selectedRegister.icon}</span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">
                              {selectedRegister.titleAr}
                            </h3>
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              {selectedRegister.roleAr}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedRegister.markdownContent);
                              setRegisterCopied(true);
                              setTimeout(() => setRegisterCopied(false), 2000);
                            }}
                            className="flex items-center gap-1 text-[11px] bg-[#EFE9E0] dark:bg-[#252D37] hover:bg-[#E5DDD2] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {registerCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{registerCopied ? 'تم النسخ 👍' : 'نسخ السجل'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onInsertMarkdownToNote(selectedRegister.markdownContent, selectedRegister.titleAr);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-[11px] bg-sky-700 hover:bg-sky-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افتحه كسجل بصفحتي 📥</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto bg-[#FAF8F5] dark:bg-[#13171C] p-4 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540] text-xs font-sans">
                        <pre className="whitespace-pre-wrap leading-relaxed text-[#2C2825] dark:text-[#CBD5E1]">
                          {selectedRegister.markdownContent}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#78716C]">
                      اختر سجلاً أو استمارة من القائمة عشان تعاينها بالكامل
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: CURRICULUM Q&A (GROUNDED IN KUWAIT BOOKS) ================= */}
          {activeTab === 'curriculum_qa' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Sidebar: Subject & Grade Selection */}
              <div className="lg:col-span-4 space-y-4 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E3DCD1] dark:border-[#2B3540]">
                  <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white">
                    تحديد المادة والصف الكويتي
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                    المادة المقررة:
                  </label>
                  <select
                    value={qaSubject}
                    onChange={e => setQaSubject(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    {KUWAIT_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.nameAr}>
                        {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#5C554E] dark:text-[#94A3B8]">
                    الصف الدراسي:
                  </label>
                  <select
                    value={qaGrade}
                    onChange={e => setQaGrade(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  >
                    <option value="الصف السادس">الصف السادس المتوسط</option>
                    <option value="الصف السابع">الصف السابع المتوسط</option>
                    <option value="الصف الثامن">الصف الثامن المتوسط</option>
                    <option value="الصف التاسع">الصف التاسع المتوسط</option>
                    <option value="الصف العاشر">الصف العاشر الثانوي</option>
                    <option value="الصف الحادي عشر - علمي">الصف الحادي عشر - علمي</option>
                    <option value="الصف الحادي عشر - أدبي">الصف الحادي عشر - أدبي</option>
                    <option value="الصف الثاني عشر - علمي">الصف الثاني عشر - علمي</option>
                    <option value="الصف الثاني عشر - أدبي">الصف الثاني عشر - أدبي</option>
                  </select>
                </div>

                {/* Quick Textbook Prompt Chips */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold mb-2 text-[#5C554E] dark:text-[#94A3B8]">
                    أمثلة لأسئلة من كتب وزارة التربية:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      'حل لي مسألة القوة والكتلة والتسارع مع القوانين والخطوات',
                      'أعرب لي الجملة هذي إعراب تفصيلي حسب منهج العربي',
                      'شنو شروط البيع الصحيح بفقه التربية الإسلامية؟',
                      'شلون أحسب النسبة المئوية للمول والكتلة المولية؟',
                      'شنو اختصاصات مجلس الأمة الكويتي وفق الدستور؟',
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQa(sample)}
                        className="w-full text-right text-[11px] p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#13171C] hover:bg-amber-50 dark:hover:bg-amber-950/30 text-[#4A423B] dark:text-[#CBD5E1] border border-[#E3DCD1] dark:border-[#2B3540] transition-colors leading-snug cursor-pointer"
                      >
                        💡 {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Chat Area */}
              <div className="lg:col-span-8 bg-white dark:bg-[#1B222B] p-5 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col h-[540px]">
                {/* Chat Messages Log */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FAF8F5] dark:bg-[#13171C] rounded-xl border border-[#E3DCD1] dark:border-[#2B3540] mb-3">
                  {qaMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-amber-700 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-[#1F2732] text-[#2C2825] dark:text-[#E2E7ED] border border-[#E3DCD1] dark:border-[#2B3540] rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans text-xs">{msg.text}</pre>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/10 dark:border-white/10 text-[10px] opacity-75">
                          <span>{msg.role === 'user' ? 'سؤالك' : 'مستشار المناهج وكتب الكويت 🇰🇼'}</span>
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isQaLoading && (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs p-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>أبشر.. جاري مراجعة كتب ومقررات الكويت وتجهيز الإجابة النموذجية ⏳</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={qaInput}
                    onChange={e => setQaInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendQa();
                    }}
                    placeholder={`اسألني أي سؤال في كتاب ومنهج ${qaSubject} (${qaGrade})...`}
                    className="flex-1 bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleSendQa()}
                    disabled={isQaLoading || !qaInput.trim()}
                    className="p-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: CODING STUDIO & SIMULATOR ================= */}
          {activeTab === 'coding_studio' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1B222B] p-3 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1E293B] dark:text-white">لغة البرمجة:</span>
                  {(['python', 'javascript', 'html'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        codeLanguage === lang
                          ? 'bg-purple-700 text-white'
                          : 'bg-[#EFE9E0] dark:bg-[#252D37] text-[#4A423B] dark:text-[#CBD5E1]'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExplainCodeWithAi}
                    disabled={isCodeAiLoading}
                    className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    {isCodeAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>💡 شرح لمنهج الحاسوب</span>
                  </button>

                  <button
                    onClick={handleRunCode}
                    disabled={isCodeRunning}
                    className="flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${isCodeRunning ? 'animate-pulse' : 'fill-current'}`} />
                    <span>⚡ شغّل الكود الحين</span>
                  </button>

                  <button
                    onClick={() => {
                      onInsertMarkdownToNote(`\`\`\`${codeLanguage}\n${codeContent}\n\`\`\``, 'مشروع برمجي كويتي');
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs bg-[#EFE9E0] dark:bg-[#252D37] hover:bg-[#E5DDD2] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>حطّه بالنوتة 📥</span>
                  </button>
                </div>
              </div>

              {/* Code Editor + Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Code Textarea */}
                <div className="lg:col-span-7 bg-[#13171C] rounded-2xl border border-[#2B3540] p-4 flex flex-col h-[480px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B3540] mb-2 text-xs font-mono text-[#8A99A8]">
                    <span>محرر الكود البرمجي (Editor)</span>
                    <span>{codeLanguage}</span>
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={e => setCodeContent(e.target.value)}
                    className="flex-1 w-full bg-transparent font-mono text-xs text-[#E2E7ED] leading-relaxed focus:outline-none resize-none"
                    dir="ltr"
                    spellCheck={false}
                  />
                </div>

                {/* Console + AI Feedback */}
                <div className="lg:col-span-5 space-y-4 flex flex-col h-[480px]">
                  {/* Console Output */}
                  <div className="flex-1 bg-[#0A0D11] rounded-2xl border border-[#2B3540] p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1E2630] text-emerald-400 text-xs font-mono">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>شاشة المخرجات (Execution Console)</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-emerald-300">
                      {codeConsole ? (
                        <pre className="whitespace-pre-wrap" dir="auto">
                          {codeConsole}
                        </pre>
                      ) : (
                        <span className="text-[#526071]">اضغط "شغّل الكود الحين" لتنفيذ البرنامج وعرض النتائج هنا.</span>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation Drawer if opened */}
                  {codeAiNotes && (
                    <div className="h-44 bg-purple-950/30 rounded-2xl border border-purple-800/50 p-3 overflow-y-auto text-xs text-purple-100">
                      <div className="flex items-center justify-between pb-1 border-b border-purple-800/40 mb-1 font-bold text-purple-300">
                        <span>توجيهات منهج الحاسوب الكويتي:</span>
                        <button onClick={() => setCodeAiNotes(null)} className="text-purple-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{codeAiNotes}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: COMMUNITY SHARING HUB ================= */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Community Filter & Publish Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1B222B] p-4 rounded-xl border border-[#E3DCD1] dark:border-[#2B3540]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B] dark:text-white">
                      ديوانية ومجتمع معلمي الكويت 🇰🇼
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      تصفح، حمّل، وتبادل التحاضير والخطط المميزة مع زملائك المعلمين والمعلمات بمختلف المناطق التعليمية.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShareTitle(activeNoteTitle || '');
                      setShareModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-rose-700 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>شارك تحضيرك مع ربعك بالديوانية</span>
                  </button>
                </div>
              </div>

              {/* Search & Dept Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setCommunityDeptFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      communityDeptFilter === 'all'
                        ? 'bg-rose-700 text-white'
                        : 'bg-white dark:bg-[#1B222B] text-[#4A423B] dark:text-[#CBD5E1] border border-[#E3DCD1] dark:border-[#2B3540]'
                    }`}
                  >
                    كل الأقسام والمواد
                  </button>
                  {KUWAIT_DEPARTMENTS.slice(0, 6).map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setCommunityDeptFilter(dept.nameAr)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        communityDeptFilter === dept.nameAr
                          ? 'bg-rose-700 text-white'
                          : 'bg-white dark:bg-[#1B222B] text-[#4A423B] dark:text-[#CBD5E1] border border-[#E3DCD1] dark:border-[#2B3540]'
                      }`}
                    >
                      {dept.icon} {dept.nameAr}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={communitySearch}
                    onChange={e => setCommunitySearch(e.target.value)}
                    placeholder="ابحث بتحاضير المعلمين والمعلمات..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-white dark:bg-[#1B222B] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid of Community Cards */}
              {isCommunityLoading ? (
                <div className="py-12 text-center text-rose-700 dark:text-rose-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>يا هلا.. جاري تحميل مساهمات معلمي الكويت ⏳</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityList
                    .filter(item => {
                      if (communityDeptFilter !== 'all' && item.department !== communityDeptFilter) return false;
                      if (communitySearch.trim()) {
                        const q = communitySearch.toLowerCase();
                        return (
                          item.title.toLowerCase().includes(q) ||
                          item.description?.toLowerCase().includes(q) ||
                          item.tags?.some((t: string) => t.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    })
                    .map(item => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-[#1B222B] p-4 rounded-2xl border border-[#E3DCD1] dark:border-[#2B3540] shadow-xs flex flex-col justify-between hover:shadow-md transition-all text-right space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#94A3B8] mb-2">
                            <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md font-bold">
                              {item.department}
                            </span>
                            <span>{item.grade}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-white leading-snug line-clamp-2">
                            {item.title}
                          </h4>

                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-3 pt-2 border-t border-[#F2ECE4] dark:border-[#252D37] flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#94A3B8]">
                            <span className="font-semibold text-[#334155] dark:text-[#CBD5E1]">{item.teacherName}</span>
                            <span className="text-[10px]">{item.educationalZone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] dark:border-[#252D37]">
                          <button
                            onClick={() => handleLikeCommunity(item.id)}
                            className="flex items-center gap-1 text-xs text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>كفو ({item.likes || 0})</span>
                          </button>

                          <button
                            onClick={() => handleCloneCommunity(item)}
                            className="flex items-center gap-1 text-xs bg-rose-700 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>حطّه بدفتري 📥</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Current Note Modal Dialog */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#1B222B] rounded-2xl p-5 border border-[#E3DCD1] dark:border-[#2B3540] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3DCD1] dark:border-[#2B3540]">
                <h3 className="text-sm font-bold text-[#1E293B] dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-rose-600" />
                  مشاركة تحضير درس بديوانية معلمي الكويت 🇰🇼
                </h3>
                <button onClick={() => setShareModalOpen(false)} className="text-[#64748B] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">عنوان الدرس / التحضير:</label>
                <input
                  type="text"
                  value={shareTitle}
                  onChange={e => setShareTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">المادة / القسم:</label>
                  <select
                    value={shareDept}
                    onChange={e => setShareDept(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {KUWAIT_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.nameAr}>
                        {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">المنطقة التعليمية:</label>
                  <select
                    value={shareZone}
                    onChange={e => setShareZone(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {KUWAIT_ZONES.map(z => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">اسم المعلم / المعلمة:</label>
                  <input
                    type="text"
                    value={shareTeacherName}
                    onChange={e => setShareTeacherName(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">اسم المدرسة:</label>
                  <input
                    type="text"
                    value={shareSchool}
                    onChange={e => setShareSchool(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">نبذة عن الدرس والوسائل واستراتيجيات التعلم:</label>
                <textarea
                  value={shareDesc}
                  onChange={e => setShareDesc(e.target.value)}
                  placeholder="اكتب نبذة عن الاستراتيجيات والأنشطة الإثرائية وأوراق العمل..."
                  className="w-full h-20 bg-[#FAF8F5] dark:bg-[#13171C] border border-[#D5CBC0] dark:border-[#2B3540] rounded-xl p-2.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 text-xs bg-[#EFE9E0] dark:bg-[#252D37] rounded-xl cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  onClick={handleShareCurrentNote}
                  disabled={isSharing}
                  className="px-4 py-2 text-xs bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSharing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>انشر بالديوانية الحين 🚀</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
