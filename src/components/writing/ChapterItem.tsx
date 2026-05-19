import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import type { Chapter } from '../../writing/writingProjectTypes.ts';

interface ChapterItemProps {
  chapter: Chapter;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

export function ChapterItem({
  chapter,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ChapterItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(chapter.title);
  const doubleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    // Single click: select
    if (doubleClickTimerRef.current) {
      // Double click detected
      clearTimeout(doubleClickTimerRef.current);
      doubleClickTimerRef.current = null;
      setEditValue(chapter.title);
      setEditing(true);
    } else {
      doubleClickTimerRef.current = setTimeout(() => {
        doubleClickTimerRef.current = null;
        onSelect();
      }, 200);
    }
  }, [chapter.title, onSelect]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== chapter.title) {
      onRename(trimmed);
    }
    setEditing(false);
  }, [editValue, chapter.title, onRename]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRenameSubmit();
      } else if (e.key === 'Escape') {
        setEditValue(chapter.title);
        setEditing(false);
      }
    },
    [handleRenameSubmit, chapter.title],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete],
  );

  return (
    <div
      className={`writing-list-item ${isActive ? 'active' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {editing ? (
        <input
          className="writing-inline-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="writing-list-item-title">{chapter.title}</span>
          <span className="writing-list-item-meta">{chapter.order}</span>
          <span className="writing-list-item-actions">
            <button
              className="writing-sidebar-btn"
              onClick={handleDeleteClick}
              title="Delete"
              style={{ fontSize: 12, padding: '0 4px' }}
            >
              ×
            </button>
          </span>
        </>
      )}
    </div>
  );
}
