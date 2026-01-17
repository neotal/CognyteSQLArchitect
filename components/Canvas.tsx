
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
  onEditRelation: (rel: Relationship) => void;
  onDeleteTable: (id: string) => void;
  onDeleteRelation: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  tables, groups, relationships, zoom, setTables, setGroups, onEditTable, onEditRelation, onDeleteTable, onDeleteRelation, onToggleCollapse
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEntity, setDraggingEntity] = useState<{ id: string, type: 'table' | 'group' } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (id: string, type: 'table' | 'group', e: React.MouseEvent) => {
    e.stopPropagation();
    const entity = type === 'table' ? tables.find(t => t.id === id) : groups.find(g => g.id === id);
    if (!entity) return;
    setDraggingEntity({ id, type });
    setOffset({ x: e.clientX / zoom - entity.position.x, y: e.clientY / zoom - entity.position.y });
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
      setTables(prev => prev.map(t => t.groupIds[0] === draggingEntity.id ? { ...t, position: { x: t.position.x + dx, y: t.position.y + dy } } : t));
    }
  };

  const handleMouseUp = () => setDraggingEntity(null);

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
        {/* Layer 0: Groups */}
        {groups.map(group => (
          <GroupArea key={group.id} group={group} onMouseDown={(e) => handleMouseDown(group.id, 'group', e)} onResize={(size) => setGroups(prev => prev.map(g => g.id === group.id ? { ...g, size } : g))} />
        ))}

        {/* Layer 1: Tables */}
        {tables.map(table => (
          <TableCard 
            key={table.id} table={table} 
            groups={groups.filter(g => table.groupIds.includes(g.id))}
            allTables={tables} allGroups={groups}
            relationships={relationships.filter(r => r.fromTableId === table.id || r.toTableId === table.id)}
            onMouseDown={(e) => handleMouseDown(table.id, 'table', e)}
            onEdit={() => onEditTable(table)}
            onDelete={() => onDeleteTable(table.id)}
            onToggleCollapse={() => onToggleCollapse(table.id)}
          />
        ))}

        {/* Layer 2: Relationships SVG - Ensure high Z-index for visibility */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-50">
          <defs>
            {/* MANY side: Crow's Foot fanning OUT (3 lines) towards the table boundary */}
            {/* refX 10 means the end of the marker (the wide part) touches the table */}
            <marker id="crowfoot-end" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
               <path d="M 0 5 L 10 1 M 0 5 L 10 9 M 0 5 L 10 5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </marker>
            {/* refX 0 means the wide part touches the table on the start side */}
            <marker id="crowfoot-start" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
               <path d="M 10 5 L 0 1 M 10 5 L 0 9 M 10 5 L 0 5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </marker>
            
            {/* ONE side: Clean perpendicular line, now thinner */}
            <marker id="one-end" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="3" markerHeight="7" orient="auto">
               <line x1="10" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </marker>
            <marker id="one-start" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="3" markerHeight="7" orient="auto-start-reverse">
               <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </marker>
          </defs>

          {relationships.map(rel => {
            const fromT = tables.find(t => t.id === rel.fromTableId);
            const toT = tables.find(t => t.id === rel.toTableId);
            if (!fromT || !toT) return null;

            const samePairRels = relationships.filter(r => 
              (r.fromTableId === rel.fromTableId && r.toTableId === rel.toTableId) ||
              (r.fromTableId === rel.toTableId && r.toTableId === rel.fromTableId)
            );
            const siblingIndex = samePairRels.findIndex(r => r.id === rel.id);

            return (
              <RelationshipLine 
                key={rel.id} 
                relationship={rel} 
                fromTable={fromT} 
                toTable={toT}
                siblingIndex={siblingIndex}
                totalSiblings={samePairRels.length}
                onDelete={() => onDeleteRelation(rel.id)}
                onEdit={() => onEditRelation(rel)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
