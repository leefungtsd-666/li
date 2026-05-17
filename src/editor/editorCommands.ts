import type { EditorController } from './editorTypes.ts';

export function getEditorContent(controller: EditorController | null): string {
  if (!controller) return '';
  return controller.getContent();
}

export function setEditorContent(
  controller: EditorController | null,
  content: string,
): void {
  if (!controller) return;
  controller.setContent(content);
}
