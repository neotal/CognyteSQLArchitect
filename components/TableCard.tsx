
import React, { useState } from 'react';
import { Key, Table as TableIcon, Hash, Link, Layers, MoreVertical, Edit2, Trash2, Info } from 'lucide-react';
import { Table, Column, Group, Relationship } from '../types';

interface TableCardProps {
  table: Table;
  groups: Group[];
  allTables: Table[];
  allGroups: Group[];
  relationships: Relationship[];
  onMouseDown: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ 
  table, groups, allTables, allGroups, relationships, onMouseDown, onEdit, onDelete 
}) => {
  const [showStats, setShowStats] = useState<'cols' | 'rels' | 'groups' | null>(null);
  const [isHoveringName, setIsHoveringName] = useState(false);

  const keys = table.columns.filter(c => c.isKey);
  const regular = table.columns.filter(c => !c.isKey);
  
  const linkedTables = relationships.map(r => {
    const otherId = r.fromTableId === table.id ? r.toTableId : r.fromTableId;
    return allTables.find(t => t.id === otherId);
  }).filter(Boolean);

  const linkedTableNames = Array.from(new Set(linkedTables.map(t => t!.name)));
  const groupNames = groups.map(g => g.name);

  // Requirement: Display stripes for each unique relationship's other table color
  // "כשמוסיפים קשר לטבלה נוספים לה עוד פס ברקע שלה עם הצבע של הטבלה"
  const linkedColors = Array.from(new Set(linkedTables.map(t => t!.color)));

  return (
    <div 
      className="absolute bg-white rounded-xl shadow-xl border-2 select-none group/table overflow-visible transition-shadow hover:shadow-2xl"
      style={{ 
        left: table.position.x, 
        top: table.position.y, 
        width: 240, 
        borderColor: table.color,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Background Stripes Container - Rendered inside to be behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[10px]">
        <div 
          className="absolute inset-0 flex"
          style={{ opacity: 0.15 }}
        >
          {linkedColors.map((c, i) => (
            <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div 
        className="relative px-4 py-3 flex items-center justify-between border-b cursor-move rounded-t-lg overflow-visible"
        style={{ backgroundColor: `${table.color}15`, borderBottomColor: `${table.color}30` }}
      >
        <div 
          className="flex items-center space-x-2 flex-1 min-w-0"
          onMouseEnter={() => setIsHoveringName(true)}
          onMouseLeave={() => setIsHoveringName(false)}
        >
          <TableIcon className="w-4 h-4 flex-shrink-0" style={{ color: table.color }} />
          <h3 className="font-bold text-slate-800 text-sm truncate">{table.name}</h3>
          
          {/* Tooltip for Description */}
          {isHoveringName && table.description && (
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
              <div className="font-bold mb-1 flex items-center"><Info className="w-3 h-3 mr-1" /> Description</div>
              {table.description}
              <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-700 pt-1">
                Click Edit to modify
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover/table:opacity-100 transition-opacity ml-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-red-600 transition-colors shadow-sm"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Columns List */}
      <div className="relative max-h-64 overflow-y-auto bg-white/40 backdrop-blur-[2px]">
        {keys.length > 0 && (
          <div className="px-3 py-1 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Keys
          </div>
        )}
        {keys.map(col => (
          <div key={col.id} className="px-4 py-2 flex items-center text-xs text-slate-700 hover:bg-blue-50/50 border-b border-slate-50 last:border-0 transition-colors">
            <Key className="w-3 h-3 mr-2 text-amber-500" />
            <span className="font-semibold truncate">{col.name}</span>
          </div>
        ))}
        
        {regular.length > 0 && (
          <div className="px-3 py-1 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Attributes
          </div>
        )}
        {regular.map(col => (
          <div key={col.id} className="px-4 py-2 flex items-center text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
            <div className="w-3 h-3 mr-2" />
            <span className="truncate">{col.name}</span>
          </div>
        ))}
      </div>

      {/* Footer Metrics */}
      <div className="relative px-3 py-2.5 bg-slate-50/90 flex items-center justify-between border-t border-slate-100 rounded-b-lg">
        <div className="flex items-center space-x-4 text-[11px] font-bold text-slate-400">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'cols' ? null : 'cols'); }}
            className={`flex items-center px-1.5 py-0.5 rounded transition-all ${showStats === 'cols' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200 hover:text-slate-600'}`}
          >
            <Hash className="w-3.5 h-3.5 mr-1" /> {table.columns.length}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'rels' ? null : 'rels'); }}
            className={`flex items-center px-1.5 py-0.5 rounded transition-all ${showStats === 'rels' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200 hover:text-slate-600'}`}
          >
            <Link className="w-3.5 h-3.5 mr-1" /> {relationships.length}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'groups' ? null : 'groups'); }}
            className={`flex items-center px-1.5 py-0.5 rounded transition-all ${showStats === 'groups' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-200 hover:text-slate-600'}`}
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> {groups.length}
          </button>
        </div>
      </div>

      {/* Popovers for stats */}
      {showStats && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-slate-200 p-4 z-40 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              {showStats === 'cols' ? 'Table Columns' : showStats === 'rels' ? 'Related Entities' : 'Member Groups'}
            </span>
            <button onClick={() => setShowStats(null)} className="p-1 hover:bg-slate-100 rounded"><MoreVertical className="w-3 h-3 text-slate-300" /></button>
          </div>
          <ul className="text-xs space-y-1.5 text-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
            {showStats === 'cols' && table.columns.map(c => (
              <li key={c.id} className="flex items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                {c.isKey ? <Key className="w-3 h-3 mr-2 text-amber-500" /> : <Hash className="w-3 h-3 mr-2 text-slate-300" />}
                <span className="font-medium">{c.name}</span>
              </li>
            ))}
            {showStats === 'rels' && linkedTableNames.map((n, i) => (
              <li key={i} className="flex items-center bg-indigo-50/30 p-1.5 rounded border border-indigo-100 text-indigo-700">
                <Link className="w-3 h-3 mr-2" />
                <span className="font-medium">{n}</span>
              </li>
            ))}
            {showStats === 'groups' && groupNames.map((n, i) => (
              <li key={i} className="flex items-center bg-emerald-50/30 p-1.5 rounded border border-emerald-100 text-emerald-700">
                <Layers className="w-3 h-3 mr-2" />
                <span className="font-medium">{n}</span>
              </li>
            ))}
            {((showStats === 'cols' && table.columns.length === 0) || 
              (showStats === 'rels' && relationships.length === 0) || 
              (showStats === 'groups' && groups.length === 0)) && (
              <li className="text-slate-400 italic text-center py-2">No entries found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TableCard;
