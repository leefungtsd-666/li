import { useState, type FormEvent } from 'react';
import type { CharacterProfile } from '../../writing/writingProjectTypes.ts';

interface CharacterEditorProps {
  initial?: CharacterProfile;
  onSave: (name: string, role: string, description: string, notes: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function CharacterEditor({ initial, onSave, onCancel, onDelete }: CharacterEditorProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), role.trim(), description.trim(), notes.trim());
  };

  return (
    <form className="writing-editor-panel" onSubmit={handleSubmit}>
      <div>
        <div className="field-label">Name</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
          placeholder="Name"
        />
      </div>
      <div>
        <div className="field-label">Role</div>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role (e.g. protagonist)"
        />
      </div>
      <div>
        <div className="field-label">Description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Character description..."
        />
      </div>
      <div>
        <div className="field-label">Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
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
