import { Block } from '../types';

export interface TemplateItem {
  id: string;
  category: 'education' | 'quran' | 'exam' | 'management' | 'general';
  titleAr: string;
  titleEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
  tags: string[];
  coverUrl?: string;
  blocks: Block[];
}

export const TEMPLATES: TemplateItem[] = [
  // 1. Electronic Gradebook & Attendance for Teachers & Department Heads
  {
    id: 'gradebook-template',
    category: 'education',
    titleAr: 'سجل الدرجات والمتابعة الإلكتروني (للمعلمين)',
    titleEn: 'Teacher Gradebook & Attendance Register',
    icon: '📊',
    descriptionAr: 'سجل إلكتروني شامل لرصد درجات الطلاب، المشاركة، الحضور والغياب، مع استيراد الأسماء من الكاميرا أو Excel أو PDF',
    descriptionEn: 'Full digital gradebook with attendance, exams, assignments, and OCR/Excel roster import.',
    tags: ['درجات', 'تعليم', 'سجل_الكتروني', 'معلم'],
    coverUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'gb-b1',
        type: 'callout',
        content: 'سجل درجات ومتابعة الطلاب للفصل الدراسي الحالي. يمكنك استيراد الأسماء مباشرة من كاميرا الهاتف أو ملف Excel أو PDF وحساب المعدلات تلقائياً.',
        calloutType: 'teacher',
        calloutTitle: 'دليل المعلم ورئيس القسم',
      },
      {
        id: 'gb-b2',
        type: 'gradebook',
        content: 'سجل درجات الفصل',
        gradebookData: {
          title: 'سجل درجات مادة الرياضيات والعلوم',
          subject: 'الرياضيات المتقدمة',
          className: 'الصف العاشر / 1',
          semester: 'الفصل الدراسي الأول',
          columns: [
            { id: 'c1', title: 'المشاركة والأنشطة', maxScore: 10, weight: 1 },
            { id: 'c2', title: 'الواجبات والمشاريع', maxScore: 10, weight: 1 },
            { id: 'c3', title: 'التقويم الأول', maxScore: 15, weight: 1 },
            { id: 'c4', title: 'التقويم الثاني', maxScore: 15, weight: 1 },
            { id: 'c5', title: 'الاختبار العملي / الشفوي', maxScore: 10, weight: 1 },
            { id: 'c6', title: 'اختبار نهاية الفترة', maxScore: 40, weight: 1 },
          ],
          students: [
            {
              id: 'st-1',
              name: 'عبدالله خالد المطيري',
              nationalId: '304010203041',
              attendance: 'present',
              scores: { c1: 10, c2: 9.5, c3: 14, c4: 15, c5: 10, c6: 38 },
              notes: 'ممتاز ومتفاعل في الحصة',
            },
            {
              id: 'st-2',
              name: 'محمد يعقوب السبتي',
              nationalId: '304050607082',
              attendance: 'present',
              scores: { c1: 9, c2: 10, c3: 15, c4: 14, c5: 9.5, c6: 39 },
              notes: 'إنجاز ممتاز للمشروع العلمي',
            },
            {
              id: 'st-3',
              name: 'سعود عبدالعزيز العجمي',
              nationalId: '304090102033',
              attendance: 'late',
              scores: { c1: 8.5, c2: 9, c3: 13, c4: 12.5, c5: 8.5, c6: 35 },
              notes: 'يحتاج تعزيز في الواجبات البيتية',
            },
            {
              id: 'st-4',
              name: 'يوسف أحمد الكندري',
              nationalId: '304111213144',
              attendance: 'present',
              scores: { c1: 10, c2: 10, c3: 15, c4: 15, c5: 10, c6: 40 },
              notes: 'الدرجة الكاملة - تفوق واضح',
            },
            {
              id: 'st-5',
              name: 'فهد ناصر الشمري',
              nationalId: '304121314155',
              attendance: 'excused',
              scores: { c1: 8, c2: 8.5, c3: 12, c4: 13, c5: 9, c6: 34 },
              notes: 'إجازة مرضية في التقويم الأول',
            },
          ],
        },
      },
      {
        id: 'gb-b3',
        type: 'h2',
        content: 'ملاحظات وتوجيهات رئيس القسم والإدارة المدرسية',
      },
      {
        id: 'gb-b4',
        type: 'bullet-list',
        content: 'تم اعتماد خطة التقويم المستمر ومواءمتها مع أهداف المنهج الوزاري.',
      },
      {
        id: 'gb-b5',
        type: 'bullet-list',
        content: 'تنفيذ برنامج علاجي للطلاب المتعثرين في مهارات الجبر والهندسة التحليلية.',
      },
      {
        id: 'gb-b6',
        type: 'checkbox',
        content: 'مراجعة رصد درجات أعمال السنة مع المعلم الأول ورئيس القسم',
        checked: true,
      },
      {
        id: 'gb-b7',
        type: 'checkbox',
        content: 'تصدير تقرير الإحصاء والمعدل الفصلي إلى PDF وإرساله للإدارة',
        checked: false,
      },
    ],
  },

  // 2. Department Head & Supervisor Observation Log (سجل رئيس القسم والتوجيه الفني)
  {
    id: 'teacher-evaluation-log',
    category: 'management',
    titleAr: 'سجل زيارات ومتابعة المعلمين (رؤساء الأقسام)',
    titleEn: 'HOD Teacher Observation & Evaluation Log',
    icon: '📋',
    descriptionAr: 'استمارة زيارة إشرافية إلكترونية لرؤساء الأقسام والموجهين الفنيين لتقييم الحصص الدراسية ومتابعة خطط المعلمين',
    descriptionEn: 'Supervisory observation log for Heads of Departments with pedagogical scoring and recommendations.',
    tags: ['رئيس_قسم', 'توجيه', 'تقييم_معلمين', 'زيارات'],
    coverUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'hod-1',
        type: 'callout',
        content: 'بطاقة تقييم الحصة الدراسية وتوثيق الأداء التعليمي وفق معايير الجودة والتميز المؤسسي.',
        calloutType: 'teacher',
        calloutTitle: 'سجل التوجيه الفني والإشراف التربوي',
      },
      {
        id: 'hod-2',
        type: 'teacher-log',
        content: 'استمارة التقييم الصفي',
        teacherLogData: {
          date: '2026-03-15',
          teacherName: 'أ. جاسم محمد المنصور',
          department: 'قسم الرياضيات والعلوم',
          subject: 'الرياضيات',
          topic: 'تطبيقات التفاضل والتكامل في الحياة العملية',
          period: 3,
          classroom: 'الصف الحادي عشر - علمي 2',
          observations: 'استخدام رائع لاستراتيجيات التعلم النشط وتطبيق المحاكاة التفاعلية، مع توفير بيئة تعليمية محفزة للطلاب.',
          evaluations: {
            preparation: 5,
            engagement: 5,
            timeManagement: 4,
            classroomControl: 5,
          },
          recommendations: 'الاستمرار في تعزيز مهارات التفكير العليا وربط الأمثلة الهندسية بالواقع الصناعي في دولة الكويت.',
          hodSignature: 'رئيس القسم: د. حسن السبتي',
        },
      },
      {
        id: 'hod-3',
        type: 'h2',
        content: 'الخطة الإجرائية والتوصيات اللاحقة',
      },
      {
        id: 'hod-4',
        type: 'checkbox',
        content: 'تنفيذ درس ريادي (Model Lesson) على مستوى المنطقة التعليمية',
        checked: false,
      },
      {
        id: 'hod-5',
        type: 'checkbox',
        content: 'مشاركة أدوات التقييم والأنشطة الرقمية مع باقي أعضاء القسم',
        checked: true,
      },
    ],
  },

  // 3. Interactive Exam with Auto-Grading & Instant Solutions (اختبار تفاعلي قابل للحل)
  {
    id: 'interactive-exam-template',
    category: 'exam',
    titleAr: 'اختبار إلكتروني تفاعلي (قابل للحل والتصحيح)',
    titleEn: 'Interactive Quiz & Test (Solvable)',
    icon: '📝',
    descriptionAr: 'نموذج اختبار تفاعلي للطلاب مع خيارات متعددة، صح/خطأ، وأسئلة مقالية مع التصحيح الفوري وإظهار النتيجة',
    descriptionEn: 'Fully interactive exam with instant auto-grading, explanations, and timer.',
    tags: ['اختبار', 'امتحان', 'حل_اسئلة', 'تقييم'],
    coverUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'ex-1',
        type: 'callout',
        content: 'اختبار تجريبي في مهارات التفكير العلمي والعلوم الطبيعية. يمكنك الإجابة على الأسئلة مباشرة والضغط على "تسليم الاختبار" لتصحيح إجاباتك فوراً ومعرفة نتيجتك!',
        calloutType: 'exam',
        calloutTitle: 'اختبار تقويمي إلكتروني',
      },
      {
        id: 'ex-2',
        type: 'exam',
        content: 'اختبار تقويم المهارات العلمية',
        examData: {
          title: 'اختبار العلوم العامة وتاريخ الاكتشافات',
          description: 'أجب عن جميع الأسئلة بدقة. مدة الاختبار المقترحة: 15 دقيقة.',
          timeLimitMinutes: 15,
          totalPoints: 20,
          questions: [
            {
              id: 'q-1',
              question: 'من هو العالم المسلم الملقب بـ "مؤسس علم البصريات الحديث" ومؤلف "كتاب المناظر"؟',
              type: 'multiple-choice',
              options: ['ابن سينا', 'الحسن بن الهيثم', 'جابر بن حيان', 'أبو بكر الرازي'],
              correctAnswer: 1, // الحسن بن الهيثم
              points: 5,
              explanation: 'الحسن بن الهيثم هو من أسس علم البصريات الفيزيائي وأثبت أن الضوء يسافر من الأجسام إلى العين.',
            },
            {
              id: 'q-2',
              question: 'تنتقل الموجات الصوتية في الفراغ بشكل أسرع من انتقالها في الهواء والماء.',
              type: 'true-false',
              options: ['صواب', 'خطأ'],
              correctAnswer: 'false',
              points: 5,
              explanation: 'خطأ: الصوت موجة ميكانيكية تحتاج إلى وسط مادي لكي تنتقل ولا تنتقل في الفراغ مطلقاً.',
            },
            {
              id: 'q-3',
              question: 'ما هي الوحدة الدولية الأساسية لقياس شدة التيار الكهربائي؟',
              type: 'multiple-choice',
              options: ['الفولت (Volt)', 'الأوم (Ohm)', 'الأمبير (Ampere)', 'الواط (Watt)'],
              correctAnswer: 2, // الأمبير
              points: 5,
              explanation: 'الأمبير (Ampere) هو وحدة النظام الدولي لقياس شدة التيار الكهربائي.',
            },
            {
              id: 'q-4',
              question: 'اذكر باختصار القانون الأول للحركة لنيوتن (قانون القصور الذاتي).',
              type: 'short-answer',
              correctAnswer: 'الجسم الساكن يبقى ساكنا والجسم المتحرك يبقى متحركا ما لم تؤثر عليه قوة خارجية',
              points: 5,
              explanation: 'يبقى الجسم في حالته من سكون أو حركة منتظمة في خط مستقيم ما لم تؤثر عليه قوة محصلة تغير من حالته.',
            },
          ],
        },
      },
    ],
  },

  // 4. Quranic Study & Tafsir with Uthmani Script (نموذج قرآني وتفسير)
  {
    id: 'quran-study-template',
    category: 'quran',
    titleAr: 'مقتبس قرآني مع الرسم العثماني والتفسير',
    titleEn: 'Quranic Verse & Tafsir Study',
    icon: '📖',
    descriptionAr: 'كتلة نصية قرآنية بالرسم العثماني المصحفي مع التفسير الميسر، أسباب النزول، والفوائد اللغوية',
    descriptionEn: 'Holy Quran verse with classical Uthmani calligraphy, authentic Tafsir, and linguistic benefits.',
    tags: ['قرآن', 'تفسير', 'رسم_عثماني', 'آيات'],
    coverUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'qr-1',
        type: 'quran',
        content: 'سورة العلق - الآيات 1-5',
        quranData: {
          surahNumber: 96,
          surahNameAr: 'سورة العَلَق',
          surahNameEn: 'Surah Al-Alaq',
          verseNumber: 1,
          textUthmani: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴿١﴾ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ﴿٢﴾ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ﴿٣﴾ الَّذِي عَلَّمَ بِالْقَلَمِ ﴿٤﴾ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ ﴿٥﴾',
          tafsir: 'هذه الآيات الكريمة هي أول ما نزل من القرآن العظيم على النبي ﷺ بغار حراء، وفيها التنويه بفضل القراءة والعلم والتدوين بالقلم الذي به تُحفظ العلوم وتُورث المعارف بين الأمم.',
          notes: 'أول أمر إلهي نزل هو أمر بالقراءة (اقرأ)، والربط بين شرف الخلق وشرف العلم والكتابة بالقلم.',
        },
      },
      {
        id: 'qr-2',
        type: 'h2',
        content: 'اللطائف البيانية والفوائد التربوية',
      },
      {
        id: 'qr-3',
        type: 'bullet-list',
        content: 'الافتتاح باسم الله تبارك وتعالى المستحق للحمد والتعظيم.',
      },
      {
        id: 'qr-4',
        type: 'bullet-list',
        content: 'إبراز نعمة القلم كأعظم وسيلة من وسائل نشر العلم والحضارة الإنسانية.',
      },
      {
        id: 'qr-5',
        type: 'quote',
        content: '"قيدوا العلم بالكتابة" — من الآثار المأثورة عن السلف الصالح في توثيق المعرفة.',
      },
    ],
  },

  // 5. Quran Memorization & Hifz Tracker (سجل حفظ وتسميع القرآن الكريم)
  {
    id: 'quran-hifz-tracker',
    category: 'quran',
    titleAr: 'سجل حفظ ومراجعة القرآن الكريم (حلقات التحفيظ)',
    titleEn: 'Quran Memorization (Hifz) Log',
    icon: '🕌',
    descriptionAr: 'جدول متقدم لمتابعة ورد التسميع والمراجعة اليومية لحلقات التحفيظ والمعلمين مع علامات الإتقان',
    descriptionEn: 'Daily Quran memorization and revision tracker with Tajweed grading.',
    tags: ['قرآن', 'حفظ', 'تسميع', 'حلقات'],
    coverUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'hifz-1',
        type: 'callout',
        content: 'جدول متابعة الحفظ الجديد والمراجعة الصغرى والكبرى لحلقة الشيخ عبدالرحمن السميط.',
        calloutType: 'quran',
        calloutTitle: 'سجل حلقة القرآن الكريم',
      },
      {
        id: 'hifz-2',
        type: 'table',
        content: 'جدول التسميع',
        tableData: {
          headers: ['اسم الطالب', 'السورة / الآيات', 'الحفظ الجديد', 'المراجعة', 'التقييم', 'ملاحظات التجويد'],
          rows: [
            ['عمر أحمد الفاروق', 'سورة مريم (1 - 35)', 'متقن (10/10)', 'سورة الكهف', 'ممتاز', 'مراعاة أحكام المد المتصل'],
            ['خالد بن الوليد', 'سورة طه (1 - 50)', 'جيد جداً (9/10)', 'سورة مريم', 'جيد جداً', 'تثبيت الغنن عند الإخفاء'],
            ['سعد بن أبي وقاص', 'سورة الأنبياء كاملة', 'متقن (10/10)', 'سورة طه', 'ممتاز', 'أداء متميز في الترتيل'],
            ['علي بن أبي طالب', 'سورة الحج (1 - 40)', 'متقن (10/10)', 'سورة الأنبياء', 'ممتاز', 'مخارج الحروف دقيقة جداً'],
          ],
        },
      },
    ],
  },

  // 6. Teacher Weekly Lesson Planner (خطة الدرس الأسبوعية للمعلم)
  {
    id: 'lesson-plan-template',
    category: 'education',
    titleAr: 'خطة التحضير والتدريس الأسبوعية (المعلم المبدع)',
    titleEn: 'Weekly Lesson Plan & Objectives',
    icon: '📚',
    descriptionAr: 'قالب إعداد الدروس النموذجية مع الأهداف السلوكية، الاستراتيجيات، والوسائل التعليمية التفاعلية',
    descriptionEn: 'Pedagogical weekly preparation form with SMART objectives and active learning strategies.',
    tags: ['تحضير', 'درس', 'خطة_اسبوعية', 'تدريس'],
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'lp-1',
        type: 'h1',
        content: 'خطة الدرس النموذجي: استكشاف الفضاء والجاذبية',
      },
      {
        id: 'lp-2',
        type: 'callout',
        content: 'المادة: العلوم والفيزياء العامة | الصف: التاسع المتوسط | الأسبوع: الرابع',
        calloutType: 'teacher',
        calloutTitle: 'بيانات الدرس',
      },
      {
        id: 'lp-3',
        type: 'h2',
        content: 'الأهداف التعليمية والسلوكية (SMART)',
      },
      {
        id: 'lp-4',
        type: 'checkbox',
        content: 'أن يوضح الطالب مفهوم قوة الجاذبية الأرضية بدقة علمية',
        checked: true,
      },
      {
        id: 'lp-5',
        type: 'checkbox',
        content: 'أن يحسب الطالب تسارع الأجسام الساقطة سقوطاً حراً باستخدام المعادلة الرياضية',
        checked: false,
      },
      {
        id: 'lp-6',
        type: 'checkbox',
        content: 'أن يستنتج الطالب الفرق بين الكتلة والوزن عبر تجربة المحاكاة التفاعلية',
        checked: false,
      },
      {
        id: 'lp-7',
        type: 'h2',
        content: 'الوسائل والتقنيات التعليمية المستخدمة',
      },
      {
        id: 'lp-8',
        type: 'bullet-list',
        content: 'السبورة التفاعلية وعرض تقديمي ثلاثي الأبعاد.',
      },
      {
        id: 'lp-9',
        type: 'bullet-list',
        content: 'تسجيل صوتي وشرح مسموع من دفتر للملاحظات الصفية.',
      },
      {
        id: 'lp-10',
        type: 'bullet-list',
        content: 'تطبيق تجربة عملية لقياس زمن سقوط كرات بأحجام مختلفة.',
      },
    ],
  },

  // 7. Human Life Essentials: Personal Habit & Daily Routine Tracker (عادات وروتين الحياة اليومية)
  {
    id: 'daily-life-essentials',
    category: 'general',
    titleAr: 'منظم الحياة اليومية والعادات الأساسية (أشياء يحتاجها الإنسان)',
    titleEn: 'Human Daily Life Essentials & Habit Tracker',
    icon: '🌱',
    descriptionAr: 'منظّم شامل للحياة المتوازنة: الصحة، الصلاة، الرياضة، الأوراد اليومية، وإدارة المصاريف والمهام',
    descriptionEn: 'Holistic daily life planner covering spiritual routine, health, reading, and productivity.',
    tags: ['حياة', 'عادات', 'صحة', 'تنظيم', 'يومي'],
    coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'life-1',
        type: 'callout',
        content: '"خير الأعمال أدومها وإن قل" — روتينك اليومي لبناء حياة واعية ومتوازنة بين العبادة والصحة والإنجاز.',
        calloutType: 'note',
        calloutTitle: 'بوصلة الحياة اليومية',
      },
      {
        id: 'life-2',
        type: 'h2',
        content: '🌿 الجانب الإيماني والروحي',
      },
      {
        id: 'life-3',
        type: 'checkbox',
        content: 'أداء الصلوات الخمس في أوقاتها مع السنن الرواتب',
        checked: true,
      },
      {
        id: 'life-4',
        type: 'checkbox',
        content: 'أذكار الصباح والمساء والورد القرآني اليومي (جزء أو نصف جزء)',
        checked: true,
      },
      {
        id: 'life-5',
        type: 'checkbox',
        content: 'جلسة تدبر وتفكر هادئة لمدة 10 دقائق',
        checked: false,
      },
      {
        id: 'life-6',
        type: 'h2',
        content: '💪 الصحة الجسدية والنشاط',
      },
      {
        id: 'life-7',
        type: 'checkbox',
        content: 'شرب 2 إلى 3 لترات من الماء النقي على مدار اليوم',
        checked: true,
      },
      {
        id: 'life-8',
        type: 'checkbox',
        content: 'ممارسة رياضة المشي أو التمرين (30 دقيقة على الأقل)',
        checked: false,
      },
      {
        id: 'life-9',
        type: 'checkbox',
        content: 'النوم المبكر (7-8 ساعات نوم مريح)',
        checked: false,
      },
      {
        id: 'life-10',
        type: 'h2',
        content: '🧠 التغذية العقلية والتعلم المستمر',
      },
      {
        id: 'life-11',
        type: 'checkbox',
        content: 'قراءة 20 صفحة من كتاب في الفكر أو التاريخ أو العلوم',
        checked: false,
      },
      {
        id: 'life-12',
        type: 'checkbox',
        content: 'تدوين فائدة أو فكرة جديدة في دفتر',
        checked: true,
      },
    ],
  },

  // 8. Notion-style Project Kanban Board (لوحة متابعة المهام والمشاريع)
  {
    id: 'kanban-project-board',
    category: 'management',
    titleAr: 'لوحة المهام والمشاريع (Kanban Board)',
    titleEn: 'Notion-Style Task & Project Kanban',
    icon: '📌',
    descriptionAr: 'لوحة تفاعلية لإدارة المهام والمشاريع بأسلوب نوشن: قيد الانتظار، جاري العمل، والمكتملة',
    descriptionEn: 'Interactive agile Kanban board with drag-and-drop task workflow.',
    tags: ['كانبان', 'مشاريع', 'مهام', 'انتاجية'],
    coverUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'kb-1',
        type: 'callout',
        content: 'لوحة كانبان الذكية لتنظيم أولويات العمل المدرسي والشخصي ومتابعة سير الإنجاز.',
        calloutType: 'note',
        calloutTitle: 'لوحة كانبان',
      },
      {
        id: 'kb-2',
        type: 'kanban',
        content: 'لوحة المشاريع المدرسية والبحثية',
        kanbanData: {
          columns: [
            {
              id: 'col-todo',
              title: 'قيد الانتظار ⏳',
              cards: [
                { id: 'c-1', title: 'إعداد نماذج الاختبار التجريبي', priority: 'high', dueDate: '2026-03-20', assignee: 'أ. جاسم' },
                { id: 'c-2', title: 'شراء مراجع جديدة لمكتبة القسم', priority: 'low', dueDate: '2026-03-28' },
              ],
            },
            {
              id: 'col-inprogress',
              title: 'جاري التنفيذ 🚀',
              cards: [
                { id: 'c-3', title: 'تصحيح اختبارات التقويم الأول', priority: 'high', dueDate: '2026-03-18', assignee: 'أ. محمد' },
                { id: 'c-4', title: 'استيراد قوائم الطلاب عبر الكاميرا والـ Excel', priority: 'medium', dueDate: '2026-03-17' },
              ],
            },
            {
              id: 'col-done',
              title: 'تم الإنجاز ✅',
              cards: [
                { id: 'c-5', title: 'اعتماد الخطة الفصلية من التوجيه', priority: 'medium', dueDate: '2026-03-10' },
                { id: 'c-6', title: 'توزيع الجداول الدراسية على الفصول', priority: 'high', dueDate: '2026-03-05' },
              ],
            },
          ],
        },
      },
    ],
  },

  // 9. Kuwait MOE Official Standard Lesson Plan (تحضير كويتي نموذجي)
  {
    id: 'kuwait-moe-lesson-plan',
    category: 'education',
    titleAr: 'تحضير درس نموذجي (معايير وزارة التربية بدولة الكويت)',
    titleEn: 'Kuwait MOE Standard Lesson Plan',
    icon: '🇰🇼',
    descriptionAr: 'قالب تحضير رسمي متكامل بالكفايات العامة والخاصة، الأهداف الثلاثية، استراتيجيات التعلم النشط، والتمايز وغرس القيم',
    descriptionEn: 'Kuwait MOE official lesson preparation standard format with competences, active learning, and values.',
    tags: ['تحضير_كويتي', 'وزارة_التربية', 'كفايات', 'معايير', 'تعليم_نشط'],
    coverUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'kw-lp-1',
        type: 'callout',
        content: 'بطاقة تخطيط الدرس اليومي وفق نظام الكفايات والتعلم النشط المعتمد من التوجيه الفني العام بوزارة التربية بدولة الكويت.',
        calloutType: 'teacher',
        calloutTitle: 'دليل التوجيه الفني - وزارة التربية الكويت',
      },
      {
        id: 'kw-lp-2',
        type: 'h1',
        content: 'بطاقة تخطيط الدرس اليومي (المعايير والكفايات)',
      },
      {
        id: 'kw-lp-3',
        type: 'table',
        content: 'بيانات الدرس',
        tableData: {
          headers: ['المادة / القسم', 'الصف والفصل', 'الوحدة الدراسية', 'عنوان الدرس', 'التاريخ والحصة'],
          rows: [
            ['الفيزياء / العلوم', 'الصف العاشر / 2', 'الميكانيكا والحركة', 'قوانين نيوتن والتسارع', '2026/03/15 - الحصة 2'],
          ],
        },
      },
      {
        id: 'kw-lp-4',
        type: 'h2',
        content: '1. الكفايات والمعايير المستهدفة لوزارة التربية',
      },
      {
        id: 'kw-lp-5',
        type: 'bullet-list',
        content: 'الكفاية العامة: توظيف المفاهيم والقوانين الفيزيائية في تفسير الظواهر الطبيعية والمشكلات اليومية.',
      },
      {
        id: 'kw-lp-6',
        type: 'bullet-list',
        content: 'المعيار الخاص (2-1): يستنتج العلاقة الرياضية بين القوة والكتلة والتسارع ويجري تجارب لإثباتها.',
      },
      {
        id: 'kw-lp-7',
        type: 'h2',
        content: '2. الأهداف السلوكية الإجرائية',
      },
      {
        id: 'kw-lp-8',
        type: 'checkbox',
        content: 'الهدف المعرفي: يذكر نص قانون نيوتن الثاني رياضياً ولفظياً بدقة (F = m * a).',
        checked: true,
      },
      {
        id: 'kw-lp-9',
        type: 'checkbox',
        content: 'الهدف الوجداني: يستشعر أهمية الالتزام بالسرعة المقررة وحزام الأمان في دولة الكويت.',
        checked: true,
      },
      {
        id: 'kw-lp-10',
        type: 'checkbox',
        content: 'الهدف المهاري: يركّب أجهزة الاستشعار الرقمية والمسار الهوائي لقياس السرعة عملياً.',
        checked: false,
      },
      {
        id: 'kw-lp-11',
        type: 'h2',
        content: '3. استراتيجيات التدريس والتمايز (مراعاة الفروق الفردية)',
      },
      {
        id: 'kw-lp-12',
        type: 'callout',
        content: 'مجموعة الفائقين: حساب التسارع على سطح مائل مع معامل احتكاك.\nمجموعة المتوسطين: تطبيق مباشر على القانون F = m*a.\nمجموعة الدعم: تمثيل بياني بسيط ومسائل إرشادية مدعومة.',
        calloutType: 'note',
        calloutTitle: 'خطة التمايز والأنشطة المتدرجة',
      },
      {
        id: 'kw-lp-13',
        type: 'h2',
        content: '4. غرس القيم التربوية والواجب المنزلي',
      },
      {
        id: 'kw-lp-14',
        type: 'bullet-list',
        content: 'القيمة التربوية الأسبوعية: احترام قوانين المرور وحماية الأرواح والولاء للوطن.',
      },
      {
        id: 'kw-lp-15',
        type: 'bullet-list',
        content: 'الواجب المنزلي: حل تدريبات كراسة التطبيقات ص 42 وتطبيق التفكير الناقد ص 45.',
      },
    ],
  },

  // 10. Kuwait HOD Leadership & Supervisory Register
  {
    id: 'kuwait-hod-register',
    category: 'management',
    titleAr: 'سجل رئيس القسم الشامل (الزيارات الإشرافية والإنماء المهني)',
    titleEn: 'Kuwait Head of Department Leadership Register',
    icon: '📋',
    descriptionAr: 'سجل إلكتروني رسمي لرئيس القسم لمتابعة المعلمين، الزيارات الصفية، ورش العمل، ورعاية الفائقين والمتعثرين',
    descriptionEn: 'Official HOD supervision, teacher evaluations, peer visits, and professional development register.',
    tags: ['رئيس_قسم', 'توجيه_فني', 'زيارات_صفية', 'إنماء_مهني', 'سجل_قيادي'],
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    blocks: [
      {
        id: 'kw-hod-1',
        type: 'callout',
        content: 'سجل رئيس القسم الفني للعام الدراسي 2025/2026 - وزارة التربية بدولة الكويت.',
        calloutType: 'teacher',
        calloutTitle: 'سجل رئيس القسم',
      },
      {
        id: 'kw-hod-2',
        type: 'teacher-log',
        content: 'سجل الزيارات الفنية للمعلمين',
        teacherLogData: {
          date: '2026-03-15',
          teacherName: 'أ. خالد الدوسري',
          department: 'قسم العلوم والفيزياء',
          subject: 'الفيزياء',
          topic: 'قوانين الحركة والتسارع',
          period: 2,
          classroom: '10/2',
          observations: 'تمكن علمي ممتاز وتوظيف رائع لمحاكاة PhET الرقمية واستراتيجية KWL',
          evaluations: {
            preparation: 5,
            engagement: 5,
            timeManagement: 4,
            classroomControl: 5,
          },
          recommendations: 'الاستمرار في تفعيل التعلم النشط وإعطاء وقت أكبر للطلاب لعرض حلولهم',
          hodSignature: 'رئيس القسم: أ. فهد المطيري',
        },
      },
      {
        id: 'kw-hod-3',
        type: 'h2',
        content: 'خطة ورش العمل والدروس الريادية للقسم',
      },
      {
        id: 'kw-hod-4',
        type: 'table',
        content: 'جدول الورش والإنماء المهني',
        tableData: {
          headers: ['الأسبوع', 'موضوع الورشة / الدرس الريادي', 'المعلم المنفذ', 'الهدف والمخرجات'],
          rows: [
            ['الأسبوع 3', 'استراتيجيات التمايز ورعاية المتعثرين', 'أ. خالد الدوسري', 'بنك أوراق عمل متدرجة الصعوبة'],
            ['الأسبوع 6', 'الذكاء الاصطناعي في التعليم الكويتي', 'رئيس القسم', 'تطوير وسائل تفاعلية رقمية'],
            ['الأسبوع 9', 'صياغة الأسئلة وفق جدول المواصفات', 'الموجه الفني', 'بنوك أسئلة معيارية للاختبارات'],
          ],
        },
      },
    ],
  },
];
