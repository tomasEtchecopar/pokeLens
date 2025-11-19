export type SortKey = 'id' | 'name' | 'height' | 'weight' | 'base_experience' | 'total_stats';
export type SortDir = 'asc' | 'desc';

export interface SortOption {
  key: SortKey;
  dir: SortDir;
}
