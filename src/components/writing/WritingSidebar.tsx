import { useState } from 'react';
import type { Chapter, CharacterProfile, WorldNote } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';
import { ChapterList } from './ChapterList.tsx';
import { CharacterList } from './CharacterList.tsx';
import { WorldNoteList } from './WorldNoteList.tsx';
import { WordCountProgress } from './WordCountProgress.tsx';
import type { WordCountTarget, WordCountStats } from '../../writing/writingProjectTypes.ts';

type Tab = 'chapters' | 'characters' | 'worldnotes';

interface WritingSidebarProps {
  chapters: Chapter[];
  characters: CharacterProfile[];
  worldNotes: WorldNote[];
  activeChapterId: string | null;
  wordCountTarget: WordCountTarget;
  wordCountStats: WordCountStats;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onRenameChapter: (chapterId: string, title: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorderChapters: (chapters: Chapter[]) => void;
  onAddCharacter: (name: string, role: string, description: string, notes: string) => void;
  onUpdateCharacter: (id: string, updates: Partial<CharacterProfile>) => void;
  onRemoveCharacter: (id: string) => void;
  onAddWorldNote: (title: string, content: string, tags: string[]) => void;
  onUpdateWorldNote: (id: string, updates: Partial<WorldNote>) => void;
  onRemoveWorldNote: (id: string) => void;
  onSetWordCountTarget: (target: WordCountTarget) => void;
  onShowStats?: () => void;
}

export function WritingSidebar({
  chapters,
  characters,
  worldNotes,
  activeChapterId,
  wordCountTarget,
  wordCountStats,
  onSelectChapter,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onReorderChapters,
  onAddCharacter,
  onUpdateCharacter,
  onRemoveCharacter,
  onAddWorldNote,
  onUpdateWorldNote,
  onRemoveWorldNote,
  onSetWordCountTarget,
  onShowStats,
}: WritingSidebarProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('chapters');

  return (
    <div className="writing-sidebar">
      <div className="writing-sidebar-tabs">
        <button
          className={`writing-sidebar-tab ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          {t('writing.chapters')}
        </button>
        <button
          className={`writing-sidebar-tab ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          {t('writing.characters')}
        </button>
        <button
          className={`writing-sidebar-tab ${activeTab === 'worldnotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('worldnotes')}
        >
          {t('writing.worldNotes')}
        </button>
      </div>

      <div className="writing-sidebar-content">
        {activeTab === 'chapters' && (
          <ChapterList
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={onSelectChapter}
            onAddChapter={onAddChapter}
            onRenameChapter={onRenameChapter}
            onDeleteChapter={onDeleteChapter}
            onReorder={onReorderChapters}
          />
        )}
        {activeTab === 'characters' && (
          <CharacterList
            characters={characters}
            onAddCharacter={onAddCharacter}
            onUpdateCharacter={onUpdateCharacter}
            onRemoveCharacter={onRemoveCharacter}
          />
        )}
        {activeTab === 'worldnotes' && (
          <WorldNoteList
            worldNotes={worldNotes}
            onAddWorldNote={onAddWorldNote}
            onUpdateWorldNote={onUpdateWorldNote}
            onRemoveWorldNote={onRemoveWorldNote}
          />
        )}
      </div>

      {onShowStats && (
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            className="writing-sidebar-tab"
            onClick={onShowStats}
            style={{ flex: 1, fontSize: 11, padding: '6px 4px' }}
          >
            {t('writing.stats')}
          </button>
        </div>
      )}

      <WordCountProgress
        wordCountStats={wordCountStats}
        wordCountTarget={wordCountTarget}
        onSetTarget={onSetWordCountTarget}
      />
    </div>
  );
}
