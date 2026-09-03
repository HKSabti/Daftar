/**
 * Arabic Text Normalization and Bidi Utilities
 * Used for FTS indexing, queries, and proper scholarly layout rendering.
 */

// Regular expressions for Arabic diacritics (Harakat / Tashkeel)
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL_REGEX = /\u0640/g;

/**
 * Normalizes Arabic text by:
 * 1. Stripping Tashkeel (diacritics: fathah, kasrah, dammah, tanwin, sukun, shaddah)
 * 2. Unifying Alef forms (أ, إ, آ, ٱ -> ا)
 * 3. Unifying Teh Marbuta (ة -> ه)
 * 4. Unifying Alef Maksura & Yaa (ى -> ي)
 * 5. Removing Tatweel (ـ)
 * 6. Normalizing Persian/Urdu variants (ک -> ك, ی -> ي)
 */
export function normalizeArabic(text: string): string {
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

/**
 * Detects if a text or block predominantly starts with or contains Arabic characters.
 */
export function isArabicText(text: string): boolean {
  if (!text) return false;
  // Arabic Unicode ranges: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF
  const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
  const totalChars = text.replace(/[\s\d\p{P}]/gu, '');
  if (!totalChars.length) return false;
  return (arabicChars ? arabicChars.length : 0) / totalChars.length > 0.3;
}

/**
 * Extract #tags from text.
 * Handles both Latin tags (#philosophy) and Arabic tags (#فلسفة_العلوم).
 */
export function extractTags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([\w\u0600-\u06FF_-]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(t => t.slice(1))));
}

/**
 * Extract [[wiki-links]] from text.
 * Supports [[Note Title]] and [[Note Title|Custom Label]].
 */
export interface ExtractedWikiLink {
  raw: string;
  target: string;
  label?: string;
  index: number;
}

export function extractWikiLinks(text: string): ExtractedWikiLink[] {
  if (!text) return [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: ExtractedWikiLink[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    links.push({
      raw: match[0],
      target: match[1].trim(),
      label: match[2] ? match[2].trim() : undefined,
      index: match.index,
    });
  }
  return links;
}
