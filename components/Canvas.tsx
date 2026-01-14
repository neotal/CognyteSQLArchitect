
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Table, Relationship, Group } from '../types';
import TableCard from './TableCard';
import RelationshipLine from './RelationshipLine';

interface CanvasProps {
  tables: Table[];
  groups: Group[];
  relationships: Relationship[];
  zoom: number;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  onEditTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  onDeleteRelation: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  tables, groups, relationships, zoom, setTables, onEditTable, onDeleteTable, onDeleteRelation 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;
    setDraggingTableId(id);
    setOffset({
      x: e.clientX / zoom - table.position.x,
      y: e.clientY / zoom - table.position.y
    });
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTableId) return;
    const newX = e.clientX / zoom - offset.x;
    const newY = e.clientY / zoom - offset.y;
    setTables(prev => prev.map(t => t.id === draggingTableId ? { ...t, position: { x: newX, y: newY } } : t));
  };

  const handleMouseUp = () => {
    setDraggingTableId(null);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="absolute top-0 left-0 min-w-[5000px] min-h-[5000px] origin-top-left"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* SVG layer for relationships */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {relationships.map(rel => {
            const fromTable = tables.find(t => t.id === rel.fromTableId);
            const toTable = tables.find(t => t.id === rel.toTableId);
            if (!fromTable || !toTable) return null;
            return (
              <RelationshipLine 
                key={rel.id} 
                relationship={rel}
                fromPos={fromTable.position}
                toPos={toTable.position}
                onDelete={() => onDeleteRelation(rel.id)}
              />
            );
          })}
        </svg>

        {/* Tables layer */}
        {tables.map(table => (
          <TableCard 
            key={table.id}
            table={table}
            groups={groups.filter(g => table.groupIds.includes(g.id))}
            allTables={tables}
            allGroups={groups}
            relationships={relationships.filter(r => r.fromTableId === table.id || r.toTableId === table.id)}
            onMouseDown={(e) => handleMouseDown(table.id, e)}
            onEdit={() => onEditTable(table)}
            onDelete={() => onDeleteTable(table.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
