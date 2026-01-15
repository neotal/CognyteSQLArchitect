
import React, { useRef, useState, useEffect } from 'react';
import { Table, Relationship, Group } from '../types';
import TableCard from './TableCard';
import RelationshipLine from './RelationshipLine';
import GroupArea from './GroupArea';

interface CanvasProps {
  tables: Table[];
  groups: Group[];
  relationships: Relationship[];
  zoom: number;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  onEditTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  onDeleteRelation: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  tables, groups, relationships, zoom, setTables, setGroups, onEditTable, onDeleteTable, onDeleteRelation, onToggleCollapse
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEntity, setDraggingEntity] = useState<{ id: string, type: 'table' | 'group' } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (id: string, type: 'table' | 'group', e: React.MouseEvent) => {
    e.stopPropagation();
    const entity = type === 'table' ? tables.find(t => t.id === id) : groups.find(g => g.id === id);
    if (!entity) return;
    
    setDraggingEntity({ id, type });
    setOffset({
      x: e.clientX / zoom - entity.position.x,
      y: e.clientY / zoom - entity.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingEntity) return;

    const newX = e.clientX / zoom - offset.x;
    const newY = e.clientY / zoom - offset.y;

    if (draggingEntity.type === 'table') {
      setTables(prev => prev.map(t => t.id === draggingEntity.id ? { ...t, position: { x: newX, y: newY } } : t));
    } else {
      const group = groups.find(g => g.id === draggingEntity.id);
      if (!group) return;

      const dx = newX - group.position.x;
      const dy = newY - group.position.y;

      setGroups(prev => prev.map(g => g.id === draggingEntity.id ? { ...g, position: { x: newX, y: newY } } : g));
      
      setTables(prev => prev.map(t => {
        const belongsToThisGroup = t.groupIds[0] === draggingEntity.id;
        if (belongsToThisGroup) {
          return { ...t, position: { x: t.position.x + dx, y: t.position.y + dy } };
        }
        return t;
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingEntity(null);
  };

  const handleResizeGroup = (id: string, size: { width: number, height: number }) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, size } : g));
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
        {/* Groups layer (Bottom) */}
        {groups.map(group => (
          <GroupArea 
            key={group.id}
            group={group}
            onMouseDown={(e) => handleMouseDown(group.id, 'group', e)}
            onResize={(size) => handleResizeGroup(group.id, size)}
          />
        ))}

        {/* Relationships layer (Middle) */}
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

        {/* Tables layer (Top) */}
        {tables.map(table => (
          <TableCard 
            key={table.id}
            table={table}
            groups={groups.filter(g => table.groupIds.includes(g.id))}
            allTables={tables}
            allGroups={groups}
            relationships={relationships.filter(r => r.fromTableId === table.id || r.toTableId === table.id)}
            onMouseDown={(e) => handleMouseDown(table.id, 'table', e)}
            onEdit={() => onEditTable(table)}
            onDelete={() => onDeleteTable(table.id)}
            onToggleCollapse={() => onToggleCollapse(table.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
