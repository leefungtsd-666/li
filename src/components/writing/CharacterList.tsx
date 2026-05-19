import { useState } from 'react';
import type { CharacterProfile } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';
import { CharacterEditor } from './CharacterEditor.tsx';

interface CharacterListProps {
  characters: CharacterProfile[];
  onAddCharacter: (name: string, role: string, description: string, notes: string) => void;
  onUpdateCharacter: (id: string, updates: Partial<CharacterProfile>) => void;
  onRemoveCharacter: (id: string) => void;
}

export function CharacterList({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onRemoveCharacter,
}: CharacterListProps) {
  const { t } = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="writing-sidebar-header">
        <span className="writing-sidebar-header-title">{t('writing.characters')}</span>
        <button
          className="writing-sidebar-btn"
          onClick={() => setShowAdd(true)}
          title={t('writing.addCharacter')}
        >
          +
        </button>
      </div>

      {showAdd && (
        <CharacterEditor
          onSave={(name, role, desc, notes) => {
            onAddCharacter(name, role, desc, notes);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {characters.length === 0 && !showAdd ? (
        <div className="writing-empty">{t('writing.addCharacter')}</div>
      ) : (
        characters.map((char) =>
          editingId === char.id ? (
            <CharacterEditor
              key={char.id}
              initial={char}
              onSave={(name, role, desc, notes) => {
                onUpdateCharacter(char.id, { name, role, description: desc, notes });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={() => {
                onRemoveCharacter(char.id);
                setEditingId(null);
              }}
            />
          ) : (
            <div
              key={char.id}
              className="writing-list-item"
              onClick={() => setEditingId(char.id)}
              style={{ cursor: 'pointer' }}
            >
              <span className="writing-list-item-title">{char.name}</span>
              {char.role && <span className="writing-list-item-meta">{char.role}</span>}
            </div>
          ),
        )
      )}
    </div>
  );
}
