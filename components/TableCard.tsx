
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
  const [isHoveringName, setIsHoveringName] = useState(false);

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

  return (
    <div 
      className={`absolute bg-white rounded-2xl shadow-xl border-2 select-none group/table overflow-visible transition-all hover:shadow-2xl`}
      style={{ 
        left: table.position.x, 
        top: table.position.y, 
        width: 240, 
        borderColor: table.color,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px]">
        <div 
          className="absolute inset-0 flex"
          style={{ opacity: 0.12 }}
        >
          {linkedColors.map((c, i) => (
            <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div 
        className={`relative px-4 py-3 flex items-center justify-between cursor-move rounded-t-xl overflow-visible border-b`}
        style={{ 
          backgroundColor: `${table.color}15`, 
          borderBottomColor: `${table.color}30` 
        }}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="p-1 hover:bg-white rounded-md transition-colors mr-1"
            title={table.isCollapsed ? "Expand columns" : "Collapse columns"}
          >
            {table.isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          
          <div 
            className="flex items-center space-x-2 flex-1 min-w-0"
            onMouseEnter={() => setIsHoveringName(true)}
            onMouseLeave={() => setIsHoveringName(false)}
          >
            <TableIcon className="w-4 h-4 flex-shrink-0" style={{ color: table.color }} />
            <h3 className="font-black text-slate-800 text-sm truncate tracking-tight">{table.name}</h3>
            
            {isHoveringName && table.description && (
              <div className="absolute left-0 bottom-full mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="font-black mb-1.5 flex items-center text-blue-400 uppercase tracking-widest text-[9px]">
                  <Info className="w-3 h-3 mr-1.5" /> Table Information
                </div>
                <div className="leading-relaxed opacity-90">{table.description}</div>
                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover/table:opacity-100 transition-opacity ml-2">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              onEdit(); 
            }} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              onDelete(); 
            }} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-all shadow-sm active:scale-90"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!table.isCollapsed && (
        <>
          {hasMetadata && (
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 space-y-2 animate-in fade-in duration-300">
              {table.sourceSystem && (
                <div className="flex items-center text-[9px] text-slate-500">
                  <Database className="w-3 h-3 mr-1.5 text-blue-400" />
                  <span className="font-black uppercase tracking-tighter mr-1">System:</span>
                  <span className="font-bold text-slate-700 truncate">{table.sourceSystem}</span>
                </div>
              )}
              {table.businessArea && (
                <div className="flex items-center text-[9px] text-slate-500">
                  <Globe className="w-3 h-3 mr-1.5 text-indigo-400" />
                  <span className="font-black uppercase tracking-tighter mr-1">Area:</span>
                  <span className="font-bold text-slate-700 truncate">{table.businessArea}</span>
                </div>
              )}
              {table.businessUnit && (
                <div className="flex items-center text-[9px] text-slate-500">
                  <Briefcase className="w-3 h-3 mr-1.5 text-emerald-400" />
                  <span className="font-black uppercase tracking-tighter mr-1">Unit:</span>
                  <span className="font-bold text-slate-700 truncate">{table.businessUnit}</span>
                </div>
              )}
            </div>
          )}

          <div className="relative max-h-60 overflow-y-auto bg-white/40 backdrop-blur-[1px] custom-scrollbar transition-all animate-in fade-in duration-300">
            {keys.map(col => (
              <div key={col.id} className="px-4 py-2.5 flex items-center text-xs text-slate-800 hover:bg-amber-50/50 border-b border-slate-50 last:border-0 transition-colors">
                <Key className="w-3.5 h-3.5 mr-2.5 text-amber-500 drop-shadow-sm" />
                <span className="font-bold truncate font-mono">{col.name}</span>
              </div>
            ))}
            {regular.map(col => (
              <div key={col.id} className="px-4 py-2 flex items-center text-xs text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                <div className="w-3.5 h-3.5 mr-2.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
                <span className="truncate font-medium font-mono">{col.name}</span>
              </div>
            ))}
            {table.columns.length === 0 && (
              <div className="px-4 py-4 text-center text-[10px] text-slate-400 italic">No columns defined</div>
            )}
          </div>
        </>
      )}

      <div className={`relative px-3 py-2 bg-slate-50/95 flex items-center justify-around rounded-b-xl ${!table.isCollapsed ? 'border-t border-slate-100' : ''}`}>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'cols' ? null : 'cols'); }}
          className={`flex items-center px-2 py-1 rounded-lg transition-all text-[11px] font-black ${showStats === 'cols' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-200'}`}
          title="Columns"
        >
          <Hash className="w-3.5 h-3.5 mr-1" /> {table.columns.length}
        </button>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'rels' ? null : 'rels'); }}
          className={`flex items-center px-2 py-1 rounded-lg transition-all text-[11px] font-black ${showStats === 'rels' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-200'}`}
          title="Relationships"
        >
          <Link className="w-3.5 h-3.5 mr-1" /> {relationships.length}
        </button>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setShowStats(showStats === 'groups' ? null : 'groups'); }}
          className={`flex items-center px-2 py-1 rounded-lg transition-all text-[11px] font-black ${showStats === 'groups' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-slate-200'}`}
          title="Groups"
        >
          <Layers className="w-3.5 h-3.5 mr-1" /> {groups.length}
        </button>
      </div>

      {showStats && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 z-40 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center">
              {showStats === 'cols' ? 'Columns List' : showStats === 'rels' ? 'Connected Tables' : 'Member Groups'}
              <ChevronRight className="w-3 h-3 ml-1" />
            </span>
            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setShowStats(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="w-3.5 h-3.5 text-slate-300" /></button>
          </div>
          <ul className="text-xs space-y-1.5 text-slate-700 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {showStats === 'cols' && table.columns.map(c => (
              <li key={c.id} className="flex items-center bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono text-[10px]">
                {c.isKey ? <Key className="w-3 h-3 mr-2 text-amber-500" /> : <Hash className="w-3 h-3 mr-2 text-slate-300" />}
                <span className="font-bold">{c.name}</span>
              </li>
            ))}
            {showStats === 'rels' && (
              linkedTableNames.length > 0 ? (
                linkedTableNames.map((n, i) => (
                  <li key={i} className="flex items-center bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 text-indigo-700">
                    <Link className="w-3.5 h-3.5 mr-2" />
                    <span className="font-bold">{n}</span>
                  </li>
                ))
              ) : <li className="text-center text-[10px] text-slate-400 py-2">No relationships</li>
            )}
            {showStats === 'groups' && groupNames.map((n, i) => (
              <li key={i} className="flex items-center bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 text-emerald-700">
                <Layers className="w-3.5 h-3.5 mr-2" />
                <span className="font-bold">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default TableCard;
