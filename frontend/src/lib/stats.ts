import { fetchApi } from './api';
import { formatFileSize } from './documents';

export interface CategoryStat {
  name: string;
  count: number;
  size: number;
}

export interface MimeStat {
  mimeType: string;
  count: number;
}

export interface MonthStat {
  month: string;
  count: number;
}

export interface DocumentStats {
  totalCount: number;
  totalSize: number;
  byCategory: CategoryStat[];
  byMimeType: MimeStat[];
  byMonth: MonthStat[];
}

export async function getStats(): Promise<DocumentStats> {
  return fetchApi('/documents/stats');
}

/** Convert bytes to a human-readable string. Re-exports from documents.ts */
export { formatFileSize };

/** Returns a color from a predictable palette for charts/badges */
const PALETTE = [
  '#2563eb', // blue
  '#7c3aed', // violet
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#0891b2', // cyan
  '#9333ea', // purple
  '#65a30d', // lime
];
export const getCategoryColor = (index: number): string => PALETTE[index % PALETTE.length];
