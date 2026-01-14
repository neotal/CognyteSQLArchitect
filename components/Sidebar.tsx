
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
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            <h2 className="font-bold text-lg">Groups</h2>
          </div>
          <button 
            onClick={onAddGroup}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-tight">
          Organize your tables into functional areas with color coding.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {groups.map(group => (
          <div 
            key={group.id} 
            className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: group.color }}
              />
              <span className="font-medium text-slate-700">{group.name}</span>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEditGroup(group)}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-500 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onDeleteGroup(group.id)}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
