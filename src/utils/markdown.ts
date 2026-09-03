import { Block, BlockType } from '../types';

/**
 * Generate a unique ID for a block
 */
export function generateBlockId(): string {
  return 'b_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatAudioTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse string timestamp like "04:12" or "01:23:45" or raw seconds into numeric seconds
 */
export function parseAudioTime(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(timeStr) || 0;
}

/**
 * Extract timestamp annotation from a line (e.g. `^t=04:15` or `<!-- rec:t=255 -->`)
 */
function extractTimestampAnnotation(line: string): { cleanLine: string; timestamp?: number } {
  // Check for ^t=00:00 or ^t=00:00:00 or ^t=123
  const hatMatch = line.match(/\s*\^t=([\d:]+)\s*$/);
  if (hatMatch) {
    return {
      cleanLine: line.replace(/\s*\^t=([\d:]+)\s*$/, ''),
      timestamp: parseAudioTime(hatMatch[1]),
    };
  }

  // Check for comment <!-- rec:t=123 -->
  const commentMatch = line.match(/\s*<!--\s*rec:t=([\d:]+)\s*-->\s*$/);
  if (commentMatch) {
    return {
      cleanLine: line.replace(/\s*<!--\s*rec:t=([\d:]+)\s*-->\s*$/, ''),
      timestamp: parseAudioTime(commentMatch[1]),
    };
  }

  return { cleanLine: line };
}

/**
 * Parse Markdown string into structured Blocks
 */
export function markdownToBlocks(markdown: string): Block[] {
  if (!markdown || !markdown.trim()) {
    return [
      {
        id: generateBlockId(),
        type: 'paragraph',
        content: '',
      },
    ];
  }

  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const { cleanLine, timestamp } = extractTimestampAnnotation(rawLine);
    const line = cleanLine;

    // Math block ($$ ... $$)
    if (line.trim().startsWith('$$')) {
      if (line.trim().endsWith('$$') && line.trim().length > 4) {
        // Single-line math block
        const formula = line.trim().slice(2, -2).trim();
        blocks.push({
          id: generateBlockId(),
          type: 'math',
          content: formula,
          mathFormula: formula,
        });
        i++;
        continue;
      }

      // Multi-line math block
      let formulaLines: string[] = [];
      const firstLineContent = line.trim().substring(2).trim();
      if (firstLineContent) formulaLines.push(firstLineContent);
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        formulaLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLineContent = lines[i].trim().replace(/\$\$$/, '').trim();
        if (lastLineContent) formulaLines.push(lastLineContent);
        i++;
      }
      const formula = formulaLines.join('\n').trim();
      blocks.push({
        id: generateBlockId(),
        type: 'math',
        content: formula,
        mathFormula: formula,
      });
      continue;
    }

    // Code block (```lang ... ```)
    if (line.trim().startsWith('```')) {
      const language = line.trim().substring(3).trim() || 'typescript';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        id: generateBlockId(),
        type: 'code',
        content: codeLines.join('\n'),
        language,
      });
      continue;
    }

    // Toggle list / Collapsible details (<details><summary>...</summary>...</details>)
    if (line.trim().startsWith('<details>')) {
      let summary = 'تفاصيل / Details';
      const detailLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('</details>')) {
        const dLine = lines[i];
        if (dLine.includes('<summary>')) {
          const match = dLine.match(/<summary>(.*?)<\/summary>/);
          if (match) summary = match[1];
        } else {
          detailLines.push(dLine);
        }
        i++;
      }
      if (i < lines.length) i++; // skip </details>
      blocks.push({
        id: generateBlockId(),
        type: 'toggle-list',
        content: detailLines.join('\n').trim(),
        summary,
        isOpen: false,
      });
      continue;
    }

    // Callout (> [!note] or > [!scholarly] or > [!warning] or > [!quote])
    if (line.trim().startsWith('> [!')) {
      const calloutMatch = line.trim().match(/^>\s*\[!([a-zA-Z]+)\]\s*(.*)$/);
      const calloutType = (calloutMatch ? calloutMatch[1].toLowerCase() : 'note') as any;
      const calloutTitle = calloutMatch ? calloutMatch[2] : '';
      const bodyLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        bodyLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        id: generateBlockId(),
        type: 'callout',
        content: bodyLines.join('\n').trim(),
        calloutType: ['note', 'scholarly', 'warning', 'quote', 'marginalia'].includes(calloutType)
          ? calloutType
          : 'scholarly',
        calloutTitle: calloutTitle || undefined,
      });
      continue;
    }

    // Blockquote (> ...)
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [line.replace(/^>\s?/, '')];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>') && !lines[i].trim().startsWith('> [!')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        id: generateBlockId(),
        type: 'quote',
        content: quoteLines.join('\n').trim(),
      });
      continue;
    }

    // Table (| Col 1 | Col 2 |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Parse markdown table
      const headers = tableLines[0]
        .split('|')
        .slice(1, -1)
        .map(h => h.trim());
      const rows: string[][] = [];
      for (let r = 1; r < tableLines.length; r++) {
        // Skip separator row |---|---|
        if (tableLines[r].replace(/[\s|:-]/g, '').length === 0) continue;
        const cols = tableLines[r]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());
        rows.push(cols);
      }
      blocks.push({
        id: generateBlockId(),
        type: 'table',
        content: '',
        tableData: {
          headers: headers.length ? headers : ['العنوان 1', 'العنوان 2'],
          rows: rows.length ? rows : [['محتوى 1', 'محتوى 2']],
        },
      });
      continue;
    }

    // Divider (--- or ***)
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({
        id: generateBlockId(),
        type: 'divider',
        content: '',
      });
      i++;
      continue;
    }

    // Image (![caption](url))
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'image',
        content: '',
        imageCaption: imgMatch[1],
        imageUrl: imgMatch[2],
      });
      i++;
      continue;
    }

    // Checkbox (- [ ] or - [x])
    const checkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (checkMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'checkbox',
        content: checkMatch[3],
        checked: checkMatch[2].toLowerCase() === 'x',
      });
      i++;
      continue;
    }

    // Bullet list (- item or * item)
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'bullet-list',
        content: bulletMatch[2],
      });
      i++;
      continue;
    }

    // Numbered list (1. item)
    const numMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (numMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'numbered-list',
        content: numMatch[2],
      });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h1',
        content: line.substring(2).trim(),
      });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h2',
        content: line.substring(3).trim(),
      });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h3',
        content: line.substring(4).trim(),
      });
      i++;
      continue;
    }

    // Attach timestamp if found
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && timestamp !== undefined && lastBlock.recordingTimestamp === undefined) {
      lastBlock.recordingTimestamp = timestamp;
    }

    // Default: Paragraph
    if (i < lines.length && lines[i] === rawLine) {
      blocks.push({
        id: generateBlockId(),
        type: 'paragraph',
        content: line,
        recordingTimestamp: timestamp,
      });
      i++;
    }
  }

  return blocks.length > 0
    ? blocks
    : [{ id: generateBlockId(), type: 'paragraph', content: '' }];
}

/**
 * Serialize Blocks back into clean Markdown
 */
export function blocksToMarkdown(blocks: Block[]): string {
  const output: string[] = [];

  for (const block of blocks) {
    let blockText = '';
    const suffix =
      block.recordingTimestamp !== undefined && block.recordingTimestamp > 0
        ? ` ^t=${formatAudioTime(block.recordingTimestamp)}`
        : '';

    switch (block.type) {
      case 'h1':
        blockText = `# ${block.content}${suffix}`;
        break;
      case 'h2':
        blockText = `## ${block.content}${suffix}`;
        break;
      case 'h3':
        blockText = `### ${block.content}${suffix}`;
        break;
      case 'bullet-list':
        blockText = `- ${block.content}${suffix}`;
        break;
      case 'numbered-list':
        blockText = `1. ${block.content}${suffix}`;
        break;
      case 'checkbox':
        blockText = `- [${block.checked ? 'x' : ' '}] ${block.content}${suffix}`;
        break;
      case 'toggle-list':
        blockText = `<details>\n<summary>${block.summary || 'تفاصيل / Details'}</summary>\n${block.content}\n</details>${suffix}`;
        break;
      case 'code':
        blockText = `\`\`\`${block.language || 'typescript'}\n${block.content}\n\`\`\`${suffix}`;
        break;
      case 'quote':
        blockText = block.content
          .split('\n')
          .map(l => `> ${l}`)
          .join('\n') + suffix;
        break;
      case 'callout': {
        const type = block.calloutType || 'scholarly';
        const title = block.calloutTitle ? ` ${block.calloutTitle}` : '';
        const body = block.content
          .split('\n')
          .map(l => `> ${l}`)
          .join('\n');
        blockText = `> [!${type}]${title}\n${body}${suffix}`;
        break;
      }
      case 'divider':
        blockText = '---';
        break;
      case 'table': {
        if (!block.tableData || !block.tableData.headers) {
          blockText = '| Column 1 | Column 2 |\n|---|---|\n| Value 1 | Value 2 |';
        } else {
          const { headers, rows } = block.tableData;
          const headerRow = `| ${headers.join(' | ')} |`;
          const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
          const dataRows = rows.map(r => `| ${r.join(' | ')} |`).join('\n');
          blockText = `${headerRow}\n${sepRow}${dataRows ? '\n' + dataRows : ''}`;
        }
        break;
      }
      case 'image':
        blockText = `![${block.imageCaption || 'image'}](${block.imageUrl || ''})`;
        break;
      case 'math':
        blockText = `$$\n${block.mathFormula || block.content}\n$$${suffix}`;
        break;
      case 'paragraph':
      default:
        blockText = `${block.content}${suffix}`;
        break;
    }

    output.push(blockText);
  }

  return output.join('\n\n');
}
