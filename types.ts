
export type RelationType = '1:1' | '1:N' | 'N:1' | 'N:N';

export interface Column {
  id: string;
  name: string;
  isKey: boolean;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Table {
  id: string;
  name: string;
  description: string;
  color: string;
  groupIds: string[];
  columns: Column[];
  position: { x: number; y: number };
}

export interface Relationship {
  id: string;
  fromTableId: string;
  toTableId: string;
  type: RelationType;
}

export interface AppState {
  tables: Table[];
  groups: Group[];
  relationships: Relationship[];
  zoom: number;
}
