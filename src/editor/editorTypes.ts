export type EditorMode = 'render' | 'source';

export interface FindMatch {
  from: number;
  to: number;
  text: string;
}

export interface EditorController {
  getContent: () => string;
  setContent: (content: string) => void;
  getSelectedText: () => string;
  selectAll: () => void;
  focus: () => void;
  destroy: () => void;

  // Find & Replace
  getRenderedText: () => string;
  findAllMatches: (query: string) => FindMatch[];
  selectRange: (from: number, to: number) => void;
  replaceCurrent: (replacement: string) => boolean;
  replaceAllMatches: (query: string, replacement: string) => number;
  highlightMatches: (matches: FindMatch[], activeIndex: number) => void;
  clearHighlights: () => void;

  // Formatting commands
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleStrikethrough: () => void;
  setHeading: (level: 0 | 1 | 2 | 3 | 4) => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  toggleBlockquote: () => void;
  toggleCodeBlock: () => void;
  insertLink: (url: string, text?: string) => void;
  insertImage: (src: string, alt?: string) => void;
}
