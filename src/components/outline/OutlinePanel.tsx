import type { OutlineItemData } from '../../outline/outlineTypes.ts';
import { OutlineItemComponent } from './OutlineItem.tsx';

interface OutlinePanelProps {
  items: OutlineItemData[];
  activeId: string | null;
  onItemClick: (item: OutlineItemData) => void;
  onClose: () => void;
}

export function OutlinePanel({ items, activeId, onItemClick, onClose }: OutlinePanelProps) {
  return (
    <div className="outline-panel">
      <div className="outline-header">
        <span>Outline</span>
        <button className="outline-close-btn" onClick={onClose} title="Close outline (Ctrl+Shift+O)">
          &#x2715;
        </button>
      </div>
      <div className="outline-list">
        {items.length === 0 ? (
          <div className="outline-empty">No headings found</div>
        ) : (
          items.map((item) => (
            <OutlineItemComponent
              key={item.id}
              item={item}
              isActive={activeId === item.id}
              onClick={onItemClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
