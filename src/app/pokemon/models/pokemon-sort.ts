export type Sort= 'id' | 'name' | 'height' | 'weight' | 'generation';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  key: Sort;
  dir: SortDirection;
}
