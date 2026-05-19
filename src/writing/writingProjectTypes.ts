export interface WritingProjectMeta {
  version: number;
  id: string;
  title: string;
  author: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  /** Relative path within project dir, e.g. "chapters/01-intro.md" */
  file: string;
  wordCount: WordCountStats;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WordCountStats {
  chineseChars: number;
  englishWords: number;
  totalChars: number;
  approximateTextLength: number;
}

export interface WordCountTarget {
  daily: number;
  weekly: number;
  project: number;
}

/** Serialized form of a project file on disk */
export interface WritingProjectData {
  meta: WritingProjectMeta;
  chapters: Chapter[];
  characters: CharacterProfile[];
  worldNotes: WorldNote[];
  wordCountTarget: WordCountTarget;
}

/** Runtime state for the writing project hook */
export interface WritingProjectState {
  projectDir: string | null;
  meta: WritingProjectMeta;
  chapters: Chapter[];
  characters: CharacterProfile[];
  worldNotes: WorldNote[];
  wordCountTarget: WordCountTarget;
  activeChapterId: string | null;
  isLoading: boolean;
  isDirty: boolean;
}

export interface WritingStats {
  dailyStats: Record<string, number>;
  currentSessionWords: number;
}

export interface RecentProjectEntry {
  projectDir: string;
  title: string;
  lastOpenedAt: number;
}

export const EMPTY_PROJECT_META: WritingProjectMeta = {
  version: 1,
  id: '',
  title: 'Untitled Project',
  author: '',
  description: '',
  createdAt: '',
  updatedAt: '',
};

export const DEFAULT_WORD_COUNT_TARGET: WordCountTarget = {
  daily: 500,
  weekly: 3500,
  project: 50000,
};
