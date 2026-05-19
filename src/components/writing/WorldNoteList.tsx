import { useState } from 'react';
import type { WorldNote } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';
import { WorldNoteEditor } from './WorldNoteEditor.tsx';

interface WorldNoteListProps {
  worldNotes: WorldNote[];
  onAddWorldNote: (title: string, content: string, tags: string[]) => void;
  onUpdateWorldNote: (id: string, updates: Partial<WorldNote>) => void;
  onRemoveWorldNote: (id: string) => void;
}

export function WorldNoteList({
  worldNotes,
  onAddWorldNote,
  onUpdateWorldNote,
  onRemoveWorldNote,
}: WorldNoteListProps) {
  const { t } = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="writing-sidebar-header">
        <span className="writing-sidebar-header-title">{t('writing.worldNotes')}</span>
        <button
          className="writing-sidebar-btn"
          onClick={() => setShowAdd(true)}
          title={t('writing.addWorldNote')}
        >
          +
        </button>
      </div>

      {showAdd && (
        <WorldNoteEditor
          onSave={(title, content, tags) => {
            onAddWorldNote(title, content, tags);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {worldNotes.length === 0 && !showAdd ? (
        <div className="writing-empty">{t('writing.addWorldNote')}</div>
      ) : (
        worldNotes.map((note) =>
          editingId === note.id ? (
            <WorldNoteEditor
              key={note.id}
              initial={note}
              onSave={(title, content, tags) => {
                onUpdateWorldNote(note.id, { title, content, tags });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => {
                onRemoveWorldNote(note.id);
                setEditingId(null);
              }}
            />
          ) : (
            <div
              key={note.id}
              className="writing-list-item"
              onClick={() => setEditingId(note.id)}
              style={{ cursor: 'pointer' }}
            >
              <span className="writing-list-item-title">{note.title}</span>
              {note.tags.length > 0 && (
                <span className="writing-list-item-meta">{note.tags[0]}</span>
              )}
            </div>
          ),
        )
      )}
    </div>
  );
}
