import { useCallback, useRef } from 'react';
import type { Chapter } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';
import { ChapterItem } from './ChapterItem.tsx';

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onRenameChapter: (chapterId: string, title: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorder: (chapters: Chapter[]) => void;
}

export function ChapterList({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onReorder,
}: ChapterListProps) {
  const { t } = useLocale();
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItemRef.current = index;
  }, []);

  const handleDragOver = useCallback((index: number) => {
    dragOverItemRef.current = index;
  }, []);

  const handleDrop = useCallback(() => {
    const from = dragItemRef.current;
    const to = dragOverItemRef.current;
    if (from === null || to === null || from === to) {
      dragItemRef.current = null;
      dragOverItemRef.current = null;
      return;
    }
    const reordered = [...chapters];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onReorder(reordered);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [chapters, onReorder]);

  const handleDragEnd = useCallback(() => {
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, []);

  return (
    <div>
      <div className="writing-sidebar-header">
        <span className="writing-sidebar-header-title">{t('writing.chapters')}</span>
        <button className="writing-sidebar-btn" onClick={onAddChapter} title={t('writing.addChapter')}>
          +
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="writing-empty">{t('writing.addChapter')}</div>
      ) : (
        <div>
          {chapters.map((chapter, index) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              isActive={chapter.id === activeChapterId}
              onSelect={() => onSelectChapter(chapter.id)}
              onRename={(title) => onRenameChapter(chapter.id, title)}
              onDelete={() => onDeleteChapter(chapter.id)}
              onDragStart={() => handleDragStart(index)}
              onDragOver={() => handleDragOver(index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
