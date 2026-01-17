
export const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'
];

export const TABLE_WIDTH = 240;
export const TABLE_HEADER_HEIGHT = 48;
export const COLUMN_HEIGHT = 32;

export const RELATION_STYLES: Record<string, { color: string, stroke: string }> = {
  '1:1': { color: '#3b82f6', stroke: 'stroke-blue-500 stroke-2' },
  '1:N': { color: '#10b981', stroke: 'stroke-emerald-500 stroke-2' },
  'N:1': { color: '#8b5cf6', stroke: 'stroke-indigo-500 stroke-2' },
  'N:N': { color: '#f43f5e', stroke: 'stroke-rose-500 stroke-2' }
};
