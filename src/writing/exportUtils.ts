import { isTauri } from '../utils/platform.ts';
import type { Chapter } from './writingProjectTypes.ts';
import { readChapterContent } from './useWritingProjectFs.ts';

export type ExportFormat = 'md' | 'html' | 'pdf' | 'docx';

export interface ExportOptions {
  format: ExportFormat;
  projectDir: string;
  projectTitle: string;
  author: string;
  chapters: Chapter[];
  includeTitlePage: boolean;
}

/**
 * Build a combined markdown document from all project chapters.
 */
export async function buildExportMarkdown(options: ExportOptions): Promise<string> {
  const { projectTitle, author, chapters, includeTitlePage } = options;
  const parts: string[] = [];

  if (includeTitlePage) {
    parts.push(`# ${projectTitle}`);
    if (author) parts.push(`\n*${author}*\n`);
    parts.push('---\n');
  }

  for (const chapter of chapters) {
    const content = await readChapterContent(options.projectDir, chapter);
    parts.push(content);
    parts.push('\n\n---\n\n');
  }

  return parts.join('\n');
}

/**
 * Save content to a file using the Tauri save dialog.
 */
async function saveToFile(defaultName: string, content: string, filterName: string, extensions: string[]): Promise<void> {
  const { save } = await import('@tauri-apps/plugin-dialog');
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: filterName, extensions }],
  });
  if (filePath) {
    await writeTextFile(filePath, content);
  }
}

/**
 * Generate a styled HTML document from markdown content.
 */
async function generateStyledHtml(markdown: string, title: string): Promise<string> {
  let bodyHtml: string;

  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    bodyHtml = await invoke<string>('export_to_html', { markdown });
  } else {
    // Basic markdown-to-HTML for browser mode
    bodyHtml = basicMarkdownToHtml(markdown);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  @page { margin: 2.5cm 2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.8;
    color: #222;
    max-width: 700px;
    margin: 0 auto;
    padding: 0;
  }
  h1 { font-size: 22pt; font-weight: 700; margin: 1.5em 0 0.5em; font-family: 'Helvetica Neue', Arial, sans-serif; }
  h2 { font-size: 18pt; font-weight: 600; margin: 1.3em 0 0.4em; font-family: 'Helvetica Neue', Arial, sans-serif; }
  h3 { font-size: 15pt; font-weight: 600; margin: 1.1em 0 0.3em; font-family: 'Helvetica Neue', Arial, sans-serif; }
  h4 { font-size: 13pt; font-weight: 600; margin: 0.9em 0 0.3em; font-family: 'Helvetica Neue', Arial, sans-serif; }
  p { margin: 0.5em 0; text-align: justify; }
  ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
  li { margin: 0.2em 0; }
  blockquote {
    border-left: 3px solid #ccc;
    margin: 0.8em 0;
    padding: 0.3em 1em;
    color: #555;
    font-style: italic;
  }
  code {
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    font-size: 0.9em;
    background: #f4f4f4;
    padding: 0.15em 0.35em;
    border-radius: 2px;
  }
  pre {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1em;
    margin: 0.8em 0;
    overflow-x: auto;
    font-size: 0.9em;
    line-height: 1.5;
  }
  pre code { background: none; padding: 0; border-radius: 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
  table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
  th, td { border: 1px solid #ddd; padding: 0.4em 0.6em; text-align: left; }
  th { background: #f4f4f4; font-weight: 600; }
  img { max-width: 100%; height: auto; }
  a { color: #2563eb; }
  @media print {
    body { max-width: none; }
  }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/**
 * Basic markdown to HTML conversion for browser-mode PDF export.
 */
function basicMarkdownToHtml(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (fenced)
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '');
      return `<pre><code>${code}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Horizontal rules
    .replace(/^---+/gm, '<hr>')
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  html = '<p>' + html + '</p>';
  return html;
}

/**
 * Export a single markdown document as PDF (for non-project files).
 */
export async function exportSingleDocAsPdf(markdown: string, title: string): Promise<void> {
  const styledHtml = await generateStyledHtml(markdown, title);
  await printToPdf(styledHtml, title);
}

/**
 * Export a project.
 */
export async function exportProject(options: ExportOptions): Promise<void> {
  const markdown = await buildExportMarkdown(options);

  if (!isTauri) {
    // Browser mode: fallback for non-md formats
    if (options.format === 'md') {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.projectTitle}.md`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // For PDF/HTML in browser mode, we still use the print approach
  }

  switch (options.format) {
    case 'md':
      await saveToFile(`${options.projectTitle}.md`, markdown, 'Markdown', ['md']);
      break;

    case 'html': {
      const styledHtml = await generateStyledHtml(markdown, options.projectTitle);
      await saveToFile(`${options.projectTitle}.html`, styledHtml, 'HTML', ['html']);
      break;
    }

    case 'pdf': {
      const styledHtml = await generateStyledHtml(markdown, options.projectTitle);
      await printToPdf(styledHtml, options.projectTitle);
      break;
    }

    case 'docx':
      throw new Error(`${options.format.toUpperCase()} export is not yet available. Please use Markdown or HTML export and convert with external tools.`);
  }
}

/**
 * Open HTML in a new window and trigger the print dialog for "Save as PDF".
 * In Tauri, the webview's print dialog includes a "Save as PDF" option.
 */
async function printToPdf(html: string, _title: string): Promise<void> {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups for PDF export.');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  await new Promise<void>((resolve) => {
    printWindow.onload = () => {
      printWindow.print();
      resolve();
    };
    // Fallback timeout if onload doesn't fire (already-closed document)
    setTimeout(() => {
      printWindow.print();
      resolve();
    }, 500);
  });

  // Close the window after a delay (print dialog is modal in most browsers)
  setTimeout(() => {
    printWindow.close();
  }, 500);
}
