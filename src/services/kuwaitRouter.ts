import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const COMMUNITY_FILE = path.join(process.cwd(), 'data', 'kuwait_community.json');
const REGISTERS_FILE = path.join(process.cwd(), 'data', 'kuwait_registers.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Lazy Gemini SDK initializer
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Seed Initial Kuwait Community Shared Templates
function loadCommunityTemplates() {
  if (fs.existsSync(COMMUNITY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(COMMUNITY_FILE, 'utf-8'));
    } catch {}
  }

  const initial = [
    {
      id: 'kw-comm-1',
      title: 'تحضير درس قوانين نيوتن للحركة (فيزياء عاشر) - معايير وزارة التربية',
      department: 'العلوم والفيزياء',
      grade: 'الصف العاشر - علمي',
      teacherName: 'أ. دلال الشمري',
      educationalZone: 'منطقة العاصمة التعليمية',
      school: 'ثانوية اليرموك للبنات',
      likes: 48,
      downloads: 182,
      createdAt: Date.now() - 86400000 * 2,
      description: 'تحضير متكامل بالاستقصاء والتجارب العملية مع أوراق عمل تفاعلية وروابط محاكاة PhET.',
      tags: ['فيزياء', 'الصف_العاشر', 'نيوتن', 'تجارب_عملية'],
      contentMarkdown: `# تحضير درس: قوانين نيوتن للحركة وتطبيقاتها في الحياة

> [!teacher] بطاقة تخطيط الدرس اليومي - وزارة التربية بدولة الكويت
> **المادة:** الفيزياء | **الصف:** العاشر علمي | **الوحدة:** الميكانيكا والحركة | **الحصة:** 45 دقيقة

## 1. الكفايات والمعايير المستهدفة (وزارة التربية)
- **الكفاية العامة:** تطبيق المفاهيم الفيزيائية في تفسير الظواهر الطبيعية وحل المشكلات الحياتية.
- **المعيار الخاص (2-1):** يستنتج العلاقة الرياضية بين القوة والكتلة والتسارع ويجري تجارب لإثباتها.

## 2. الأهداف السلوكية
- **الهدف المعرفي:** أن يذكر الطالب نص قانون نيوتن الثاني رياضياً ولفظياً بدقة.
- **الهدف الوجداني:** أن يقدّر الطالب إسهامات العلماء المسلمين والأجانب في تطور علم الحركة.
- **الهدف النفس حركي:** أن يركّب الطالب دائرة الاستشعار الحركي لقياس تسارع العربة عملياً.

## 3. التهيئة الحافزة واستثارة الدافعية (5 دقائق)
عرض مقطع مرئي قصير لسيارة تقف فجأة واندفاع الراكب للأمام، وطرح السؤال المثير للتفكير: *لماذا نحتاج لحزام الأمان وفق المنظور الفيزيائي؟*

## 4. استراتيجيات التعلم النشط
- استراتيجية جدول التعلم (KWL)
- التعلم التعاوني في مجموعات مصغرة
- استقصاء عملي عبر محاكاة PhET الرقمية على أجهزة الآيباد

## 5. سير الدرس والأنشطة المتمايزة
- **مجموعة الفائقين:** اشتقاق معادلة القوة مع وجود قوة احتكاك وحساب معامل الاحتكاك الحركي.
- **مجموعة المتوسطين:** حل مسائل تطبيقية مباشرة على المعادلة F = m * a.
- **مجموعة الدعم:** تمثيل العلاقة البيانية بين القوة والتسارع عند ثبوت الكتلة.

## 6. التقويم البنائي والختامي
- **تطبيق فوري:** سؤال عبر المنصة (تيمز): احسب القوة اللازمة لتحريك جسم كتلته 5 كجم بتسارع 3 م/ث².
- **غلق الدرس:** لعبة تعليمية تفاعلية للتحقق من المفاهيم الأساسية.

## 7. غرس القيم والواجب المنزلي
- **القيمة التربوية:** الالتزام بقواعد المرور والسرعة المحددة حفاظاً على أرواح مستخدمي الطرق في دولة الكويت.
- **الواجب:** حل أنشطة كراسة التطبيقات ص 42 وتطبيق التفكير الناقد ص 44.`,
    },
    {
      id: 'kw-comm-2',
      title: 'تحضير درس سورة الحجرات (تربية إسلامية تاسع) - غرس القيم والأخلاق',
      department: 'التربية الإسلامية',
      grade: 'الصف التاسع المتوسط',
      teacherName: 'أ. فهد الهاجري',
      educationalZone: 'منطقة الأحمدي التعليمية',
      school: 'مدرسة سعيد بن المسيب المتوسطة',
      likes: 62,
      downloads: 245,
      createdAt: Date.now() - 86400000 * 4,
      description: 'تحضير شامل مع خرائط مفاهيم وتلاوة مجودة وتطبيقات سلوكية لتعزيز الأخوة والتثبت من الأخبار.',
      tags: ['تربية_إسلامية', 'الصف_التاسع', 'القرآن_الكريم', 'سورة_الحجرات', 'قيم'],
      contentMarkdown: `# تحضير درس: من آداب التعامل والأخوة الإيمانية (سورة الحجرات)

> [!teacher] الخطة اليومية - التوجيه الفني للتربية الإسلامية
> **المجال:** القرآن الكريم وعلومه | **الصف:** التاسع المتوسط | **الحصة:** 1

## 1. الكفايات الخاصة
- تلاوة الآيات الكريمة تلاوة مجودة خالية من اللحن.
- استنباط التوجيهات القرآنية في تجنب السخرية واللمز والتنابز بالألقاب.

## 2. الأهداف السلوكية
- يبيّن معاني المفردات القرآنية (لا يسخر، تلمزوا، تنابزوا).
- يستشعر قبح الغيبة والنميمة وتأثيرهما السلبي على تماسك المجتمع الكويتي.
- يتلو الآيات مراعياً أحكام النون الساكنة والتنوين.

## 3. غرس القيم الإسلامية والوطنية
- تعزيز قيم الاحترام والترابط بين أبناء المجتمع الواحد والتصدي للشائعات في منصات التواصل.`,
    },
    {
      id: 'kw-comm-3',
      title: 'تحضير وحدة البرمجة بلغة بايثون (حاسوب حادي عشر) - المتغيرات والجمل الشرطية',
      department: 'الحاسوب وتكنولوجيا المعلومات',
      grade: 'الصف الحادي عشر',
      teacherName: 'أ. مريم السبتي',
      educationalZone: 'منطقة حولي التعليمية',
      school: 'ثانوية الجابرية للبنات',
      likes: 79,
      downloads: 310,
      createdAt: Date.now() - 86400000 * 1,
      description: 'تحضير تفاعلي مع أمثلة برمجية حية، تصحيح الأخطاء البرمجية، وتطبيق لمشروع كويتي عملي.',
      tags: ['حاسوب', 'بايثون', 'برمجة', 'الصف_الحادي_عشر'],
      contentMarkdown: `# تحضير درس: الشروط واتخاذ القرار في بايثون (If-Else Conditions)

> [!teacher] منهج الحاسوب وتكنولوجيا المعلومات - وزارة التربية الكويت
> **الصف:** الحادي عشر | **الوحدة:** البرمجة المتقدمة بلغة Python | **المختبر:** معمل 2

## 1. المعيار والكفاية
- كتابة برامج حاسوبية تستخدم الجمل الشرطية لمعالجة المدخلات واتخاذ القرارات البرمجية المنطقية.

## 2. النشاط البرمجي العملي
كتابة برنامج يفحص معدل الطالب ويحدد قبوله في جامعة الكويت:

\`\`\`python
# برنامج فحص القبول الجامعي
gpa = float(input("أدخل النسبة المئوية للثانوية العامة: "))
if gpa >= 85:
    print("تهانينا! مقبول في الكليات العلمية والطبية بجامعة الكويت")
elif gpa >= 75:
    print("مقبول في الكليات الإنسانية والإدارية")
else:
    print("يرجى مراجعة إدارة التسجيل والقبول")
\`\`\`

## 3. التطبيق الإثرائي
إضافة التحقق من اختبار القدرات الأكاديمية (Aptitude Test).`,
    },
  ];

  fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

// 1. AI Kuwait Lesson Plan Generator & Modernizer
router.post('/lesson-plan/generate', async (req, res) => {
  try {
    const {
      department,
      grade,
      stage,
      topic,
      unit,
      durationMinutes,
      lessonType, // new, review, lab, enrichment
      educationalZone,
      additionalNotes,
    } = req.body;

    if (!topic || !department) {
      return res.status(400).json({ error: 'حياك الله، يرجى كتابة اسم المادة وعنوان الدرس' });
    }

    const ai = getAI();
    const systemPrompt = `أنت موجه فني أول وخبير تربوي كويتي معتمد في وزارة التربية بدولة الكويت 🇰🇼.
تتحدث بروح الميدان التربوي الكويتي، بأسلوب راقٍ ومرحّب يجمع بين الهيبة التربوية واللمسة الكويتية الأصيلة المحفزة للمعلم ("يا هلا ومسهلا بأهل الميدان التربوي"، "أبشر بعزك، زهبت لك تحضير نموذجي ومفصل حسب معايير التوجيه الفني"، "عساك عالقوة يا أستاذنا").

مهمتك: إعداد تحضير درس رسمي كويتي متكامل 100% يطابق وثيقة الكفايات والمعايير الوطنية لوزارة التربية بدولة الكويت لعام 2025/2026، ليكون جاهزاً للاعتماد الفوري من رئيس القسم والموجه الفني.

الهيكل المعتمد للتحضير الكويتي:
1. 📋 **بطاقة تخطيط الدرس (بيانات الحصة)**: (المادة والقسم، الصف والفصل، المرحلة، الوحدة، عنوان الدرس، التاريخ، الحصة، الزمن 45 دقيقة).
2. 🎯 **الكفايات والمعايير المستهدفة لوزارة التربية**:
   - الكفاية العامة بدقة.
   - المعيار الخاص ورقمه المعتمد في المنهج الكويتي.
3. 📝 **الأهداف السلوكية الإجرائية (ثلاثية الأبعاد)**:
   - الأهداف المعرفية (تدرج هرم بلوم: تذكر، فهم، تطبيق، تحليل).
   - الأهداف الوجدانية (غرس القيم الإسلامية الأصيلة، حب الكويت والولاء لأميرنا وديرتنا، المحافظة على مرافق الوطن، تعزيز روح الأخوة والتعاون).
   - الأهداف النفس حركية / المهارية والتطبيقية.
4. 💡 **التهيئة الحافزة واستثارة الدافعية (5 دقائق)**:
   - مدخل مشوق أو سؤال مثير للتفكير مرتبط بالواقع الكويتي وبيئتنا.
5. 🚀 **استراتيجيات التعلم النشط والتفكير الناقد**:
   - استراتيجيات معتمدة مثل: (جدول التعلم KWL، فكر-زاوج-شارك، التعلم التعاوني، القبعات الست، محاكاة رقمية، الصف المقلوب).
6. 📱 **التقنيات الحديثة والوسائل التعليمية**:
   - توظيف منصة تيمز (MS Teams)، الآيباد، السبورات التفاعلية، أوراق عمل تفاعلية، ومختبرات تفاعلية.
7. 🌟 **سير الحصة والأنشطة المتمايزة (الفروق الفردية)**:
   - نشاط لمجموعة الفائقين والمبدعين.
   - نشاط لمجموعة المتوسطين.
   - نشاط لمجموعة الدعم والمساندة (رعاية المتعثرين).
8. 📊 **التقويم البنائي والختامي**:
   - أسئلة تقويمية مرحلية أثناء الشرح وغلق الدرس بمسابقة أو بطاقة خروج.
9. 🏠 **غرس القيمة التربوية والواجب المنزلي**:
   - القيمة الأسبوعية لدولة الكويت.
   - الواجب من كراسة التطبيقات وكتاب الطالب.

اكتب التحضير بتنسيق Markdown جميل ومرتب جداً، وأرفق في البداية ترحيباً كويتياً دافئاً ومحفزاً للمعلم.`;

    const userPrompt = `يرجى إعداد تحضير درس نموذجي رسمي لمدارس الكويت:
- المادة / القسم: ${department}
- المرحلة الدراسية: ${stage || 'المرحلة التعليمية'}
- الصف: ${grade || 'الصف'}
- الوحدة الدراسية: ${unit || 'الوحدة المقررة'}
- عنوان الدرس: ${topic}
- مدة الحصة: ${durationMinutes || 45} دقيقة
- نوع الحصة: ${lessonType || 'درس جديد'}
- المنطقة التعليمية: ${educationalZone || 'دولة الكويت'}
- ملاحظات وإضافات خاصة من المعلم: ${additionalNotes || 'لا توجد'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    const markdownText = response.text || '';

    res.json({
      success: true,
      department,
      grade,
      topic,
      lessonPlanMarkdown: markdownText,
      generatedAt: Date.now(),
    });
  } catch (err: any) {
    console.error('Error generating lesson plan:', err);
    res.status(500).json({ error: err.message || 'حصل خطأ بسيط أثناء تجهيز التحضير، جرب مرة ثانية' });
  }
});

// 2. AI Kuwait Lesson Plan Modernizer (Upload / Paste Old Plan -> 2026 MOE Format)
router.post('/lesson-plan/modernize', async (req, res) => {
  try {
    const { oldContent, department, grade, targetStandard } = req.body;

    if (!oldContent || !oldContent.trim()) {
      return res.status(400).json({ error: 'حيّاك الله، يرجى لصق نص التحضير القديم لتحديثه' });
    }

    const ai = getAI();
    const systemPrompt = `أنت خبير تطوير وتحديث المناهج والإنماء المهني بالتوجيه الفني العام بوزارة التربية بدولة الكويت 🇰🇼.
أسلوبك كويتي أصيل، محترم ومشجع لزملائك المعلمين ("أهلاً بك يا زميلنا العزيز"، "طوّرنا لك التحضير وخليناه على أحدث كفايات التوجيه لسنة 2025/2026").

مهمتك: استلام التحضير القديم أو المسودة، وإعادة صياغتها بالكامل لتطابق النظام الحديث للكفايات والمعايير المعمول بها في مدارس الكويت:
- تحويل الأهداف القديمة إلى صياغة كفايات سلوكية ثلاثية الأبعاد (معرفي، وجداني، مهاري).
- إدراج استراتيجيات التعلم النشط وتمايز التعليم (فائقين، متوسطين، متعثرين).
- ربط الدرس بالقيم الوطنية والإسلامية لمجتمعنا الكويتي.
- تنسيق الخطة لتكون صالحة للتطبيق الفوري في الصف والاعتماد الإشرافي.`;

    const userPrompt = `إليك التحضير القديم لتحديثه وصياغته حسب معايير التوجيه الكويتي الحديثة:
المادة: ${department || 'عام'}
الصف: ${grade || 'عام'}
المعيار المستهدف: ${targetStandard || 'معايير وزارة التربية الحديثة'}

نص التحضير السابق:
"""
${oldContent}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    res.json({
      success: true,
      modernizedMarkdown: response.text || '',
      updatedAt: Date.now(),
    });
  } catch (err: any) {
    console.error('Error modernizing lesson plan:', err);
    res.status(500).json({ error: err.message || 'حصل خطأ أثناء تحديث التحضير' });
  }
});

// 3. Kuwait Curriculum AI Tutor (Grounded in Kuwait MOE Books)
router.post('/qa', async (req, res) => {
  try {
    const { question, subject, grade, stage, previousMessages } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'حيّاك الله، اكتب سؤالك وما نقصر وياك' });
    }

    const ai = getAI();
    const systemPrompt = `أنت "المستشار التربوي الكويتي" وموجه المناهج الذكي المعتمد لمدارس وكتب وزارة التربية بدولة الكويت 🇰🇼.
تتحدث بلهجة وروح كويتية مرحبة ومحببة للطلبة والمعلمين ("يا هلا والله"، "حيّاك الله يا بطل / يا معلمنا الفاضل"، "أبشر بالحل النموذجي على منهج ديرتنا"، "فالك الدرجة الكاملة والامتياز").

تعتمد في إجاباتك حصرياً على:
1. المناهج والكتب المدرسية المقررة من وزارة التربية بدولة الكويت لكافة المراحل (الابتدائي، المتوسط، الثانوي).
2. بنوك الأسئلة ونماذج إجابات الكنترول والتوجيه الفني الكويتي.
3. القوانين العلمية والرياضية والمسائل المقررة.
4. إعراب وبلاغة اللغة العربية وفق قواعد المنهج الكويتي.
5. الفقه والقرآن الكريم والتربية الإسلامية المقررة في الكويت.
6. تاريخ الكويت، الدستور والمواطنة، والجغرافيا.
7. مناهج الحاسوب (Python، سكراتش، تكنولوجيا المعلومات).

أسلوب تقديم الإجابة:
- ترحيب كويتي لطيف ومباشر.
- الإجابة النموذجية خطوة بخطوة بالخطوات الواضحة والتبرير العلمي.
- ذكر مثال من واقع الحياة في الكويت أو سؤال اختبار مشابه لترسيخ الفهم.
- استخدام تنسيق Markdown أنيق وواضح.`;

    let prompt = `السؤال: ${question}\nالمادة: ${subject || 'عام'}\nالصف: ${grade || 'غير محدد'}\nالمرحلة: ${stage || 'غير محدد'}`;
    if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
      prompt = `السياق السابق:\n${previousMessages.map((m: any) => `${m.role === 'user' ? 'السائل' : 'المستشار الكويتي'}: ${m.text}`).join('\n')}\n\nالسؤال الجديد:\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({
      success: true,
      answer: response.text || '',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in Kuwait Q&A:', err);
    res.status(500).json({ error: err.message || 'حصل خطأ في الإجابة، جرب تسأل مرة ثانية' });
  }
});

// 4. Computer Science Coding Tutor & Exercise Helper
router.post('/code-helper', async (req, res) => {
  try {
    const { code, language, task, grade } = req.body;

    const ai = getAI();
    const systemPrompt = `أنت معلم ومدرب الحاسوب والبرمجة لمدارس وزارة التربية بدولة الكويت 🇰🇼.
تتحدث بروح كويتية مشجعة وإيجابية ("عاش البطل"، "حيّاك الله يا مبرمجنا"، "الكود مالك ممتاز بس محتاج تعديل بسيط"، "شوف التوضيح خطوة بخطوة").
تشرح بلغة بايثون Python، سكراتش، وتطوير الويب المقررة في مناهج المرحلة المتوسطة والثانوية بالكويت، وتصحح الأخطاء المنطقية والبرمجية مع أمثلة كويتية ممتعة.`;

    const userPrompt = `اللغة: ${language || 'python'}
الصف: ${grade || 'المرحلة الثانوية'}
الطلب / السؤال: ${task || 'تحليل وشرح هذا الكود وتصحيح أي أخطاء'}

الكود:
\`\`\`${language || 'python'}
${code || ''}
\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      analysis: response.text || '',
    });
  } catch (err: any) {
    console.error('Error in code helper:', err);
    res.status(500).json({ error: err.message || 'حصل خطأ أثناء فحص الكود' });
  }
});

// 5. Community Templates Hub (Browse, Search, Publish, Like)
router.get('/community', (req, res) => {
  try {
    const { department, grade, search, zone } = req.query;
    let list = loadCommunityTemplates();

    if (department && department !== 'all') {
      list = list.filter((t: any) => t.department === department);
    }
    if (grade && grade !== 'all') {
      list = list.filter((t: any) => t.grade === grade);
    }
    if (zone && zone !== 'all') {
      list = list.filter((t: any) => t.educationalZone === zone);
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag: string) => tag.toLowerCase().includes(q))
      );
    }

    res.json({ templates: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Share a template to community
router.post('/community/share', (req, res) => {
  try {
    const { title, department, grade, teacherName, educationalZone, school, description, tags, contentMarkdown } =
      req.body;

    if (!title || !contentMarkdown) {
      return res.status(400).json({ error: 'عنوان التحضير ومحتواه مطلوبان للنشر' });
    }

    const list = loadCommunityTemplates();
    const newEntry = {
      id: `kw-comm-${Date.now()}`,
      title,
      department: department || 'التعليم العام',
      grade: grade || 'جميع الصفوف',
      teacherName: teacherName || 'معلم متميز',
      educationalZone: educationalZone || 'منطقة تعليمية',
      school: school || 'وزارة التربية',
      likes: 1,
      downloads: 1,
      createdAt: Date.now(),
      description: description || 'تحضير مشارك من معلمي الكويت',
      tags: tags || ['تحضير', 'كويت'],
      contentMarkdown,
    };

    list.unshift(newEntry);
    fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(list, null, 2), 'utf-8');

    res.json({ success: true, item: newEntry });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Like a community template
router.post('/community/like/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadCommunityTemplates();
    const item = list.find((t: any) => t.id === id);
    if (item) {
      item.likes = (item.likes || 0) + 1;
      fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(list, null, 2), 'utf-8');
      return res.json({ success: true, likes: item.likes });
    }
    res.status(404).json({ error: 'التحضير غير موجود' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download / Clone count increment
router.post('/community/download/:id', (req, res) => {
  try {
    const { id } = req.params;
    const list = loadCommunityTemplates();
    const item = list.find((t: any) => t.id === id);
    if (item) {
      item.downloads = (item.downloads || 0) + 1;
      fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(list, null, 2), 'utf-8');
      return res.json({ success: true, downloads: item.downloads, contentMarkdown: item.contentMarkdown });
    }
    res.status(404).json({ error: 'التحضير غير موجود' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
