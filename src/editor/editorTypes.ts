export type EditorMode = 'render' | 'source';

export interface EditorController {
  getContent: () => string;
  setContent: (content: string) => void;
  getSelectedText: () => string;
  selectAll: () => void;
  focus: () => void;
  destroy: () => void;
}
