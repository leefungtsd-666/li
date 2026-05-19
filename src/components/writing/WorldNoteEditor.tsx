import { useState, type FormEvent } from 'react';
import type { WorldNote } from '../../writing/writingProjectTypes.ts';

interface WorldNoteEditorProps {
  initial?: WorldNote;
  onSave: (title: string, content: string, tags: string[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function WorldNoteEditor({ initial, onSave, onCancel, onDelete }: WorldNoteEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tagsText, setTagsText] = useState(initial?.tags?.join(', ') ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(title.trim(), content.trim(), tags);
  };

  return (
    <form className="writing-editor-panel" onSubmit={handleSubmit}>
      <div>
        <div className="field-label">Title</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
          placeholder="Note title"
        />
      </div>
      <div>
        <div className="field-label">Content</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content..."
          style={{ minHeight: 120 }}
        />
      </div>
      <div>
        <div className="field-label">Tags (comma-separated)</div>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="history, geography, magic"
        />
      </div>
      <div className="writing-editor-actions">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 12,
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              marginRight: 'auto',
            }}
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 12,
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 12,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
}
