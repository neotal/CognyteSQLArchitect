
import React, { memo } from 'react';
import { Relationship } from '../types';
import { RELATION_STYLES } from '../constants';

interface RelationshipLineProps {
  relationship: Relationship;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  onDelete: () => void;
}

const RelationshipLine: React.FC<RelationshipLineProps> = memo(({ relationship, fromPos, toPos, onDelete }) => {
  const WIDTH = 240;
  
  const isFromLeft = fromPos.x < toPos.x;
  
  const x1 = isFromLeft ? fromPos.x + WIDTH : fromPos.x;
  const y1 = fromPos.y + 40;
  const x2 = isFromLeft ? toPos.x : toPos.x + WIDTH;
  const y2 = toPos.y + 40;

  const dx = Math.abs(x1 - x2);
  const curvature = Math.min(dx / 2, 120);
  const cx1 = isFromLeft ? x1 + curvature : x1 - curvature;
  const cy1 = y1;
  const cx2 = isFromLeft ? x2 - curvature : x2 + curvature;
  const cy2 = y2;

  const t = 0.5;
  const mx = (1-t)**3 * x1 + 3*(1-t)**2 * t * cx1 + 3*(1-t) * t**2 * cx2 + t**3 * x2;
  const my = (1-t)**3 * y1 + 3*(1-t)**2 * t * cy1 + 3*(1-t) * t**2 * cy2 + t**3 * y2;

  const styleClass = RELATION_STYLES[relationship.type] || 'stroke-slate-300 stroke-2';

  return (
    <g className="group cursor-default pointer-events-auto">
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className="stroke-blue-400 stroke-[8px] fill-none opacity-0 group-hover:opacity-10 transition-all duration-500"
      />
      
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className={`${styleClass} fill-none opacity-40 group-hover:opacity-100 transition-all duration-300`}
      />

      <g transform={`translate(${mx - 18}, ${my - 12})`}>
        <rect 
          width={36} height={24} rx={8} 
          className="fill-white stroke-slate-200 group-hover:stroke-blue-500 shadow-sm transition-all duration-300"
        />
        <text 
          x={18} y={16} 
          textAnchor="middle" 
          className="text-[10px] font-black fill-slate-500 group-hover:fill-blue-600 select-none"
        >
          {relationship.type}
        </text>
      </g>

      <circle cx={x1} cy={y1} r={3.5} className="fill-white stroke-slate-400 group-hover:stroke-blue-600 stroke-[1.5]" />
      <circle cx={x2} cy={y2} r={3.5} className="fill-white stroke-slate-400 group-hover:stroke-blue-600 stroke-[1.5]" />

      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className="stroke-transparent stroke-[18px] fill-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if(confirm(`Remove connection between tables?`)) onDelete();
        }}
      />
    </g>
  );
});

export default RelationshipLine;
