import { isTauri } from '../utils/platform.ts';

export async function readFile(path: string): Promise<string> {
  if (!isTauri) {
    throw new Error(
      'File system is not available in browser dev mode. ' +
        'Please run in Tauri desktop mode to read files.',
    );
  }
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return await readTextFile(path);
}

export async function writeFile(path: string, content: string): Promise<void> {
  if (!isTauri) {
    throw new Error(
      'File system is not available in browser dev mode. ' +
        'Please run in Tauri desktop mode to write files.',
    );
  }
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  await writeTextFile(path, content);
}

export async function showOpenDialog(): Promise<string | null> {
  if (!isTauri) {
    throw new Error(
      'File dialog is not available in browser dev mode. ' +
        'Please run in Tauri desktop mode to open files.',
    );
  }
  const { open } = await import('@tauri-apps/plugin-dialog');
  const result = await open({
    multiple: false,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown'],
      },
    ],
  });
  return result as string | null;
}

export async function showSaveDialog(defaultName: string): Promise<string | null> {
  if (!isTauri) {
    throw new Error(
      'File dialog is not available in browser dev mode. ' +
        'Please run in Tauri desktop mode to save files.',
    );
  }
  const { save } = await import('@tauri-apps/plugin-dialog');
  const result = await save({
    defaultPath: defaultName,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md'],
      },
    ],
  });
  return result as string | null;
}
