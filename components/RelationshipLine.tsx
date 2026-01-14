
import React from 'react';
import { Relationship } from '../types';
import { RELATION_STYLES } from '../constants';

interface RelationshipLineProps {
  relationship: Relationship;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  onDelete: () => void;
}

const RelationshipLine: React.FC<RelationshipLineProps> = ({ relationship, fromPos, toPos, onDelete }) => {
  const WIDTH = 240;
  
  // Find start and end points based on relative positions to minimize line crossing
  const isFromLeft = fromPos.x < toPos.x;
  
  const x1 = isFromLeft ? fromPos.x + WIDTH : fromPos.x;
  const y1 = fromPos.y + 40;
  const x2 = isFromLeft ? toPos.x : toPos.x + WIDTH;
  const y2 = toPos.y + 40;

  // Control points for a curved cubic bezier
  const dx = Math.abs(x1 - x2);
  const curvature = Math.min(dx / 2, 100);
  const cx1 = isFromLeft ? x1 + curvature : x1 - curvature;
  const cy1 = y1;
  const cx2 = isFromLeft ? x2 - curvature : x2 + curvature;
  const cy2 = y2;

  // Midpoint for the label
  // Using a simplified midpoint for the cubic bezier curve
  const t = 0.5;
  const mx = (1-t)**3 * x1 + 3*(1-t)**2 * t * cx1 + 3*(1-t) * t**2 * cx2 + t**3 * x2;
  const my = (1-t)**3 * y1 + 3*(1-t)**2 * t * cy1 + 3*(1-t) * t**2 * cy2 + t**3 * y2;

  const styleClass = RELATION_STYLES[relationship.type] || 'stroke-slate-300 stroke-2';

  return (
    <g className="group cursor-default pointer-events-auto">
      {/* Glow effect on hover */}
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className="stroke-blue-400 stroke-[6px] fill-none opacity-0 group-hover:opacity-20 transition-all duration-300"
      />
      
      {/* Main Line */}
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className={`${styleClass} fill-none opacity-60 group-hover:opacity-100 transition-all duration-300`}
      />

      {/* Relation Type Box */}
      <g transform={`translate(${mx - 15}, ${my - 10})`}>
        <rect 
          width={30} height={20} rx={6} 
          className="fill-white stroke-slate-200 group-hover:stroke-blue-500 group-hover:shadow-md transition-all duration-300"
        />
        <text 
          x={15} y={14} 
          textAnchor="middle" 
          className="text-[9px] font-black fill-slate-500 group-hover:fill-blue-600 select-none transition-colors"
        >
          {relationship.type}
        </text>
      </g>

      {/* Markers at ends to visually represent cardinality */}
      <circle cx={x1} cy={y1} r={3} className="fill-white stroke-slate-400 group-hover:stroke-blue-500 stroke-1" />
      <circle cx={x2} cy={y2} r={3} className="fill-white stroke-slate-400 group-hover:stroke-blue-500 stroke-1" />

      {/* Hit area for easier selection/deletion */}
      <path 
        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
        className="stroke-transparent stroke-[15px] fill-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if(confirm(`Delete ${relationship.type} relationship?`)) onDelete();
        }}
      />

      <title>Relationship: {relationship.type} (Click to delete)</title>
    </g>
  );
};

export default RelationshipLine;
