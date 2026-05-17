export interface OutlineItemData {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4;
  index: number;
}

export interface OutlineState {
  items: OutlineItemData[];
  activeId: string | null;
}
