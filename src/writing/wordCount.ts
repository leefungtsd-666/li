import type { WordCountStats } from './writingProjectTypes.ts';

const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
const WORD_REGEX = /[a-zA-Z]+(?:[''][a-zA-Z]+)?/g;

export function countWords(markdown: string): WordCountStats {
  const chineseChars = (markdown.match(CJK_REGEX) || []).length;
  const englishWords = (markdown.match(WORD_REGEX) || []).length;
  const totalChars = markdown.length;
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~>`]/g, '')
    .replace(/[|:\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const cjkInStripped = (stripped.match(CJK_REGEX) || []).length;
  const wordsInStripped = (stripped.match(WORD_REGEX) || []).length;
  const approximateTextLength = cjkInStripped + wordsInStripped;

  return {
    chineseChars,
    englishWords,
    totalChars,
    approximateTextLength,
  };
}
