import { NoteItem } from '../types';
import { toast } from '../components/Toast';

/**
 * Exporter and Importer for Scholarly Notes & Vaults
 * Handles Markdown, PDF (with strict Arabic RTL rendering), DOCX, Notion, Obsidian.
 */

/**
 * Clean Markdown string export for a single note
 */
export function exportNoteToMarkdown(note: NoteItem): string {
  return note.content;
}

/**
 * Clean download helper in browser
 */
export function downloadFile(filename: string, content: string | Blob, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Note to Print/PDF with proper Arabic RTL bidi rendering and typography
 */
export function printOrExportNoteToPDF(note: NoteItem, isArabic: boolean) {
  const isRtl = note.direction === 'rtl' || isArabic;
  const htmlContent = `
<!DOCTYPE html>
<html lang="${isRtl ? 'ar' : 'en'}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(note.title)} - دفتر</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-center {
        content: counter(page);
        font-family: 'IBM Plex Sans Arabic', sans-serif;
        font-size: 9pt;
        color: #5C6B7A;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: ${isRtl ? "'IBM Plex Sans Arabic', 'Amiri', 'Traditional Arabic', serif" : "'Plus Jakarta Sans', system-ui, sans-serif"};
      color: #13171C;
      background-color: #FFFFFF;
      line-height: 1.8;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
      unicode-bidi: isolate;
    }

    .header-box {
      border-bottom: 2px solid #0D5C75;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .doc-title {
      font-family: ${isRtl ? "'Amiri', serif" : "'Playfair Display', serif"};
      font-size: 22pt;
      font-weight: 700;
      color: #0D5C75;
      margin: 0 0 6px 0;
      line-height: 1.3;
    }

    .meta-line {
      font-size: 9pt;
      color: #5C6B7A;
      display: flex;
      gap: 16px;
    }

    .brand-tag {
      font-weight: 700;
      color: #0D5C75;
      font-size: 10pt;
    }

    h1 {
      font-size: 18pt;
      color: #0D5C75;
      border-bottom: 1px solid #E2E7ED;
      padding-bottom: 6px;
      margin-top: 20pt;
      page-break-after: avoid;
    }

    h2 {
      font-size: 14pt;
      color: #13171C;
      margin-top: 16pt;
      page-break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      color: #334155;
      margin-top: 12pt;
      page-break-after: avoid;
    }

    p {
      margin: 8pt 0;
      text-align: justify;
      text-justify: inter-word;
    }

    blockquote {
      margin: 12pt 0;
      padding: 10pt 14pt;
      background-color: #F8FAFC;
      border-${isRtl ? 'right' : 'left'}: 4px solid #0D5C75;
      border-radius: 4px;
      color: #334155;
      font-style: italic;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14pt 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #CBD5E1;
      padding: 6pt 10pt;
      text-align: ${isRtl ? 'right' : 'left'};
    }

    th {
      background-color: #F1F5F9;
      font-weight: 600;
      color: #0D5C75;
    }

    pre, code {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 9.5pt;
      direction: ltr;
      text-align: left;
    }

    pre {
      background-color: #0F172A;
      color: #F8FAFC;
      padding: 10pt;
      border-radius: 6px;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    .tag-badge {
      display: inline-block;
      padding: 2px 6px;
      background-color: #E2E8F0;
      border-radius: 4px;
      font-size: 8.5pt;
      color: #475569;
      margin-${isRtl ? 'left' : 'right'}: 4px;
    }

    .footer {
      margin-top: 30pt;
      padding-top: 10pt;
      border-top: 1px dashed #CBD5E1;
      font-size: 8pt;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 class="doc-title">${escapeHtml(note.title)}</h1>
      <div class="meta-line">
        <span>${isRtl ? 'المسار:' : 'Path:'} ${escapeHtml(note.path)}</span>
        <span>•</span>
        <span>${isRtl ? 'تاريخ التوثيق:' : 'Date:'} ${new Date(note.updatedAt).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US')}</span>
      </div>
    </div>
    <div class="brand-tag">دفتر • Dftr</div>
  </div>

  <div class="content-body">
    ${renderMarkdownToPrintHtml(note.content, isRtl)}
  </div>

  <div class="footer">
    <span>تم التصدير عبر تطبيق دفتر (Dftr) • خزانة المخطوطات والتحقيق والتسجيل</span>
    <span>dftr.rootkw.com</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success(isArabic ? 'جاري تجهيز مستند الطباعة...' : 'Preparing document for printing...');
      return;
    }
  } catch (e) {
    // Popup blocked
  }

  // Hidden iframe fallback
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      toast.success(isArabic ? 'جاري فتح نافذة الطباعة / PDF...' : 'Opening print dialogue...');
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 3000);
      }, 500);
    } else {
      toast.warning(isArabic ? 'يرجى السماح بالنوافذ المنبثقة لطباعة ملف PDF' : 'Please allow popups to export PDF');
    }
  } catch (err) {
    toast.error(isArabic ? 'تعذر تجهيز ملف الطباعة' : 'Could not prepare print document');
  }
}

/**
 * Export note to DOCX (Microsoft Word compatible XML document)
 */
export function exportNoteToDocx(note: NoteItem, isArabic: boolean) {
  const isRtl = note.direction === 'rtl' || isArabic;
  const xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:bidi w:val="${isRtl ? '1' : '0'}"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="48"/></w:rPr>
        <w:t>${escapeXml(note.title)}</w:t>
      </w:r>
    </w:p>
    ${note.content
      .split('\n')
      .map(line => {
        if (!line.trim()) {
          return '<w:p/>';
        }
        if (line.startsWith('# ')) {
          return `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:bidi w:val="${isRtl ? '1' : '0'}"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${escapeXml(line.replace(/^#\s*/, ''))}</w:t></w:r></w:p>`;
        }
        if (line.startsWith('## ')) {
          return `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:bidi w:val="${isRtl ? '1' : '0'}"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${escapeXml(line.replace(/^##\s*/, ''))}</w:t></w:r></w:p>`;
        }
        return `<w:p><w:pPr><w:bidi w:val="${isRtl ? '1' : '0'}"/></w:pPr><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`;
      })
      .join('\n')}
  </w:body>
</w:document>`;

  downloadFile(`${note.title.replace(/[\s/\\?%*:|"<>]+/g, '_')}.docx`, xmlBody, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/**
 * Parses Notion, Obsidian, or Plain Markdown files into Daftar format
 */
export async function parseImportedFiles(files: FileList | File[]): Promise<{ title: string; folder: string; content: string }[]> {
  const importedNotes: { title: string; folder: string; content: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const name = file.name;

    // Check if markdown or text file
    if (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.markdown')) {
      const text = await file.text();
      let cleanTitle = name.replace(/\.(md|txt|markdown)$/, '').replace(/_/g, ' ');

      // Notion exports often append 32-hex ID at end e.g. "My Note a1b2c3d4e5f6..."
      cleanTitle = cleanTitle.replace(/\s[a-f0-9]{32}$/i, '');

      // Derive folder from relative webkitRelativePath if folder was uploaded
      let folder = 'root';
      const relPath = (file as any).webkitRelativePath;
      if (relPath) {
        const parts = relPath.split('/');
        if (parts.length > 2) {
          folder = parts.slice(1, -1).join('/');
        }
      }

      importedNotes.push({
        title: cleanTitle,
        folder,
        content: text,
      });
    }
  }

  return importedNotes;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderMarkdownToPrintHtml(content: string, isRtl: boolean): string {
  // Strip YAML frontmatter for clean print
  const clean = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
  const lines = clean.split('\n');
  const out: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        out.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith('# ')) {
      out.push(`<h1>${escapeHtml(line.replace(/^#\s*/, ''))}</h1>`);
    } else if (line.startsWith('## ')) {
      out.push(`<h2>${escapeHtml(line.replace(/^##\s*/, ''))}</h2>`);
    } else if (line.startsWith('### ')) {
      out.push(`<h3>${escapeHtml(line.replace(/^###\s*/, ''))}</h3>`);
    } else if (line.startsWith('> ')) {
      out.push(`<blockquote>${escapeHtml(line.replace(/^>\s*/, ''))}</blockquote>`);
    } else if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ')) {
      const checked = line.includes('[x]');
      out.push(`<p><input type="checkbox" ${checked ? 'checked' : ''} disabled style="margin-${isRtl ? 'left' : 'right'}: 6px;"> ${escapeHtml(line.replace(/^-\s*\[[ x]\]\s*/, ''))}</p>`);
    } else if (line.trim().startsWith('- ')) {
      out.push(`<p>• ${escapeHtml(line.replace(/^-\s*/, ''))}</p>`);
    } else if (line.trim().length === 0) {
      out.push('<br>');
    } else {
      out.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    out.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return out.join('\n');
}
