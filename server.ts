import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import syncRouter from './src/services/syncRouter';
import kuwaitRouter from './src/services/kuwaitRouter';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', syncRouter);
app.use('/api/kuwait', kuwaitRouter);


// Base directory for all vaults on disk
const DATA_DIR = path.join(process.cwd(), 'data', 'vaults');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global active vault tracker and file watcher state
let activeVaultId: string = 'default-scholarly-vault';
const fileWatchers = new Map<string, fs.FSWatcher>();
const sseClients: express.Response[] = [];

function notifyClients(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  }
}

// Arabic Text Normalization for FTS
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;

function normalizeArabicForSearch(text: string): string {
  if (!text) return '';
  return text
    .replace(TASHKEEL_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ی/g, 'ي')
    .toLowerCase()
    .trim();
}

function extractTags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([\w\u0600-\u06FF_-]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(t => t.slice(1))));
}

function extractWikiLinks(text: string): string[] {
  if (!text) return [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1].trim());
  }
  return Array.from(new Set(links));
}

// Helper to write file atomically
async function atomicWriteFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = path.join(
    dir,
    `.tmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  );
  await fs.promises.writeFile(tempPath, content, 'utf-8');
  await fs.promises.rename(tempPath, filePath);
}

// Initialize default sample vault with authentic classical Arabic study notes if empty
function initializeDefaultVault() {
  const defaultVaultDir = path.join(DATA_DIR, 'default-scholarly-vault');
  const metadataPath = path.join(defaultVaultDir, 'vault.json');

  if (!fs.existsSync(defaultVaultDir)) {
    fs.mkdirSync(defaultVaultDir, { recursive: true });
    fs.mkdirSync(path.join(defaultVaultDir, 'attachments'), { recursive: true });
    fs.mkdirSync(path.join(defaultVaultDir, 'مخطوطات_وتحقيقات'), { recursive: true });
    fs.mkdirSync(path.join(defaultVaultDir, 'علوم_ورياضيات'), { recursive: true });
  }

  if (!fs.existsSync(metadataPath)) {
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(
        {
          id: 'default-scholarly-vault',
          name: 'خزانة المخطوطات والتحقيق',
          description: 'دفتر الدراسة والتحقيق التراثي والنصوص العلمية',
          createdAt: Date.now(),
        },
        null,
        2
      )
    );

    // Seed Initial Rich Sample Notes
    const note1 = `---
title: مدخل إلى تحقيق المخطوطات العربية
direction: rtl
---

# مدخل إلى أصول تحقيق المخطوطات ونقد النصوص

> [!scholarly] تنبيه منهجي في ضبط الحاشية
> التحقيق ليس مجرد تصحيح لغوي، بل هو بعث للنص كما أراده مؤلفه وفق مقابلة النسخ الخطية وضبط السند والعزو.

## المراحل الأساسية في صنعة التحقيق

1. جمع النسخ الخطية وترتيبها حسب القيمة التاريخية والسماع
2. ضبط النص المعتمد (النسخة الأم أو الركيزة)
3. تقييد الفروق والتعليقات في الحاشية الهامشية (Marginalia)
4. فهرسة الأعلام والأماكن والأشعار

### مقارنة بين مناهج التحقيق

| المنهج | الركيزة الأساسية | الميزات |
|---|---|---|
| منهج النسخة الأم | اختيار أصح نسخة واعتمادها أصلاً | سلامة النص من التلفيق |
| منهج النص المختار | اختيار القراءة الأرجح من كل نسخة | مرونة علمية عند فقدان الأصل |

### مصطلحات المخطوطات

- **الخرامة**: موضع خرم أو سقط في الورقة.
- **التضبيب**: علامة (صـ) توضع فوق الكلمة المشكوك في صحتها.
- **اللحاق**: كتابة ما سقط في الحاشية متصلاً بعلامة العطف (صحـ).

انظر أيضاً إلى [[رسالة الكندي في فك الشفرات]] للاطلاع على التحليل الإحصائي للغة، وإلى [[قوانين البصريات والمناظر]] لمراجعة نصوص ابن الهيثم.

#مخطوطات #تحقيق_النصوص #تراث #فلسفة_العلوم
`;

    const note2 = `---
title: رسالة الكندي في فك الشفرات
direction: rtl
---

# رسالة يعقوب بن إسحاق الكندي في استخراج المعمى

يعتبر كتاب الكندي أول مؤلف تاريخي يؤسس لعلم **التحليل الترددي** (Frequency Analysis) لفك الرسائل المعماة.

> "إحدى الحيل في استخراج المعمى، إذا كان الكتاب بلسان معروف، أن نأخذ كتاباً من ذلك اللسان قدر ما يتسع له وِعاء، ثم نعدّ حروفه حرفاً حرفاً..."

## كود خوارزمية حساب تكرار الحروف

\`\`\`typescript
// خوارزمية كشف التردد الإحصائي للحروف العربية
export function calculateArabicFrequencies(text: string): Record<string, number> {
  const clean = text.replace(/[\\s\\p{P}\\d]/gu, '');
  const freq: Record<string, number> = {};
  for (const char of clean) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(freq).sort(([, a], [, b]) => b - a)
  );
}
\`\`\`

## الترددات الأكثر شيوعاً في العربية

- الحروف الشائعة: الألف (ا)، اللام (ل)، الميم (م)، النون (ن)، الياء (ي).
- ارتباط وثيق بدراسات [[مدخل إلى تحقيق المخطوطات العربية]].

#تعمية #رياضيات #تاريخ_العلوم #الكندي
`;

    const note3 = `---
title: قوانين البصريات والمناظر
direction: rtl
---

# كتاب المناظر للحسن ابن الهيثم

بحث في قوانين انعكاس الضوء وانعطافه، وإثبات أن الرؤية تحدث بانبعاث الأشعة الضوئية من الأجسام إلى العين وليس العكس.

$$
\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}
$$

قانون سنيل في الانكسار:

$$
n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)
$$

> [!note] مقتبس من مقدمة المناظر
> "ونبتدئ في البحث باستقراء الموجودات، وتصفح أحوال المبصرات، وتمييز خواص الجزئيات..."

- [x] ضبط نص الفصل الرابع في تشريح العين
- [ ] مراجعة الرسوم الهندسية في النسخة الإسطنبولية (فاتح 3212)
- [x] إدراج المعادلات في الهامش الموازي

مرتبط بـ [[مدخل إلى تحقيق المخطوطات العربية]].

#بصريات #ابن_الهيثم #فيزياء #رياضيات
`;

    fs.writeFileSync(
      path.join(defaultVaultDir, 'مخطوطات_وتحقيقات', 'مدخل_إلى_تحقيق_المخطوطات.md'),
      note1,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(defaultVaultDir, 'علوم_ورياضيات', 'رسالة_الكندي_في_فك_الشفرات.md'),
      note2,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(defaultVaultDir, 'علوم_ورياضيات', 'قوانين_البصريات_والمناظر.md'),
      note3,
      'utf-8'
    );
  }
}

initializeDefaultVault();

// Start watching active vault directory
function setupVaultWatcher(vaultId: string) {
  if (fileWatchers.has(vaultId)) {
    fileWatchers.get(vaultId)?.close();
    fileWatchers.delete(vaultId);
  }
  const vaultDir = path.join(DATA_DIR, vaultId);
  if (!fs.existsSync(vaultDir)) return;

  try {
    const watcher = fs.watch(vaultDir, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.startsWith('.tmp_') && !filename.startsWith('.')) {
        notifyClients('vault-changed', { vaultId, eventType, filename });
      }
    });
    fileWatchers.set(vaultId, watcher);
  } catch (err) {
    console.error('File watcher error:', err);
  }
}

setupVaultWatcher(activeVaultId);

// ================= API ROUTES =================

// SSE stream for real-time vault file changes
app.get('/api/vault/watch', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) sseClients.splice(index, 1);
  });
});

// List all vaults
app.get('/api/vaults', async (req, res) => {
  try {
    const entries = await fs.promises.readdir(DATA_DIR, { withFileTypes: true });
    const vaults = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const vDir = path.join(DATA_DIR, entry.name);
        const metaPath = path.join(vDir, 'vault.json');
        let meta = {
          id: entry.name,
          name: entry.name,
          description: '',
          createdAt: Date.now(),
        };

        if (fs.existsSync(metaPath)) {
          try {
            const raw = await fs.promises.readFile(metaPath, 'utf-8');
            meta = { ...meta, ...JSON.parse(raw) };
          } catch {}
        }

        // Count markdown notes
        const countNotes = (dir: string): number => {
          let count = 0;
          try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const f of files) {
              if (f.isDirectory() && f.name !== 'attachments' && !f.name.startsWith('.')) {
                count += countNotes(path.join(dir, f.name));
              } else if (f.isFile() && f.name.endsWith('.md')) {
                count++;
              }
            }
          } catch {}
          return count;
        };

        vaults.push({
          ...meta,
          path: vDir,
          noteCount: countNotes(vDir),
          isActive: entry.name === activeVaultId,
        });
      }
    }

    res.json({ vaults, activeVaultId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new vault
app.post('/api/vaults', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Vault name is required' });

    const id =
      name
        .toLowerCase()
        .replace(/[\s\p{P}]+/gu, '-')
        .replace(/^-|-$/g, '') || `vault-${Date.now()}`;
    const vaultDir = path.join(DATA_DIR, id);

    if (fs.existsSync(vaultDir)) {
      return res.status(400).json({ error: 'Vault with this name/ID already exists' });
    }

    await fs.promises.mkdir(vaultDir, { recursive: true });
    await fs.promises.mkdir(path.join(vaultDir, 'attachments'), { recursive: true });

    const meta = {
      id,
      name,
      description: description || '',
      createdAt: Date.now(),
    };
    await fs.promises.writeFile(
      path.join(vaultDir, 'vault.json'),
      JSON.stringify(meta, null, 2),
      'utf-8'
    );

    activeVaultId = id;
    setupVaultWatcher(id);

    res.json({ vault: meta, activeVaultId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Switch active vault
app.post('/api/vaults/switch', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Vault ID is required' });

  const vaultDir = path.join(DATA_DIR, id);
  if (!fs.existsSync(vaultDir)) {
    return res.status(404).json({ error: 'Vault not found' });
  }

  activeVaultId = id;
  setupVaultWatcher(id);
  res.json({ success: true, activeVaultId });
});

// Helper to crawl notes in vault directory
async function getNotesInVault(vaultId: string) {
  const vaultDir = path.join(DATA_DIR, vaultId);
  const notes: any[] = [];

  async function scan(currentDir: string, relFolder: string) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'attachments') continue;

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const nextRel = relFolder ? `${relFolder}/${entry.name}` : entry.name;
        await scan(fullPath, nextRel);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stats = await fs.promises.stat(fullPath);
        const content = await fs.promises.readFile(fullPath, 'utf-8');

        // Extract title from frontmatter or first H1 or filename
        let title = entry.name.replace(/\.md$/, '').replace(/_/g, ' ');
        let direction: 'auto' | 'rtl' | 'ltr' = 'auto';

        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const fm = frontmatterMatch[1];
          const titleMatch = fm.match(/title:\s*(.*)/);
          if (titleMatch) title = titleMatch[1].trim();
          const dirMatch = fm.match(/direction:\s*(.*)/);
          if (dirMatch) direction = dirMatch[1].trim() as any;
        } else {
          const h1Match = content.match(/^#\s+(.*)$/m);
          if (h1Match) title = h1Match[1].trim();
        }

        const tags = extractTags(content);
        const outgoingLinks = extractWikiLinks(content);
        const relFilePath = path.relative(vaultDir, fullPath).replace(/\\/g, '/');

        notes.push({
          id: Buffer.from(relFilePath).toString('base64url'),
          vaultId,
          title,
          folder: relFolder || 'root',
          path: relFilePath,
          content,
          createdAt: stats.birthtimeMs || stats.mtimeMs,
          updatedAt: stats.mtimeMs,
          tags,
          outgoingLinks,
          direction,
        });
      }
    }
  }

  if (fs.existsSync(vaultDir)) {
    await scan(vaultDir, '');
  }

  return notes;
}

// Get all notes in active vault
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await getNotesInVault(activeVaultId);
    res.json({ notes, vaultId: activeVaultId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, folder, content, direction } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const vaultDir = path.join(DATA_DIR, activeVaultId);
    const targetFolder = folder && folder !== 'root' ? path.join(vaultDir, folder) : vaultDir;

    if (!fs.existsSync(targetFolder)) {
      await fs.promises.mkdir(targetFolder, { recursive: true });
    }

    const safeFileName = `${title.replace(/[\s/\\?%*:|"<>]+/g, '_')}.md`;
    const targetPath = path.join(targetFolder, safeFileName);

    const initialContent =
      content !== undefined
        ? content
        : `---\ntitle: ${title}\ndirection: ${direction || 'auto'}\n---\n\n# ${title}\n\n`;

    await atomicWriteFile(targetPath, initialContent);

    const relFilePath = path.relative(vaultDir, targetPath).replace(/\\/g, '/');
    const noteId = Buffer.from(relFilePath).toString('base64url');

    res.json({
      success: true,
      note: {
        id: noteId,
        vaultId: activeVaultId,
        title,
        folder: folder || 'root',
        path: relFilePath,
        content: initialContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: extractTags(initialContent),
        outgoingLinks: extractWikiLinks(initialContent),
        direction: direction || 'auto',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update note atomically
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title, folder, direction } = req.body;

    const relFilePath = Buffer.from(id, 'base64url').toString('utf-8');
    const vaultDir = path.join(DATA_DIR, activeVaultId);
    let targetPath = path.join(vaultDir, relFilePath);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Note file not found' });
    }

    let finalContent = content;

    // Preserve/Update frontmatter if title/direction changed
    if (title || direction) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        let fm = frontmatterMatch[1];
        if (title) fm = fm.replace(/title:\s*.*/, `title: ${title}`);
        if (direction) fm = fm.replace(/direction:\s*.*/, `direction: ${direction}`);
        finalContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
      } else if (title || direction) {
        finalContent = `---\ntitle: ${title || 'Untitled'}\ndirection: ${
          direction || 'auto'
        }\n---\n\n${content}`;
      }
    }

    await atomicWriteFile(targetPath, finalContent);

    // If rename requested
    if (title && !targetPath.endsWith(`/${title.replace(/[\s/\\?%*:|"<>]+/g, '_')}.md`)) {
      const newFileName = `${title.replace(/[\s/\\?%*:|"<>]+/g, '_')}.md`;
      const newPath = path.join(path.dirname(targetPath), newFileName);
      if (!fs.existsSync(newPath)) {
        await fs.promises.rename(targetPath, newPath);
        targetPath = newPath;
      }
    }

    const updatedRel = path.relative(vaultDir, targetPath).replace(/\\/g, '/');
    const newId = Buffer.from(updatedRel).toString('base64url');

    res.json({
      success: true,
      noteId: newId,
      path: updatedRel,
      tags: extractTags(finalContent),
      outgoingLinks: extractWikiLinks(finalContent),
      updatedAt: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const relFilePath = Buffer.from(id, 'base64url').toString('utf-8');
    const vaultDir = path.join(DATA_DIR, activeVaultId);
    const targetPath = path.join(vaultDir, relFilePath);

    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create folder
app.post('/api/folders', async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const safeName = name.replace(/[\s/\\?%*:|"<>]+/g, '_');
    const vaultDir = path.join(DATA_DIR, activeVaultId);
    const targetPath = parent && parent !== 'root' ? path.join(vaultDir, parent, safeName) : path.join(vaultDir, safeName);

    if (!fs.existsSync(targetPath)) {
      await fs.promises.mkdir(targetPath, { recursive: true });
    }

    res.json({ success: true, path: path.relative(vaultDir, targetPath).replace(/\\/g, '/') });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Full-Text Search (FTS) with Arabic Normalization
app.get('/api/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    const notes = await getNotesInVault(activeVaultId);
    const normalizedQuery = normalizeArabicForSearch(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

    const results = [];

    for (const note of notes) {
      const normalizedTitle = normalizeArabicForSearch(note.title);
      const normalizedContent = normalizeArabicForSearch(note.content);

      let score = 0;
      const matches: any[] = [];

      // Check title match
      if (normalizedTitle.includes(normalizedQuery)) {
        score += 100;
        matches.push({
          field: 'title',
          snippet: note.title,
          start: 0,
          length: note.title.length,
        });
      }

      // Check tags
      for (const tag of note.tags) {
        const normTag = normalizeArabicForSearch(tag);
        if (normTag.includes(normalizedQuery)) {
          score += 50;
          matches.push({
            field: 'tag',
            snippet: `#${tag}`,
            start: 0,
            length: tag.length + 1,
          });
        }
      }

      // Check content match with snippet excerpt
      const rawLines = note.content.split('\n');
      for (let l = 0; l < rawLines.length; l++) {
        const line = rawLines[l];
        const normLine = normalizeArabicForSearch(line);

        let lineMatches = false;
        for (const qw of queryWords) {
          if (normLine.includes(qw)) {
            lineMatches = true;
            score += 10;
          }
        }

        if (lineMatches) {
          matches.push({
            field: 'content',
            snippet: line.trim(),
            start: 0,
            length: line.length,
          });
          if (matches.length > 5) break;
        }
      }

      if (score > 0) {
        results.push({
          noteId: note.id,
          noteTitle: note.title,
          notePath: note.path,
          score,
          matches,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tags index endpoint
app.get('/api/tags', async (req, res) => {
  try {
    const notes = await getNotesInVault(activeVaultId);
    const tagMap = new Map<string, { id: string; title: string; path: string }[]>();

    for (const note of notes) {
      for (const tag of note.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push({
          id: note.id,
          title: note.title,
          path: note.path,
        });
      }
    }

    const tagIndex = Array.from(tagMap.entries()).map(([tag, noteList]) => ({
      tag,
      count: noteList.length,
      notes: noteList,
    }));

    tagIndex.sort((a, b) => b.count - a.count);
    res.json({ tags: tagIndex });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Backlinks endpoint
app.get('/api/backlinks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await getNotesInVault(activeVaultId);
    const targetNote = notes.find(n => n.id === id);

    if (!targetNote) {
      return res.json({ backlinks: [] });
    }

    const backlinks = [];
    const targetTitleNormalized = normalizeArabicForSearch(targetNote.title);

    for (const note of notes) {
      if (note.id === targetNote.id) continue;

      // Check if note references target
      const links = extractWikiLinks(note.content);
      const isLinked = links.some(
        link => normalizeArabicForSearch(link) === targetTitleNormalized
      );

      if (isLinked) {
        // Extract surrounding context excerpt
        const lines = note.content.split('\n');
        let excerpt = '';
        for (const line of lines) {
          if (extractWikiLinks(line).some(l => normalizeArabicForSearch(l) === targetTitleNormalized)) {
            excerpt = line.trim();
            break;
          }
        }

        backlinks.push({
          sourceNoteId: note.id,
          sourceNoteTitle: note.title,
          sourceNotePath: note.path,
          excerpt: excerpt || note.title,
          targetLink: targetNote.title,
        });
      }
    }

    res.json({ backlinks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= PHASE 2: RECORDING & AUDIO ENDPOINTS =================

// Helper to get recording folder
function getRecordingDir(vaultId: string, sessionId: string): string {
  const dir = path.join(DATA_DIR, vaultId, 'recordings', sessionId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Generate simple audio waveform peaks from buffer
function computeWaveformPeaks(buffer: Buffer, numPeaks: number = 100): number[] {
  if (!buffer || buffer.length === 0) {
    return Array(numPeaks).fill(0.1);
  }
  const peaks: number[] = [];
  const chunkSize = Math.max(1, Math.floor(buffer.length / numPeaks));

  for (let i = 0; i < numPeaks; i++) {
    const start = i * chunkSize;
    const end = Math.min(buffer.length, start + chunkSize);
    let sum = 0;
    let count = 0;

    for (let j = start; j < end; j += 4) {
      const val = Math.abs(buffer.readInt8(j)) / 128;
      sum += val;
      count++;
    }

    const avg = count > 0 ? sum / count : 0.1;
    // Normalize with slight aesthetic noise if completely silent
    peaks.push(Math.min(1, Math.max(0.05, Number((avg * 2.5).toFixed(3)))));
  }

  return peaks;
}

// Storage Status Check
app.get('/api/storage/status', async (req, res) => {
  try {
    let freeBytes = 1024 * 1024 * 1024 * 8; // 8 GB fallback
    let totalBytes = 1024 * 1024 * 1024 * 50;

    if (typeof (fs.promises as any).statfs === 'function') {
      try {
        const stats = await (fs.promises as any).statfs(DATA_DIR);
        freeBytes = Number(stats.bavail) * Number(stats.bsize);
        totalBytes = Number(stats.blocks) * Number(stats.bsize);
      } catch {}
    }

    // 24 kbps Opus mono = 3 KB/sec = 10.8 MB/hour
    const bytesPerHour = 24000 / 8 * 3600;
    const estimatedHours = Math.floor(freeBytes / bytesPerHour);

    const formatBytes = (bytes: number) => {
      if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    res.json({
      availableBytes: freeBytes,
      totalBytes,
      freeSpaceReadable: formatBytes(freeBytes),
      isLowSpace: freeBytes < 250 * 1024 * 1024, // < 250 MB
      estimatedHoursRemaining: estimatedHours,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Recording Session
app.post('/api/recordings/start', async (req, res) => {
  try {
    const { title, noteId, noteTitle, sourceType, mimeType, bitrate } = req.body;
    const sessionId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const chunksDir = path.join(sessionDir, 'chunks');
    await fs.promises.mkdir(chunksDir, { recursive: true });

    const sessionData = {
      id: sessionId,
      vaultId: activeVaultId,
      noteId: noteId || undefined,
      noteTitle: noteTitle || undefined,
      title: title || `تسجيل ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'short', timeStyle: 'short' } as any)}`,
      startTime: Date.now(),
      duration: 0,
      audioPath: `recordings/${sessionId}/live_stream.webm`,
      audioUrl: `/api/recordings/${sessionId}/audio`,
      mimeType: mimeType || 'audio/webm;codecs=opus',
      bitrate: bitrate || 24000,
      sizeBytes: 0,
      sourceType: sourceType || 'microphone',
      isFinalized: false,
      chunkCount: 0,
      markers: [],
      capturedBlocks: [],
      waveformPeaks: [],
    };

    await atomicWriteFile(
      path.join(sessionDir, 'manifest.json'),
      JSON.stringify(sessionData, null, 2)
    );

    res.json({ success: true, session: sessionData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chunk ingest for crash-safe writing
app.post('/api/recordings/:sessionId/chunk', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { chunkIndex, data, timestamp } = req.body;

    if (chunkIndex === undefined || !data) {
      return res.status(400).json({ error: 'chunkIndex and base64 data required' });
    }

    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');
    const chunksDir = path.join(sessionDir, 'chunks');

    const cleanBase64 = data.replace(/^data:[^;]+;base64,/, '');
    const chunkBuffer = Buffer.from(cleanBase64, 'base64');

    // 1. Write discrete chunk file
    const chunkFileName = `chunk_${String(chunkIndex).padStart(6, '0')}.bin`;
    await fs.promises.writeFile(path.join(chunksDir, chunkFileName), chunkBuffer);

    // 2. Append to live assembled stream for immediate continuity
    const liveStreamPath = path.join(sessionDir, 'live_stream.webm');
    await fs.promises.appendFile(liveStreamPath, chunkBuffer);

    // 3. Update manifest
    let session: any = {};
    if (fs.existsSync(manifestPath)) {
      try {
        session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
      } catch {}
    }

    session.chunkCount = Math.max(session.chunkCount || 0, chunkIndex + 1);
    session.sizeBytes = (session.sizeBytes || 0) + chunkBuffer.length;
    session.lastChunkAt = Date.now();
    if (timestamp) {
      session.duration = Math.max(session.duration || 0, Math.round(timestamp));
    }

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));

    res.json({
      success: true,
      chunkIndex,
      bytesWritten: chunkBuffer.length,
      totalBytes: session.sizeBytes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Moment Marker / Flag to active recording
app.post('/api/recordings/:sessionId/marker', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timestamp, label } = req.body;

    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Recording session not found' });
    }

    const session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    const marker = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Number(timestamp) || 0,
      label: label || 'علامة موضع مهم',
      createdAt: Date.now(),
    };

    session.markers = session.markers || [];
    session.markers.push(marker);
    session.markers.sort((a: any, b: any) => a.timestamp - b.timestamp);

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));

    res.json({ success: true, marker, markers: session.markers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record block typed during recording
app.post('/api/recordings/:sessionId/block', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { blockId, timestamp, contentSnippet } = req.body;

    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Recording session not found' });
    }

    const session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    session.capturedBlocks = session.capturedBlocks || [];

    const existingIdx = session.capturedBlocks.findIndex((b: any) => b.blockId === blockId);
    const blockEntry = {
      blockId,
      timestamp: Number(timestamp) || 0,
      contentSnippet: (contentSnippet || '').substring(0, 120),
    };

    if (existingIdx >= 0) {
      session.capturedBlocks[existingIdx] = blockEntry;
    } else {
      session.capturedBlocks.push(blockEntry);
    }
    session.capturedBlocks.sort((a: any, b: any) => a.timestamp - b.timestamp);

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));

    res.json({ success: true, capturedBlocks: session.capturedBlocks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stop and finalize recording session
app.post('/api/recordings/:sessionId/stop', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration, markers, title } = req.body;

    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Recording session not found' });
    }

    const session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    session.endTime = Date.now();
    session.isFinalized = true;
    if (duration !== undefined) session.duration = Math.max(1, Math.round(duration));
    if (markers) session.markers = markers;
    if (title) session.title = title;

    // Assembled live stream path
    const liveStreamPath = path.join(sessionDir, 'live_stream.webm');
    const finalRecordingPath = path.join(sessionDir, 'recording.webm');

    let totalBuffer: Buffer = Buffer.alloc(0);
    if (fs.existsSync(liveStreamPath)) {
      totalBuffer = await fs.promises.readFile(liveStreamPath);
      await fs.promises.copyFile(liveStreamPath, finalRecordingPath);
    } else {
      // Reassemble from chunk files if live_stream was missing
      const chunksDir = path.join(sessionDir, 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunkFiles = (await fs.promises.readdir(chunksDir))
          .filter(f => f.startsWith('chunk_'))
          .sort();
        const buffers = [];
        for (const cf of chunkFiles) {
          buffers.push(await fs.promises.readFile(path.join(chunksDir, cf)));
        }
        totalBuffer = Buffer.concat(buffers);
        await fs.promises.writeFile(finalRecordingPath, totalBuffer);
      }
    }

    session.sizeBytes = totalBuffer.length;
    session.waveformPeaks = computeWaveformPeaks(totalBuffer, 120);

    // Also copy into vault's attachments/recordings/
    const attachmentsRecDir = path.join(DATA_DIR, activeVaultId, 'attachments', 'recordings');
    await fs.promises.mkdir(attachmentsRecDir, { recursive: true });
    const exportedAttachmentPath = path.join(attachmentsRecDir, `${sessionId}.webm`);
    if (fs.existsSync(finalRecordingPath)) {
      await fs.promises.copyFile(finalRecordingPath, exportedAttachmentPath);
    }

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));

    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Crash-Safety Recovery: Recover an interrupted / crashed session
app.post('/api/recordings/:sessionId/recover', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');
    const chunksDir = path.join(sessionDir, 'chunks');
    const liveStreamPath = path.join(sessionDir, 'live_stream.webm');
    const finalRecordingPath = path.join(sessionDir, 'recording.webm');

    let session: any = {
      id: sessionId,
      vaultId: activeVaultId,
      title: `تسجيل مسترد (${sessionId})`,
      startTime: Date.now(),
      isFinalized: false,
      markers: [],
      capturedBlocks: [],
    };

    if (fs.existsSync(manifestPath)) {
      try {
        session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
      } catch {}
    }

    // Assemble all available chunks
    let totalBuffer: Buffer = Buffer.alloc(0);
    if (fs.existsSync(chunksDir)) {
      const chunkFiles = (await fs.promises.readdir(chunksDir))
        .filter(f => f.startsWith('chunk_'))
        .sort();
      const buffers = [];
      for (const cf of chunkFiles) {
        buffers.push(await fs.promises.readFile(path.join(chunksDir, cf)));
      }
      if (buffers.length > 0) {
        totalBuffer = Buffer.concat(buffers);
      }
    }

    if (totalBuffer.length === 0 && fs.existsSync(liveStreamPath)) {
      totalBuffer = await fs.promises.readFile(liveStreamPath);
    }

    if (totalBuffer.length === 0) {
      return res.status(400).json({ error: 'No audio chunks found to recover' });
    }

    await fs.promises.writeFile(finalRecordingPath, totalBuffer);

    // Approximate duration from chunk count and bitrate (e.g. 3s per chunk or bytes / (24000/8))
    const bitrate = session.bitrate || 24000;
    const bytesPerSec = bitrate / 8;
    const estimatedDuration = Math.max(
      session.duration || 0,
      Math.round(totalBuffer.length / bytesPerSec)
    );

    session.isFinalized = true;
    session.duration = estimatedDuration;
    session.sizeBytes = totalBuffer.length;
    session.waveformPeaks = computeWaveformPeaks(totalBuffer, 120);
    session.endTime = Date.now();
    session.title = session.title || `تسجيل مسترد ${new Date().toLocaleTimeString('ar-EG')}`;

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));

    // Copy to attachments
    const attachmentsRecDir = path.join(DATA_DIR, activeVaultId, 'attachments', 'recordings');
    await fs.promises.mkdir(attachmentsRecDir, { recursive: true });
    await fs.promises.copyFile(finalRecordingPath, path.join(attachmentsRecDir, `${sessionId}.webm`));

    res.json({ success: true, session, recovered: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check for unfinalized / crashed recordings across the active vault
app.get('/api/recordings/unfinalized', async (req, res) => {
  try {
    const recordingsRoot = path.join(DATA_DIR, activeVaultId, 'recordings');
    if (!fs.existsSync(recordingsRoot)) {
      return res.json({ unfinalized: [] });
    }

    const dirs = await fs.promises.readdir(recordingsRoot, { withFileTypes: true });
    const unfinalized = [];

    for (const d of dirs) {
      if (d.isDirectory()) {
        const manifestPath = path.join(recordingsRoot, d.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const raw = await fs.promises.readFile(manifestPath, 'utf-8');
            const data = JSON.parse(raw);
            if (!data.isFinalized) {
              unfinalized.push(data);
            }
          } catch {}
        }
      }
    }

    res.json({ unfinalized });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List all recordings in vault
app.get('/api/recordings', async (req, res) => {
  try {
    const { noteId, search } = req.query;
    const recordingsRoot = path.join(DATA_DIR, activeVaultId, 'recordings');
    if (!fs.existsSync(recordingsRoot)) {
      return res.json({ recordings: [] });
    }

    const dirs = await fs.promises.readdir(recordingsRoot, { withFileTypes: true });
    const list: any[] = [];

    for (const d of dirs) {
      if (d.isDirectory()) {
        const manifestPath = path.join(recordingsRoot, d.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const raw = await fs.promises.readFile(manifestPath, 'utf-8');
            const session = JSON.parse(raw);

            // Filter by noteId if provided
            if (noteId && session.noteId !== noteId) {
              continue;
            }

            // Filter by search query if provided
            if (search && typeof search === 'string') {
              const qNorm = normalizeArabicForSearch(search);
              const titleNorm = normalizeArabicForSearch(session.title || '');
              const noteTitleNorm = normalizeArabicForSearch(session.noteTitle || '');
              const markerMatches = (session.markers || []).some((m: any) =>
                normalizeArabicForSearch(m.label || '').includes(qNorm)
              );
              if (!titleNorm.includes(qNorm) && !noteTitleNorm.includes(qNorm) && !markerMatches) {
                continue;
              }
            }

            list.push({
              ...session,
              audioUrl: `/api/recordings/${session.id}/audio`,
            });
          } catch {}
        }
      }
    }

    list.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
    res.json({ recordings: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single recording metadata
app.get('/api/recordings/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Recording session not found' });
    }

    const session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    res.json({
      session: {
        ...session,
        audioUrl: `/api/recordings/${session.id}/audio`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stream audio file with HTTP 206 Partial Content (Range requests) for seeking
app.get('/api/recordings/:sessionId/audio', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = path.join(DATA_DIR, activeVaultId, 'recordings', sessionId);
    const finalPath = path.join(sessionDir, 'recording.webm');
    const livePath = path.join(sessionDir, 'live_stream.webm');

    let audioPath = fs.existsSync(finalPath) ? finalPath : livePath;

    if (!fs.existsSync(audioPath)) {
      return res.status(404).send('Audio file not found');
    }

    const stat = await fs.promises.stat(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(audioPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/webm',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/webm',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (err: any) {
    res.status(500).send('Error streaming audio: ' + err.message);
  }
});

// Update recording metadata (e.g. rename title or update markers)
app.put('/api/recordings/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, markers } = req.body;
    const sessionDir = getRecordingDir(activeVaultId, sessionId);
    const manifestPath = path.join(sessionDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Recording session not found' });
    }

    const session = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    if (title) session.title = title;
    if (markers) session.markers = markers;

    await atomicWriteFile(manifestPath, JSON.stringify(session, null, 2));
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete recording session
app.delete('/api/recordings/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = path.join(DATA_DIR, activeVaultId, 'recordings', sessionId);
    const attachmentPath = path.join(DATA_DIR, activeVaultId, 'attachments', 'recordings', `${sessionId}.webm`);

    if (fs.existsSync(sessionDir)) {
      await fs.promises.rm(sessionDir, { recursive: true, force: true });
    }
    if (fs.existsSync(attachmentPath)) {
      await fs.promises.unlink(attachmentPath).catch(() => {});
    }

    res.json({ success: true, deletedId: sessionId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Attachment Upload (Image or file)
app.post('/api/attachments', async (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'File name and base64Data are required' });
    }

    const vaultDir = path.join(DATA_DIR, activeVaultId, 'attachments');
    if (!fs.existsSync(vaultDir)) {
      await fs.promises.mkdir(vaultDir, { recursive: true });
    }

    const safeName = `${Date.now()}_${fileName.replace(/[\s/\\?%*:|"<>]+/g, '_')}`;
    const filePath = path.join(vaultDir, safeName);

    // Strip data URL header if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    await fs.promises.writeFile(filePath, Buffer.from(cleanBase64, 'base64'));

    res.json({
      success: true,
      url: `/api/attachments/${encodeURIComponent(safeName)}`,
      name: safeName,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve attachments
app.get('/api/attachments/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(DATA_DIR, activeVaultId, 'attachments', decodeURIComponent(fileName));

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Attachment not found');
  }

  res.sendFile(filePath);
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daftar scholarly server running on http://localhost:${PORT}`);
  });
}

startServer();
