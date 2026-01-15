
import React from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { Group } from '../types';

interface SidebarProps {
  groups: Group[];
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, onAddGroup, onEditGroup, onDeleteGroup }) => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-lg z-20">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-800">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="font-bold text-lg tracking-tight">Project Groups</h2>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onAddGroup();
            }}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
            title="New Group"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight font-black uppercase tracking-wider">
          Workspace Management
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {groups.map(group => (
          <div 
            key={group.id} 
            className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-default"
          >
            <div className="flex items-center space-x-3 overflow-hidden flex-1">
              <div 
                className="w-4 h-4 rounded shadow-sm flex-shrink-0" 
                style={{ backgroundColor: group.color }}
              />
              <span className="font-bold text-slate-700 truncate text-sm">{group.name}</span>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <button 
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation(); 
                  onEditGroup(group); 
                }}
                className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-500 transition-all active:scale-90"
                title="Edit Group"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation(); 
                  onDeleteGroup(group.id); 
                }}
                className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all active:scale-90"
                title="Delete Group"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Schema Inventory</span>
          <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">{groups.length} Groups</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
