
import React, { useState, memo } from 'react';
import { Key, Table as TableIcon, Hash, Link, Layers, MoreVertical, Edit2, Trash2, Info, ChevronRight, ChevronDown, ChevronUp, Database, Globe, Briefcase } from 'lucide-react';
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
  onToggleCollapse: () => void;
}

const TableCard: React.FC<TableCardProps> = memo(({ 
  table, groups, allTables, allGroups, relationships, onMouseDown, onEdit, onDelete, onToggleCollapse
}) => {
  const [showStats, setShowStats] = useState<'cols' | 'rels' | 'groups' | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const keys = table.columns.filter(c => c.isKey);
  const regular = table.columns.filter(c => !c.isKey);
  
  const linkedTables = relationships.map(r => {
    const otherId = r.fromTableId === table.id ? r.toTableId : r.fromTableId;
    return allTables.find(t => t.id === otherId);
  }).filter(Boolean);

  const linkedTableNames = Array.from(new Set(linkedTables.map(t => t!.name)));
  const groupNames = groups.map(g => g.name);
  const linkedColors = Array.from(new Set(linkedTables.map(t => t!.color)));

  const hasMetadata = table.sourceSystem || table.businessArea || table.businessUnit;
  const hasTooltipContent = table.description || hasMetadata;

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-xl border-2 select-none group/table overflow-visible transition-all ${isHovering ? 'z-[100] shadow-2xl scale-[1.01]' : 'z-20'}`}
      style={{ 
        width: 240, 
        borderColor: table.color,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* ENTERPRISE TOOLTIP */}
      {isHovering && hasTooltipContent && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[105%] w-80 p-5 bg-slate-900 text-white text-[11px] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] z-[9999] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150 pointer-events-none border border-white/10">
          <div className="font-black mb-3 flex items-center text-blue-400 uppercase tracking-widest text-[9px] border-b border-white/10 pb-2">
            <Info className="w-3.5 h-3.5 mr-2" /> Data Intelligence
          </div>
          
          {table.description && (
            <div className="mb-4">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Business Description</span>
              <p className="leading-relaxed opacity-90 font-medium italic text-slate-200">
                "{table.description}"
              </p>
            </div>
          )}

          {hasMetadata && (
            <div className="space-y-2.5">
              {table.sourceSystem && (
                <div className="flex items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <Database className="w-3.5 h-3.5 mr-3 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Source System</span>
                    <span className="font-bold text-slate-100 text-[11px]">{table.sourceSystem}</span>
                  </div>
                </div>
              )}
              {table.businessArea && (
                <div className="flex items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <Globe className="w-3.5 h-3.5 mr-3 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Business Area</span>
                    <span className="font-bold text-slate-100 text-[11px]">{table.businessArea}</span>
                  </div>
                </div>
              )}
              {table.businessUnit && (
                <div className="flex items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <Briefcase className="w-3.5 h-3.5 mr-3 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Business Unit</span>
                    <span className="font-bold text-slate-100 text-[11px]">{table.businessUnit}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 border-r border-b border-white/10" />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px]">
        <div className="absolute inset-0 flex opacity-10">
          {linkedColors.map((c, i) => (
            <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div 
        className="relative px-4 py-3 flex items-center justify-between cursor-move rounded-t-xl border-b"
        style={{ backgroundColor: `${table.color}15`, borderBottomColor: `${table.color}30` }}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
            className="p-1 hover:bg-white rounded-md transition-colors"
          >
            {table.isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <TableIcon className="w-4 h-4 flex-shrink-0" style={{ color: table.color }} />
          <h3 className="font-black text-slate-800 text-sm truncate tracking-tight">{table.name}</h3>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover/table:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {!table.isCollapsed && (
        <div className="relative max-h-60 overflow-y-auto bg-white/50 custom-scrollbar">
          {keys.map(col => (
            <div key={col.id} className="px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-50 last:border-0 hover:bg-amber-50/40">
              <div className="flex items-center min-w-0">
                <Key className="w-3.5 h-3.5 mr-2 text-amber-500 flex-shrink-0" />
                <span className="font-bold truncate font-mono">{col.name}</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase font-mono px-1.5 bg-slate-100 rounded">{col.type}</span>
            </div>
          ))}
          {regular.map(col => (
            <div key={col.id} className="px-4 py-2 flex items-center justify-between text-xs border-b border-slate-50 last:border-0 hover:bg-slate-50">
              <div className="flex items-center min-w-0">
                <div className="w-3.5 h-3.5 mr-2 flex items-center justify-center opacity-30"><div className="w-1.5 h-1.5 rounded-full bg-slate-900" /></div>
                <span className="font-medium truncate font-mono">{col.name}</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase font-mono">{col.type}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`relative px-3 py-2 bg-slate-50/90 flex items-center justify-around rounded-b-xl ${!table.isCollapsed ? 'border-t border-slate-100' : ''}`}>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'cols' ? null : 'cols'); }} className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${showStats === 'cols' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-200'}`}><Hash className="w-3 h-3 mr-1" /> {table.columns.length}</button>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'rels' ? null : 'rels'); }} className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${showStats === 'rels' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-200'}`}><Link className="w-3 h-3 mr-1" /> {relationships.length}</button>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'groups' ? null : 'groups'); }} className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${showStats === 'groups' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-slate-200'}`}><Layers className="w-3 h-3 mr-1" /> {groups.length}</button>
      </div>

      {showStats && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-slate-100 p-3 z-50 animate-in slide-in-from-top-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{showStats} List</span>
            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setShowStats(null)} className="p-1 hover:bg-slate-100 rounded-md"><MoreVertical className="w-3 h-3 text-slate-300" /></button>
          </div>
          <ul className="text-[10px] space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {showStats === 'cols' && table.columns.map(c => <li key={c.id} className="p-1.5 bg-slate-50 rounded-md font-mono font-bold truncate">{c.name}</li>)}
            {showStats === 'rels' && linkedTableNames.map((n, i) => <li key={i} className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md font-bold truncate">{n}</li>)}
            {showStats === 'groups' && groupNames.map((n, i) => <li key={i} className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md font-bold truncate">{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
});

export default TableCard;
