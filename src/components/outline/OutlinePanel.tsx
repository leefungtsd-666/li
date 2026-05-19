import type { OutlineItemData } from '../../outline/outlineTypes.ts';
import { OutlineItemComponent } from './OutlineItem.tsx';
import { useLocale } from '../../i18n/useLocale.ts';

interface OutlinePanelProps {
  items: OutlineItemData[];
  activeId: string | null;
  onItemClick: (item: OutlineItemData) => void;
  onClose: () => void;
}

export function OutlinePanel({ items, activeId, onItemClick, onClose }: OutlinePanelProps) {
  const { t } = useLocale();

  return (
    <div className="outline-panel" role="navigation" aria-label={t('outline.title')}>
      <div className="outline-header">
        <span>{t('outline.title')}</span>
        <button
          className="outline-close-btn"
          onClick={onClose}
          title={t('outline.title')}
          aria-label={t('outline.title')}
        >
          &#x2715;
        </button>
      </div>
      <div className="outline-list">
        {items.length === 0 ? (
          <div className="outline-empty">{t('outline.empty')}</div>
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
