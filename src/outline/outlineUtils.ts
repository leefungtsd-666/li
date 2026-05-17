import type { OutlineItemData } from './outlineTypes.ts';
import { makeHeadingId } from '../utils/slug.ts';

const HEADING_REGEX = /^(#{1,4})\s+(.+)$/gm;

export function extractHeadings(markdown: string): OutlineItemData[] {
  const items: OutlineItemData[] = [];
  let match: RegExpExecArray | null;
  let index = 0;
  const seen = new Set<string>();
  while ((match = HEADING_REGEX.exec(markdown)) !== null) {
    const level = match[1].length as 1 | 2 | 3 | 4;
    const text = match[2].trim();
    if (!text) continue;
    const baseId = makeHeadingId(text, index);
    let id = baseId;
    let counter = 1;
    while (seen.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    seen.add(id);
    items.push({ id, text, level, index });
    index++;
  }
  return items;
}
