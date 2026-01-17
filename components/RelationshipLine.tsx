
import React, { memo, useState } from 'react';
import { Relationship, Table } from '../types';
import { RELATION_STYLES, TABLE_WIDTH, TABLE_HEADER_HEIGHT, COLUMN_HEIGHT } from '../constants';
import { Edit2, Trash2 } from 'lucide-react';

interface RelationshipLineProps {
  relationship: Relationship;
  fromTable: Table;
  toTable: Table;
  siblingIndex?: number;
  totalSiblings?: number;
  onDelete: () => void;
  onEdit: () => void;
}

const RelationshipLine: React.FC<RelationshipLineProps> = memo(({ 
  relationship, fromTable, toTable, siblingIndex = 0, totalSiblings = 1, onDelete, onEdit 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getColOffset = (table: Table, columnId: string) => {
    if (table.isCollapsed) return TABLE_HEADER_HEIGHT / 2;
    const index = table.columns.findIndex(c => c.id === columnId);
    if (index === -1) return TABLE_HEADER_HEIGHT / 2;
    return TABLE_HEADER_HEIGHT + (index * COLUMN_HEIGHT) + (COLUMN_HEIGHT / 2);
  };

  const fromPos = fromTable.position;
  const toPos = toTable.position;

  const isFromLeft = fromPos.x < toPos.x;
  
  const x1 = isFromLeft ? fromPos.x + TABLE_WIDTH : fromPos.x;
  const y1 = fromPos.y + getColOffset(fromTable, relationship.fromColumnId);
  const x2 = isFromLeft ? toPos.x : toPos.x + TABLE_WIDTH;
  const y2 = toPos.y + getColOffset(toTable, relationship.toColumnId);

  // Calculate curvature offset for multiple relationships between the same pair
  // This ensures lines don't overlap perfectly
  const dx = Math.abs(x1 - x2);
  const baseCurvature = Math.min(dx / 2, 120);
  
  // Apply a unique vertical arc to each sibling
  const verticalOffset = (siblingIndex - (totalSiblings - 1) / 2) * 30;
  
  const cx1 = isFromLeft ? x1 + baseCurvature : x1 - baseCurvature;
  const cy1 = y1 + verticalOffset;
  const cx2 = isFromLeft ? x2 - baseCurvature : x2 + baseCurvature;
  const cy2 = y2 + verticalOffset;

  // Mid-point calculation for label positioning
  const t = 0.5;
  const mx = (1-t)**3 * x1 + 3*(1-t)**2 * t * cx1 + 3*(1-t) * t**2 * cx2 + t**3 * x2;
  const my = (1-t)**3 * y1 + 3*(1-t)**2 * t * cy1 + 3*(1-t) * t**2 * cy2 + t**3 * y2;

  const styleConfig = RELATION_STYLES[relationship.type] || { color: '#94a3b8', stroke: 'stroke-slate-300 stroke-2' };
  
  const markerStart = (relationship.type === 'N:1' || relationship.type === 'N:N') ? 'url(#crowfoot-start)' : 'url(#one-start)';
  const markerEnd = (relationship.type === '1:N' || relationship.type === 'N:N') ? 'url(#crowfoot-end)' : 'url(#one-end)';

  return (
    <g className="group cursor-default pointer-events-auto" style={{ color: styleConfig.color }}>
      {/* Invisible thick path for easier hovering */}
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className="stroke-current stroke-[20px] fill-none opacity-0 group-hover:opacity-5 transition-all cursor-pointer"
      />
      
      {/* Actual connection line */}
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className={`${styleConfig.stroke} fill-none transition-all duration-300`}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{ stroke: 'currentColor' }}
      />

      {/* Interactive Label Container */}
      <g 
        transform={`translate(${mx - 25}, ${my - 15})`} 
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <rect width={50} height={30} rx={10} className="fill-white stroke-slate-200 group-hover:stroke-current shadow-xl" />
        
        {!showMenu ? (
          <text x={25} y={19} textAnchor="middle" className="text-[10px] font-black fill-slate-500 group-hover:fill-current select-none">
            {relationship.type}
          </text>
        ) : (
          <g className="animate-in fade-in duration-200">
            <foreignObject x="0" y="0" width="50" height="30">
               <div className="flex items-center justify-around h-full p-1 bg-white rounded-xl">
                 <button 
                   onClick={(e) => { e.stopPropagation(); onEdit(); }}
                   className="p-1 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                   title="Edit Connection"
                 >
                   <Edit2 className="w-3.5 h-3.5" />
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); if(confirm('Delete this specific connection?')) onDelete(); }}
                   className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                   title="Delete Connection"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
            </foreignObject>
          </g>
        )}
      </g>
    </g>
  );
});

export default RelationshipLine;
