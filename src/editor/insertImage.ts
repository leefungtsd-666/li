import { isTauri } from '../utils/platform.ts';

/**
 * Handle an image paste event. If the clipboard contains image data,
 * save it to disk (in Tauri mode) and return the markdown image syntax.
 * In browser mode, return a data URI-based image syntax.
 */
export async function handleImagePaste(
  projectDir: string | null,
): Promise<{ src: string; alt: string } | null> {
  if (!isTauri || !projectDir) return null;

  const clipboardItems = await navigator.clipboard.read();
  for (const item of clipboardItems) {
    const imageType = item.types.find((t) => t.startsWith('image/'));
    if (!imageType) continue;

    const blob = await item.getType(imageType);
    const buffer = await blob.arrayBuffer();
    const ext = imageType.split('/')[1] || 'png';
    const fileName = `pasted-${Date.now()}.${ext}`;
    const imagesDir = `${projectDir}/images`;
    const filePath = `${imagesDir}/${fileName}`;

    try {
      // Ensure images directory exists
      const { mkdir, writeFile } = await import('@tauri-apps/plugin-fs');
      await mkdir(imagesDir, { recursive: true });
      await writeFile(filePath, new Uint8Array(buffer));
      return { src: `images/${fileName}`, alt: '' };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Show a file dialog to pick an image file and copy it to the project.
 */
export async function pickAndCopyImage(
  projectDir: string | null,
): Promise<{ src: string; alt: string } | null> {
  if (!isTauri) {
    // Browser mode: prompt for URL
    const url = prompt('Enter image URL:');
    if (!url) return null;
    return { src: url, alt: '' };
  }

  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'] }],
    });
    if (!selected || typeof selected !== 'string') return null;

    if (!projectDir) return { src: selected, alt: '' };

    // Copy to project images directory
    const fileName = selected.replace(/^.*[/\\]/, '');
    const imagesDir = `${projectDir}/images`;
    const destPath = `${imagesDir}/${fileName}`;

    const { copyFile, mkdir } = await import('@tauri-apps/plugin-fs');
    await mkdir(imagesDir, { recursive: true });
    await copyFile(selected, destPath);

    return { src: `images/${fileName}`, alt: '' };
  } catch {
    return null;
  }
}
