import type { OutlineItemData } from '../../outline/outlineTypes.ts';

interface OutlineItemProps {
  item: OutlineItemData;
  isActive: boolean;
  onClick: (item: OutlineItemData) => void;
}

export function OutlineItemComponent({ item, isActive, onClick }: OutlineItemProps) {
  const levelClass = `level-${item.level}`;

  return (
    <button
      className={`outline-item ${levelClass}${isActive ? ' active' : ''}`}
      onClick={() => onClick(item)}
      title={item.text}
      aria-current={isActive ? 'true' : undefined}
    >
      {item.text}
    </button>
  );
}
