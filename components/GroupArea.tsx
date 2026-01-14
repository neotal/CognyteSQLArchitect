
import React, { memo } from 'react';
import { Group } from '../types';
import { Maximize2 } from 'lucide-react';

interface GroupAreaProps {
  group: Group;
  onMouseDown: (e: React.MouseEvent) => void;
  onResize: (size: { width: number, height: number }) => void;
}

const GroupArea: React.FC<GroupAreaProps> = memo(({ group, onMouseDown, onResize }) => {
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = group.size.width;
    const startHeight = group.size.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(150, startHeight + (moveEvent.clientY - startY));
      onResize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className="absolute rounded-[40px] border-2 border-dashed transition-shadow group/area"
      style={{
        left: group.position.x,
        top: group.position.y,
        width: group.size.width,
        height: group.size.height,
        backgroundColor: `${group.color}08`,
        borderColor: `${group.color}40`,
      }}
    >
      {/* Header Area for Dragging */}
      <div 
        className="absolute top-0 left-0 right-0 h-12 flex items-center px-8 cursor-move group-hover/area:bg-white/40 transition-colors rounded-t-[40px]"
        onMouseDown={onMouseDown}
      >
        <div 
          className="w-3 h-3 rounded-full mr-4 shadow-sm" 
          style={{ backgroundColor: group.color }} 
        />
        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 group-hover/area:text-slate-600 transition-colors truncate">
          {group.name}
        </span>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-6 right-6 p-2 cursor-nwse-resize text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover/area:opacity-100"
        onMouseDown={handleResizeMouseDown}
      >
        <Maximize2 className="w-5 h-5" />
      </div>

      {/* Visual Decoration */}
      <div 
        className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 rounded-tl-3xl" 
        style={{ borderColor: group.color }} 
      />
    </div>
  );
});

export default GroupArea;
