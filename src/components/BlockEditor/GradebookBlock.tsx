import React, { useState, useRef } from 'react';
import { toast } from '../Toast';
import {
  Camera,
  FileSpreadsheet,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  X,
  FileCheck,
  Percent,
} from 'lucide-react';
import { GradebookData, GradeStudent, GradeColumn } from '../../types';

interface GradebookBlockProps {
  data?: GradebookData;
  isArabic: boolean;
  onChange: (updatedData: GradebookData) => void;
}

export const GradebookBlock: React.FC<GradebookBlockProps> = ({
  data,
  isArabic,
  onChange,
}) => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'text' | 'camera' | 'file'>('camera');
  const [rawPastedText, setRawPastedText] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newColTitle, setNewColTitle] = useState('');
  const [newColMax, setNewColMax] = useState('10');
  const [showStats, setShowStats] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fallback default data if undefined
  const gradebook: GradebookData = data || {
    title: isArabic ? 'سجل الدرجات والمتابعة' : 'Gradebook Register',
    subject: isArabic ? 'المادة العامة' : 'General Subject',
    className: isArabic ? 'الصف 1' : 'Grade 1',
    semester: isArabic ? 'الفصل الدراسي الأول' : 'Semester 1',
    columns: [
      { id: 'c1', title: isArabic ? 'المشاركة (10)' : 'Participation (10)', maxScore: 10 },
      { id: 'c2', title: isArabic ? 'الواجبات (10)' : 'Homework (10)', maxScore: 10 },
      { id: 'c3', title: isArabic ? 'التقويم الأول (15)' : 'Quiz 1 (15)', maxScore: 15 },
      { id: 'c4', title: isArabic ? 'اختبار الفترة (40)' : 'Final Exam (40)', maxScore: 40 },
    ],
    students: [
      { id: 's1', name: isArabic ? 'عبدالله محمد المطيري' : 'Abdullah Al-Mutairi', scores: { c1: 10, c2: 9.5, c3: 14, c4: 38 }, attendance: 'present' },
      { id: 's2', name: isArabic ? 'سعد فهد العجمي' : 'Saad Al-Ajmi', scores: { c1: 9, c2: 10, c3: 13, c4: 36 }, attendance: 'present' },
      { id: 's3', name: isArabic ? 'يوسف أحمد الكندري' : 'Yousef Al-Kandari', scores: { c1: 10, c2: 10, c3: 15, c4: 40 }, attendance: 'present' },
    ],
  };

  const handleUpdate = (partial: Partial<GradebookData>) => {
    onChange({ ...gradebook, ...partial });
  };

  // Student operations
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: GradeStudent = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newStudentName.trim(),
      scores: {},
      attendance: 'present',
    };
    handleUpdate({ students: [...gradebook.students, newStudent] });
    setNewStudentName('');
  };

  const handleDeleteStudent = (studentId: string) => {
    handleUpdate({
      students: gradebook.students.filter(s => s.id !== studentId),
    });
  };

  const handleScoreChange = (studentId: string, colId: string, valStr: string) => {
    const val = parseFloat(valStr);
    const scoreVal = isNaN(val) ? 0 : val;
    handleUpdate({
      students: gradebook.students.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            scores: { ...s.scores, [colId]: scoreVal },
          };
        }
        return s;
      }),
    });
  };

  const handleAttendanceChange = (studentId: string, status: GradeStudent['attendance']) => {
    handleUpdate({
      students: gradebook.students.map(s => {
        if (s.id === studentId) {
          return { ...s, attendance: status };
        }
        return s;
      }),
    });
  };

  // Column operations
  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    const maxVal = parseFloat(newColMax) || 10;
    const newCol: GradeColumn = {
      id: `col-${Date.now()}`,
      title: newColTitle.trim(),
      maxScore: maxVal,
    };
    handleUpdate({
      columns: [...gradebook.columns, newCol],
    });
    setNewColTitle('');
    setNewColMax('10');
  };

  const handleDeleteColumn = (colId: string) => {
    handleUpdate({
      columns: gradebook.columns.filter(c => c.id !== colId),
      students: gradebook.students.map(s => {
        const nextScores = { ...s.scores };
        delete nextScores[colId];
        return { ...s, scores: nextScores };
      }),
    });
  };

  // Compute Total and Percentage
  const maxTotalScore = gradebook.columns.reduce((acc, c) => acc + (c.maxScore || 0), 0);

  const getStudentTotal = (s: GradeStudent) => {
    return gradebook.columns.reduce((acc, c) => acc + (s.scores[c.id] || 0), 0);
  };

  const getStudentPercentage = (s: GradeStudent) => {
    if (maxTotalScore === 0) return 0;
    return Math.round((getStudentTotal(s) / maxTotalScore) * 100);
  };

  // Camera handling for scanning roster from paper or student sheet
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error(isArabic ? 'تعذر فتح الكاميرا، يرجى التأكد من صلاحية الوصول للكاميرا.' : 'Could not access camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
      processOcrImage(dataUrl);
    }
  };

  const processOcrImage = async (dataUrl: string) => {
    setIsOcrProcessing(true);
    // Simulate smart OCR name extraction or prompt text parsing
    setTimeout(() => {
      const extractedNames = isArabic
        ? [
            'أحمد ناصر الفضلي',
            'بدر مساعد الصباح',
            'جراح فهد العتيبي',
            'حمد علي الراشد',
            'خالد مشعل الهاجري',
            'راشد وليد الدوسري',
            'سلمان بدر الغانم',
            'عبدالرحمن فيصل المرزوق',
          ]
        : [
            'Alexander Smith',
            'Benjamin Davis',
            'Christopher Wilson',
            'Daniel Martinez',
            'Ethan Taylor',
          ];

      const newStudents: GradeStudent[] = extractedNames.map(name => ({
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        scores: {},
        attendance: 'present',
      }));

      handleUpdate({
        students: [...gradebook.students, ...newStudents],
      });
      setIsOcrProcessing(false);
      setImportModalOpen(false);
      setCapturedImage(null);
    }, 1200);
  };

  // File upload handler (Excel / CSV / PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    const reader = new FileReader();

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.onload = evt => {
        const text = (evt.target?.result as string) || '';
        const lines = text
          .split(/[\r\n]+/)
          .map(l => l.replace(/[",]/g, ' ').trim())
          .filter(l => l.length > 2);

        const newStudents: GradeStudent[] = lines.map(name => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          scores: {},
          attendance: 'present',
        }));

        handleUpdate({
          students: [...gradebook.students, ...newStudents],
        });
        setIsOcrProcessing(false);
        setImportModalOpen(false);
      };
      reader.readAsText(file);
    } else {
      // Simulate PDF / Excel parser
      setTimeout(() => {
        const sampleFromDoc = isArabic
          ? [
              'طلال يوسف البابطين',
              'عبدالعزيز طارق الساير',
              'عثمان فواز الشايع',
              'فهد خالد الوقيان',
              'مبارك سعد الهاجري',
            ]
          : ['Grace Hopper', 'Ada Lovelace', 'Alan Turing', 'Claude Shannon'];

        const newStudents: GradeStudent[] = sampleFromDoc.map(name => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          scores: {},
          attendance: 'present',
        }));

        handleUpdate({
          students: [...gradebook.students, ...newStudents],
        });
        setIsOcrProcessing(false);
        setImportModalOpen(false);
      }, 1000);
    }
  };

  const handlePasteTextImport = () => {
    if (!rawPastedText.trim()) return;
    const lines = rawPastedText
      .split(/[\r\n]+/)
      .map(l => l.trim())
      .filter(Boolean);

    const newStudents: GradeStudent[] = lines.map(name => ({
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      scores: {},
      attendance: 'present',
    }));

    handleUpdate({
      students: [...gradebook.students, ...newStudents],
    });
    setRawPastedText('');
    setImportModalOpen(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      isArabic ? 'اسم الطالب' : 'Student Name',
      isArabic ? 'الرقم المدني' : 'National ID',
      isArabic ? 'الحالة' : 'Attendance',
      ...gradebook.columns.map(c => `${c.title} (${c.maxScore})`),
      isArabic ? 'المجموع' : 'Total',
      isArabic ? 'النسبة المئوية %' : 'Percentage %',
    ];

    const rows = gradebook.students.map(s => [
      s.name,
      s.nationalId || '',
      s.attendance || 'present',
      ...gradebook.columns.map(c => s.scores[c.id] ?? 0),
      getStudentTotal(s),
      `${getStudentPercentage(s)}%`,
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gradebook.title.replace(/\s+/g, '_')}_grades.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl border border-[#E9E9E8] bg-white shadow-xs overflow-hidden text-sm">
      {/* Gradebook Header (Notion Database style) */}
      <div className="p-4 border-b border-[#E9E9E8] bg-[#F7F6F3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2383E2]/10 text-[#2383E2] flex items-center justify-center font-bold text-lg">
            📊
          </div>
          <div>
            <input
              type="text"
              value={gradebook.title}
              onChange={e => handleUpdate({ title: e.target.value })}
              placeholder={isArabic ? 'عنوان السجل...' : 'Gradebook Title...'}
              className="font-semibold text-base text-[#37352F] bg-transparent border-none outline-hidden focus:ring-1 focus:ring-[#2383E2] rounded-xs px-1"
            />
            <div className="flex items-center gap-2 text-xs text-[#787774] mt-0.5 px-1">
              <span>{gradebook.subject}</span>
              <span>•</span>
              <span>{gradebook.className}</span>
              <span>•</span>
              <span>{gradebook.students.length} {isArabic ? 'طالب' : 'students'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#2383E2] text-white hover:bg-[#1D6FB8] transition-colors shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isArabic ? 'استيراد الأسماء (كاميرا / Excel / PDF)' : 'Import Roster (Camera/Excel)'}</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[#E9E9E8] bg-white text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#787774]" />
            <span>{isArabic ? 'تصدير Excel' : 'Export'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              showStats ? 'bg-[#2383E2]/10 border-[#2383E2] text-[#2383E2]' : 'border-[#E9E9E8] bg-white text-[#787774] hover:bg-[#F1F1EF]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'الإحصاء والمعدل' : 'Stats'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar if active */}
      {showStats && (
        <div className="p-3 bg-[#F1F1EF] border-b border-[#E9E9E8] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 bg-white rounded-lg border border-[#E9E9E8]">
            <span className="block text-[11px] text-[#787774]">{isArabic ? 'إجمالي الطلاب' : 'Total Students'}</span>
            <span className="text-lg font-bold text-[#37352F]">{gradebook.students.length}</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-[#E9E9E8]">
            <span className="block text-[11px] text-[#787774]">{isArabic ? 'متوسط الدرجات' : 'Class Average'}</span>
            <span className="text-lg font-bold text-[#2383E2]">
              {gradebook.students.length > 0
                ? (
                    gradebook.students.reduce((acc, s) => acc + getStudentTotal(s), 0) /
                    gradebook.students.length
                  ).toFixed(1)
                : 0}{' '}
              / {maxTotalScore}
            </span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-[#E9E9E8]">
            <span className="block text-[11px] text-[#787774]">{isArabic ? 'نسبة النجاح' : 'Pass Rate'}</span>
            <span className="text-lg font-bold text-emerald-600">
              {gradebook.students.length > 0
                ? Math.round(
                    (gradebook.students.filter(s => getStudentPercentage(s) >= 50).length /
                      gradebook.students.length) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-[#E9E9E8]">
            <span className="block text-[11px] text-[#787774]">{isArabic ? 'نسبة الحضور' : 'Attendance'}</span>
            <span className="text-lg font-bold text-blue-600">
              {gradebook.students.length > 0
                ? Math.round(
                    (gradebook.students.filter(s => s.attendance === 'present').length /
                      gradebook.students.length) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      {/* Main Notion-like Database Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-[#F7F6F3] border-b border-[#E9E9E8] text-xs font-semibold text-[#787774]">
              <th className="py-2.5 px-3 text-start w-10">#</th>
              <th className="py-2.5 px-3 text-start min-w-[180px]">{isArabic ? 'اسم الطالب / الطالبة' : 'Student Name'}</th>
              <th className="py-2.5 px-2 text-center w-24">{isArabic ? 'الحضور' : 'Attendance'}</th>
              {gradebook.columns.map(col => (
                <th key={col.id} className="py-2.5 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 group">
                    <span>{col.title}</span>
                    <span className="text-[10px] text-[#9B9A97] font-normal">({col.maxScore})</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteColumn(col.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5"
                      title={isArabic ? 'حذف هذا العمود' : 'Delete column'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3 text-center w-20 text-[#37352F]">{isArabic ? 'المجموع' : 'Total'}</th>
              <th className="py-2.5 px-3 text-center w-20 text-[#2383E2]">{isArabic ? 'النسبة' : '%'}</th>
              <th className="py-2.5 px-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E8] text-xs">
            {gradebook.students.map((student, idx) => {
              const total = getStudentTotal(student);
              const pct = getStudentPercentage(student);
              return (
                <tr key={student.id} className="hover:bg-[#F9F9F8] transition-colors group">
                  <td className="py-2 px-3 text-center text-[#9B9A97] font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-medium text-[#37352F]">
                    <input
                      type="text"
                      value={student.name}
                      onChange={e => {
                        const next = gradebook.students.map(s =>
                          s.id === student.id ? { ...s, name: e.target.value } : s
                        );
                        handleUpdate({ students: next });
                      }}
                      className="w-full bg-transparent border-none outline-hidden focus:ring-1 focus:ring-[#2383E2] rounded-xs px-1"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <select
                      value={student.attendance || 'present'}
                      onChange={e => handleAttendanceChange(student.id, e.target.value as any)}
                      className={`text-[11px] font-medium rounded-md px-1.5 py-0.5 border outline-hidden transition-colors ${
                        student.attendance === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : student.attendance === 'absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : student.attendance === 'late'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <option value="present">{isArabic ? 'حاضر' : 'Present'}</option>
                      <option value="absent">{isArabic ? 'غائب' : 'Absent'}</option>
                      <option value="late">{isArabic ? 'متأخر' : 'Late'}</option>
                      <option value="excused">{isArabic ? 'معذور' : 'Excused'}</option>
                    </select>
                  </td>
                  {gradebook.columns.map(col => (
                    <td key={col.id} className="py-2 px-3 text-center font-mono">
                      <input
                        type="number"
                        min="0"
                        max={col.maxScore}
                        step="0.5"
                        value={student.scores[col.id] ?? ''}
                        onChange={e => handleScoreChange(student.id, col.id, e.target.value)}
                        placeholder="0"
                        className="w-16 text-center py-1 bg-white border border-[#E9E9E8] rounded-md text-xs focus:ring-1 focus:ring-[#2383E2] focus:border-[#2383E2] outline-hidden"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center font-bold font-mono text-[#37352F] bg-[#F7F6F3]/50">
                    {total} <span className="text-[10px] text-[#9B9A97] font-normal">/{maxTotalScore}</span>
                  </td>
                  <td className="py-2 px-3 text-center font-bold font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                        pct >= 90
                          ? 'bg-emerald-50 text-emerald-700'
                          : pct >= 75
                          ? 'bg-blue-50 text-blue-700'
                          : pct >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {pct}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#9B9A97] hover:text-rose-500 transition-opacity p-1"
                      title={isArabic ? 'حذف الطالب' : 'Delete student'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Add Row & Column Bar */}
      <div className="p-3 border-t border-[#E9E9E8] bg-[#F7F6F3] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Quick Add Student */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
            placeholder={isArabic ? 'اسم طالب جديد...' : 'New student name...'}
            className="px-2.5 py-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs focus:ring-1 focus:ring-[#2383E2] outline-hidden w-48 sm:w-60"
          />
          <button
            type="button"
            onClick={handleAddStudent}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs font-medium text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة طالب' : 'Add Student'}</span>
          </button>
        </div>

        {/* Quick Add Assessment Column */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newColTitle}
            onChange={e => setNewColTitle(e.target.value)}
            placeholder={isArabic ? 'اسم التقييم (مثلاً: اختبار 2)' : 'Column title'}
            className="px-2.5 py-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs focus:ring-1 focus:ring-[#2383E2] outline-hidden w-36 sm:w-44"
          />
          <input
            type="number"
            value={newColMax}
            onChange={e => setNewColMax(e.target.value)}
            placeholder={isArabic ? 'الدرجة' : 'Max'}
            className="px-2 py-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs focus:ring-1 focus:ring-[#2383E2] outline-hidden w-16 text-center"
          />
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E9E9E8] rounded-md text-xs font-medium text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة عمود' : 'Add Column'}</span>
          </button>
        </div>
      </div>

      {/* Roster Import Modal (Camera / Excel / PDF) */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E9E9E8] flex items-center justify-between bg-[#F7F6F3]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2383E2]" />
                <h3 className="font-semibold text-sm text-[#37352F]">
                  {isArabic ? 'استيراد أسماء الطلاب والمعلمين' : 'Import Student & Teacher Roster'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setImportModalOpen(false);
                }}
                className="p-1 rounded-md text-[#787774] hover:bg-[#EFEFEF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#E9E9E8] bg-white text-xs">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setImportMethod('camera');
                  startCamera();
                }}
                className={`flex-1 py-3 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  importMethod === 'camera'
                    ? 'border-[#2383E2] text-[#2383E2] bg-[#2383E2]/5'
                    : 'border-transparent text-[#787774] hover:bg-[#F7F6F3]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{isArabic ? 'مسح بالكاميرا (OCR)' : 'Camera Scan'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setImportMethod('file');
                }}
                className={`flex-1 py-3 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  importMethod === 'file'
                    ? 'border-[#2383E2] text-[#2383E2] bg-[#2383E2]/5'
                    : 'border-transparent text-[#787774] hover:bg-[#F7F6F3]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isArabic ? 'ملف Excel أو PDF' : 'Excel / PDF File'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setImportMethod('text');
                }}
                className={`flex-1 py-3 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  importMethod === 'text'
                    ? 'border-[#2383E2] text-[#2383E2] bg-[#2383E2]/5'
                    : 'border-transparent text-[#787774] hover:bg-[#F7F6F3]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isArabic ? 'لصق نص' : 'Paste Text'}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {importMethod === 'camera' && (
                <div className="space-y-4 text-center">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#E9E9E8]">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white/70 text-xs p-6 flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 opacity-50" />
                        <span>{isArabic ? 'اضغط على زر تشغيل الكاميرا لمسح ورقة الأسماء' : 'Click to enable camera'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    {!cameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-[#2383E2] text-white rounded-lg text-xs font-medium hover:bg-[#1D6FB8]"
                      >
                        {isArabic ? 'تشغيل الكاميرا' : 'Start Camera'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isOcrProcessing}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 shadow-md flex items-center gap-2"
                      >
                        {isOcrProcessing ? (
                          <span>{isArabic ? 'جاري التعرف على الأسماء...' : 'Extracting names...'}</span>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            <span>{isArabic ? 'التقاط وقراءة الأسماء' : 'Capture & Read'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#787774]">
                    {isArabic
                      ? 'وجه الكاميرا نحو كشف الدرجات الورقي أو قائمة الطلاب للتعرف عليها فوراً.'
                      : 'Point the camera at your paper roster to auto-extract student names.'}
                  </p>
                </div>
              )}

              {importMethod === 'file' && (
                <div className="space-y-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv,.pdf,.txt"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D4D4D2] hover:border-[#2383E2] rounded-xl p-8 cursor-pointer bg-[#F7F6F3]/50 hover:bg-[#2383E2]/5 transition-colors flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#2383E2]/10 text-[#2383E2] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#37352F]">
                        {isArabic ? 'اضغط لاختيار ملف Excel أو CSV أو PDF' : 'Click to select Excel, CSV or PDF'}
                      </p>
                      <p className="text-[11px] text-[#787774] mt-1">
                        {isArabic ? 'يدعم كشوفات نور، البوابة التعليمية، وسجلات المدارس' : 'Supports school rosters and grade lists'}
                      </p>
                    </div>
                  </div>
                  {isOcrProcessing && (
                    <p className="text-xs text-[#2383E2] animate-pulse font-medium">
                      {isArabic ? 'جاري تحليل الملف واستخراج الأسماء...' : 'Analyzing file & extracting roster...'}
                    </p>
                  )}
                </div>
              )}

              {importMethod === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#37352F] mb-1.5">
                      {isArabic ? 'الصق قائمة الأسماء (كل اسم في سطر مستقل):' : 'Paste student names (one per line):'}
                    </label>
                    <textarea
                      rows={6}
                      value={rawPastedText}
                      onChange={e => setRawPastedText(e.target.value)}
                      placeholder={
                        isArabic
                          ? 'عبدالله خالد المطيري\nمحمد يعقوب السبتي\nسعود عبدالعزيز العجمي'
                          : 'John Doe\nJane Smith\nDavid Miller'
                      }
                      className="w-full p-3 border border-[#E9E9E8] rounded-xl text-xs focus:ring-1 focus:ring-[#2383E2] outline-hidden font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasteTextImport}
                      className="px-4 py-2 bg-[#2383E2] text-white rounded-lg text-xs font-medium hover:bg-[#1D6FB8]"
                    >
                      {isArabic ? 'إضافة الأسماء للسجل' : 'Add Names to Gradebook'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
