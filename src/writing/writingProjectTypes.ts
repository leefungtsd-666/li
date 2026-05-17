export interface WritingProject {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  chapters: Chapter[];
  characters: CharacterProfile[];
  worldNotes: WorldNote[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  content: string;
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
}

export interface WorldNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface WordCountStats {
  chineseChars: number;
  englishWords: number;
  totalChars: number;
  approximateTextLength: number;
}
