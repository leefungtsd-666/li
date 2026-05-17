export interface DocumentState {
  filePath: string | null;
  fileName: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
  isLoading: boolean;
  fileToken: number;
}

export const EMPTY_DOCUMENT: DocumentState = {
  filePath: null,
  fileName: 'Untitled.md',
  content: '',
  savedContent: '',
  isDirty: false,
  isLoading: false,
  fileToken: 0,
};
