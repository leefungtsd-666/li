import { useCallback, useReducer, useRef } from 'react';
import type {
  WritingProjectData,
  WritingProjectMeta,
  WritingProjectState,
  Chapter,
  CharacterProfile,
  WorldNote,
  WordCountTarget,
} from './writingProjectTypes.ts';
import { EMPTY_PROJECT_META, DEFAULT_WORD_COUNT_TARGET } from './writingProjectTypes.ts';
import {
  createProject as fsCreateProject,
  loadProject as fsLoadProject,
  saveProjectMeta as fsSaveProjectMeta,
  createChapterFile as fsCreateChapterFile,
  readChapterContent as fsReadChapterContent,
  writeChapterContent as fsWriteChapterContent,
  deleteChapterFile as fsDeleteChapterFile,
  pickProjectDirectory,
  isValidProject,
} from './useWritingProjectFs.ts';

// ---- Reducer ----

type Action =
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'LOAD_PROJECT'; projectDir: string; data: WritingProjectData }
  | { type: 'UNLOAD_PROJECT' }
  | { type: 'SET_META'; meta: WritingProjectMeta }
  | { type: 'SET_ACTIVE_CHAPTER'; chapterId: string | null }
  | { type: 'SET_CHAPTERS'; chapters: Chapter[] }
  | { type: 'ADD_CHAPTER'; chapter: Chapter }
  | { type: 'UPDATE_CHAPTER'; chapterId: string; updates: Partial<Chapter> }
  | { type: 'REMOVE_CHAPTER'; chapterId: string }
  | { type: 'SET_CHARACTERS'; characters: CharacterProfile[] }
  | { type: 'ADD_CHARACTER'; character: CharacterProfile }
  | { type: 'UPDATE_CHARACTER'; characterId: string; updates: Partial<CharacterProfile> }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | { type: 'SET_WORLD_NOTES'; worldNotes: WorldNote[] }
  | { type: 'ADD_WORLD_NOTE'; worldNote: WorldNote }
  | { type: 'UPDATE_WORLD_NOTE'; noteId: string; updates: Partial<WorldNote> }
  | { type: 'REMOVE_WORLD_NOTE'; noteId: string }
  | { type: 'SET_WORD_COUNT_TARGET'; target: WordCountTarget }
  | { type: 'MARK_CLEAN' };

const EMPTY_STATE: WritingProjectState = {
  projectDir: null,
  meta: EMPTY_PROJECT_META,
  chapters: [],
  characters: [],
  worldNotes: [],
  wordCountTarget: DEFAULT_WORD_COUNT_TARGET,
  activeChapterId: null,
  isLoading: false,
  isDirty: false,
};

function reducer(state: WritingProjectState, action: Action): WritingProjectState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };

    case 'LOAD_PROJECT':
      return {
        ...EMPTY_STATE,
        projectDir: action.projectDir,
        meta: action.data.meta,
        chapters: action.data.chapters,
        characters: action.data.characters,
        worldNotes: action.data.worldNotes,
        wordCountTarget: action.data.wordCountTarget,
        activeChapterId: action.data.chapters.length > 0 ? action.data.chapters[0].id : null,
        isLoading: false,
        isDirty: false,
      };

    case 'UNLOAD_PROJECT':
      return { ...EMPTY_STATE };

    case 'SET_META':
      return { ...state, meta: action.meta, isDirty: true };

    case 'SET_ACTIVE_CHAPTER':
      return { ...state, activeChapterId: action.chapterId };

    case 'SET_CHAPTERS':
      return { ...state, chapters: action.chapters, isDirty: true };

    case 'ADD_CHAPTER':
      return {
        ...state,
        chapters: [...state.chapters, action.chapter],
        isDirty: true,
      };

    case 'UPDATE_CHAPTER':
      return {
        ...state,
        chapters: state.chapters.map((c) =>
          c.id === action.chapterId
            ? { ...c, ...action.updates, updatedAt: new Date().toISOString() }
            : c,
        ),
        isDirty: true,
      };

    case 'REMOVE_CHAPTER':
      return {
        ...state,
        chapters: state.chapters.filter((c) => c.id !== action.chapterId),
        activeChapterId:
          state.activeChapterId === action.chapterId ? null : state.activeChapterId,
        isDirty: true,
      };

    case 'SET_CHARACTERS':
      return { ...state, characters: action.characters, isDirty: true };

    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, action.character],
        isDirty: true,
      };

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.characterId
            ? { ...c, ...action.updates, updatedAt: new Date().toISOString() }
            : c,
        ),
        isDirty: true,
      };

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.characterId),
        isDirty: true,
      };

    case 'SET_WORLD_NOTES':
      return { ...state, worldNotes: action.worldNotes, isDirty: true };

    case 'ADD_WORLD_NOTE':
      return {
        ...state,
        worldNotes: [...state.worldNotes, action.worldNote],
        isDirty: true,
      };

    case 'UPDATE_WORLD_NOTE':
      return {
        ...state,
        worldNotes: state.worldNotes.map((n) =>
          n.id === action.noteId
            ? { ...n, ...action.updates, updatedAt: new Date().toISOString() }
            : n,
        ),
        isDirty: true,
      };

    case 'REMOVE_WORLD_NOTE':
      return {
        ...state,
        worldNotes: state.worldNotes.filter((n) => n.id !== action.noteId),
        isDirty: true,
      };

    case 'SET_WORD_COUNT_TARGET':
      return { ...state, wordCountTarget: action.target, isDirty: true };

    case 'MARK_CLEAN':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

// ---- Hook ----

export function useWritingProject() {
  const [state, dispatch] = useReducer(reducer, EMPTY_STATE);
  const activeContentRef = useRef<string>('');
  const dirtyChaptersRef = useRef<Set<string>>(new Set());

  // ---- Project Open/Close ----

  const createNewProject = useCallback(
    async (projectDir: string, title: string, author: string, description: string) => {
      dispatch({ type: 'SET_LOADING', value: true });
      try {
        const data = await fsCreateProject(projectDir, { title, author, description });
        dispatch({ type: 'LOAD_PROJECT', projectDir, data });
      } catch {
        dispatch({ type: 'SET_LOADING', value: false });
        throw new Error('Failed to create project');
      }
    },
    [],
  );

  const openProject = useCallback(async (projectDir: string) => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const data = await fsLoadProject(projectDir);
      if (!data) {
        dispatch({ type: 'SET_LOADING', value: false });
        return false;
      }
      dispatch({ type: 'LOAD_PROJECT', projectDir, data });
      return true;
    } catch {
      dispatch({ type: 'SET_LOADING', value: false });
      return false;
    }
  }, []);

  const closeProject = useCallback(() => {
    dispatch({ type: 'UNLOAD_PROJECT' });
    activeContentRef.current = '';
    dirtyChaptersRef.current.clear();
  }, []);

  const validateAndOpenProject = useCallback(
    async (projectDir: string) => {
      const valid = await isValidProject(projectDir);
      if (!valid) return false;
      return openProject(projectDir);
    },
    [openProject],
  );

  const pickAndOpenProject = useCallback(async (): Promise<string | null> => {
    const dir = await pickProjectDirectory();
    if (!dir) return null;
    const ok = await openProject(dir);
    return ok ? dir : null;
  }, [openProject]);

  // ---- Save ----

  const saveProject = useCallback(async () => {
    if (!state.projectDir) return;

    const data: WritingProjectData = {
      meta: state.meta,
      chapters: state.chapters,
      characters: state.characters,
      worldNotes: state.worldNotes,
      wordCountTarget: state.wordCountTarget,
    };

    await fsSaveProjectMeta(state.projectDir, data);
    dispatch({ type: 'MARK_CLEAN' });
  }, [
    state.projectDir,
    state.meta,
    state.chapters,
    state.characters,
    state.worldNotes,
    state.wordCountTarget,
  ]);

  // ---- Meta ----

  const updateMeta = useCallback((meta: WritingProjectMeta) => {
    dispatch({ type: 'SET_META', meta });
  }, []);

  // ---- Chapter CRUD ----

  const activeChapter =
    state.chapters.find((c) => c.id === state.activeChapterId) ?? null;

  const setActiveChapter = useCallback((chapterId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAPTER', chapterId });
  }, []);

  const loadChapterContent = useCallback(
    async (chapterId: string): Promise<string> => {
      if (!state.projectDir) return '';
      const chapter = state.chapters.find((c) => c.id === chapterId);
      if (!chapter) return '';
      const content = await fsReadChapterContent(state.projectDir, chapter);
      activeContentRef.current = content;
      dirtyChaptersRef.current.delete(chapterId);
      return content;
    },
    [state.projectDir, state.chapters],
  );

  const setActiveChapterContent = useCallback(
    (content: string) => {
      activeContentRef.current = content;
      if (state.activeChapterId) {
        dirtyChaptersRef.current.add(state.activeChapterId);
      }
    },
    [state.activeChapterId],
  );

  const saveActiveChapter = useCallback(async () => {
    if (!state.projectDir || !state.activeChapterId) return;
    const chapter = state.chapters.find((c) => c.id === state.activeChapterId);
    if (!chapter) return;
    await fsWriteChapterContent(state.projectDir, chapter, activeContentRef.current);
    dirtyChaptersRef.current.delete(state.activeChapterId);
  }, [state.projectDir, state.activeChapterId, state.chapters]);

  const addChapter = useCallback(
    async (title: string) => {
      if (!state.projectDir) return null;
      const now = new Date().toISOString();
      const order = state.chapters.length + 1;
      const paddedOrder = String(order).padStart(2, '0');
      const safeName = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, '') || 'untitled';
      const fileName = `${paddedOrder}-${safeName}.md`;

      const chapter: Chapter = {
        id: crypto.randomUUID(),
        title,
        order,
        file: `chapters/${fileName}`,
        wordCount: {
          chineseChars: 0,
          englishWords: 0,
          totalChars: 0,
          approximateTextLength: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      await fsCreateChapterFile(state.projectDir, chapter);
      dispatch({ type: 'ADD_CHAPTER', chapter });
      return chapter;
    },
    [state.projectDir, state.chapters],
  );

  const updateChapter = useCallback(
    (chapterId: string, updates: Partial<Chapter>) => {
      dispatch({ type: 'UPDATE_CHAPTER', chapterId, updates });
    },
    [],
  );

  const removeChapter = useCallback(
    async (chapterId: string) => {
      if (!state.projectDir) return;
      const chapter = state.chapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      await fsDeleteChapterFile(state.projectDir, chapter);
      dispatch({ type: 'REMOVE_CHAPTER', chapterId });
      dirtyChaptersRef.current.delete(chapterId);
    },
    [state.projectDir, state.chapters],
  );

  const reorderChapters = useCallback((chapters: Chapter[]) => {
    const reordered = chapters.map((c, i) => ({
      ...c,
      order: i + 1,
      updatedAt: new Date().toISOString(),
    }));
    dispatch({ type: 'SET_CHAPTERS', chapters: reordered });
  }, []);

  // ---- Character CRUD ----

  const addCharacter = useCallback(
    (name: string, role: string = '', description: string = '', notes: string = '') => {
      const now = new Date().toISOString();
      const character: CharacterProfile = {
        id: crypto.randomUUID(),
        name,
        role,
        description,
        notes,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_CHARACTER', character });
      return character;
    },
    [],
  );

  const updateCharacter = useCallback(
    (characterId: string, updates: Partial<CharacterProfile>) => {
      dispatch({ type: 'UPDATE_CHARACTER', characterId, updates });
    },
    [],
  );

  const removeCharacter = useCallback((characterId: string) => {
    dispatch({ type: 'REMOVE_CHARACTER', characterId });
  }, []);

  // ---- World Note CRUD ----

  const addWorldNote = useCallback(
    (title: string, content: string = '', tags: string[] = []) => {
      const now = new Date().toISOString();
      const note: WorldNote = {
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_WORLD_NOTE', worldNote: note });
      return note;
    },
    [],
  );

  const updateWorldNote = useCallback(
    (noteId: string, updates: Partial<WorldNote>) => {
      dispatch({ type: 'UPDATE_WORLD_NOTE', noteId, updates });
    },
    [],
  );

  const removeWorldNote = useCallback((noteId: string) => {
    dispatch({ type: 'REMOVE_WORLD_NOTE', noteId });
  }, []);

  // ---- Word Count Target ----

  const setWordCountTarget = useCallback((target: WordCountTarget) => {
    dispatch({ type: 'SET_WORD_COUNT_TARGET', target });
  }, []);

  return {
    // State
    state,
    activeChapter,
    activeContentRef,

    // Project
    createNewProject,
    openProject,
    closeProject,
    validateAndOpenProject,
    pickAndOpenProject,
    saveProject,
    updateMeta,

    // Chapters
    setActiveChapter,
    loadChapterContent,
    setActiveChapterContent,
    saveActiveChapter,
    addChapter,
    updateChapter,
    removeChapter,
    reorderChapters,

    // Characters
    addCharacter,
    updateCharacter,
    removeCharacter,

    // World Notes
    addWorldNote,
    updateWorldNote,
    removeWorldNote,

    // Word Count Target
    setWordCountTarget,
  };
}
