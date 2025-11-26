export type Sort= 'id' | 'name' | 'height' | 'weight' | 'generation' | 'rarity';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  key: Sort;
  dir: SortDirection;
}
