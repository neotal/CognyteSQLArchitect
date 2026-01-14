
export const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'
];

export const TABLE_WIDTH = 240;
export const TABLE_HEADER_HEIGHT = 48;
export const COLUMN_HEIGHT = 32;

export const RELATION_STYLES: Record<string, string> = {
  '1:1': 'stroke-blue-500 stroke-2',
  '1:N': 'stroke-indigo-500 stroke-[3]',
  'N:1': 'stroke-purple-500 stroke-[3]',
  'N:N': 'stroke-pink-600 stroke-[4] stroke-dash-2'
};
