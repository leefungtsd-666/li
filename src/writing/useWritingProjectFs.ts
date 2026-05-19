import { isTauri } from '../utils/platform.ts';
import type {
  WritingProjectData,
  WritingProjectMeta,
  Chapter,
} from './writingProjectTypes.ts';
import { PROJECT_FILE_NAME, CHAPTERS_DIR_NAME } from './projectConstants.ts';

// ---- Types ----

export interface CreateProjectOptions {
  title: string;
  author: string;
  description: string;
}

// ---- Helpers ----

async function readTextFile(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

async function writeTextFile(path: string, content: string): Promise<void> {
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  return writeTextFile(path, content);
}

async function createDir(path: string): Promise<void> {
  const { mkdir } = await import('@tauri-apps/plugin-fs');
  await mkdir(path, { recursive: true });
}

async function removeFile(path: string): Promise<void> {
  const { remove } = await import('@tauri-apps/plugin-fs');
  await remove(path);
}

async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const { rename } = await import('@tauri-apps/plugin-fs');
  await rename(oldPath, newPath);
}

async function readDir(path: string): Promise<string[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs');
  const entries = await readDir(path);
  return entries
    .filter((e) => e.isFile || e.name?.endsWith('.md'))
    .map((e) => e.name!)
    .filter(Boolean);
}

// ---- Project CRUD ----

/**
 * Create a new writing project directory with project.json and chapters/ dir.
 */
export async function createProject(
  projectDir: string,
  options: CreateProjectOptions,
): Promise<WritingProjectData> {
  if (!isTauri) throw new Error('Browser mode');

  const now = new Date().toISOString();
  const meta: WritingProjectMeta = {
    version: 1,
    id: crypto.randomUUID(),
    title: options.title,
    author: options.author,
    description: options.description,
    createdAt: now,
    updatedAt: now,
  };

  const data: WritingProjectData = {
    meta,
    chapters: [],
    characters: [],
    worldNotes: [],
    wordCountTarget: { daily: 500, weekly: 3500, project: 50000 },
  };

  // Create directories
  await createDir(projectDir);
  await createDir(`${projectDir}/${CHAPTERS_DIR_NAME}`);

  // Write project.json
  await writeTextFile(`${projectDir}/${PROJECT_FILE_NAME}`, JSON.stringify(data, null, 2));

  return data;
}

/**
 * Load project data from a project directory.
 */
export async function loadProject(projectDir: string): Promise<WritingProjectData | null> {
  if (!isTauri) return null;

  try {
    const raw = await readTextFile(`${projectDir}/${PROJECT_FILE_NAME}`);
    return JSON.parse(raw) as WritingProjectData;
  } catch {
    return null;
  }
}

/**
 * Save project data (meta, characters, worldNotes, wordCountTarget) to project.json.
 * Chapters are saved individually.
 */
export async function saveProjectMeta(projectDir: string, data: WritingProjectData): Promise<void> {
  if (!isTauri) return;

  data.meta.updatedAt = new Date().toISOString();
  await writeTextFile(`${projectDir}/${PROJECT_FILE_NAME}`, JSON.stringify(data, null, 2));
}

/**
 * Check if a directory is a valid li project (has project.json).
 */
export async function isValidProject(projectDir: string): Promise<boolean> {
  if (!isTauri) return false;

  try {
    const { exists } = await import('@tauri-apps/plugin-fs');
    return await exists(`${projectDir}/${PROJECT_FILE_NAME}`);
  } catch {
    return false;
  }
}

// ---- Chapter File Operations ----

export function getChapterFilePath(projectDir: string, chapter: Chapter): string {
  return `${projectDir}/${chapter.file}`;
}

/**
 * Read a chapter's markdown content.
 */
export async function readChapterContent(projectDir: string, chapter: Chapter): Promise<string> {
  if (!isTauri) return '';
  try {
    return await readTextFile(getChapterFilePath(projectDir, chapter));
  } catch {
    return '';
  }
}

/**
 * Write a chapter's markdown content.
 */
export async function writeChapterContent(
  projectDir: string,
  chapter: Chapter,
  content: string,
): Promise<void> {
  if (!isTauri) return;
  await writeTextFile(getChapterFilePath(projectDir, chapter), content);
}

/**
 * Create a new chapter file and return the updated Chapter object.
 */
export async function createChapterFile(
  projectDir: string,
  chapter: Chapter,
): Promise<void> {
  if (!isTauri) return;
  const filePath = getChapterFilePath(projectDir, chapter);
  await writeTextFile(filePath, `# ${chapter.title}\n\n`);
}

/**
 * Delete a chapter file.
 */
export async function deleteChapterFile(projectDir: string, chapter: Chapter): Promise<void> {
  if (!isTauri) return;
  try {
    await removeFile(getChapterFilePath(projectDir, chapter));
  } catch {
    // file may not exist
  }
}

/**
 * Rename a chapter file (e.g. when order changes).
 */
export async function renameChapterFile(
  projectDir: string,
  oldChapter: Chapter,
  newChapter: Chapter,
): Promise<void> {
  if (!isTauri) return;
  if (oldChapter.file === newChapter.file) return;
  try {
    await renameFile(
      getChapterFilePath(projectDir, oldChapter),
      getChapterFilePath(projectDir, newChapter),
    );
  } catch {
    // ignore
  }
}

/**
 * List chapter files already on disk (for reconciliation).
 */
export async function listChapterFiles(projectDir: string): Promise<string[]> {
  if (!isTauri) return [];
  try {
    return await readDir(`${projectDir}/${CHAPTERS_DIR_NAME}`);
  } catch {
    return [];
  }
}

// ---- Dialog ----

/**
 * Show a dialog to pick a project directory.
 * Returns the selected path, or null if cancelled.
 */
export async function pickProjectDirectory(): Promise<string | null> {
  if (!isTauri) return null;
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const result = await open({
      directory: true,
      multiple: false,
      title: 'Select Project Directory',
    });
    if (result && typeof result === 'string') {
      return result;
    }
    // In Tauri v2, open() with directory:true returns string | null
    return null;
  } catch {
    return null;
  }
}
