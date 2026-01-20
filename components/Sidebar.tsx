
import React from 'react';
import { Users, Plus, Edit2, Trash2, Github, Save, Info, AlertCircle } from 'lucide-react';
import { Group } from '../types';

interface SidebarProps {
  groups: Group[];
  isDirty: boolean;
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  onExport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, isDirty, onAddGroup, onEditGroup, onDeleteGroup, onExport }) => {
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
          Architecture Organization
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
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-800">
            <Github className="w-5 h-5 mr-2 text-slate-700" />
            <h2 className="font-bold text-sm tracking-tight">Sync & Git</h2>
          </div>
          {isDirty && (
            <div className="flex items-center text-[9px] font-black text-amber-500 uppercase animate-pulse">
              <AlertCircle className="w-3 h-3 mr-1" /> Unsynced
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onExport}
            className={`w-full flex items-center justify-center p-4 rounded-2xl transition-all group shadow-lg active:scale-95 ${
              isDirty 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 border-2 border-blue-400' 
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
          >
            <Save className={`w-4 h-4 mr-2 ${isDirty ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isDirty ? 'Sync Changes to File' : 'Update Project File'}
            </span>
          </button>
        </div>
        
        <div className="mt-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
           <div className="flex items-start space-x-2">
             <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
             <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
               Loads strictly from <span className="text-slate-900 font-bold">project-data.json</span>. 
               Git pull will refresh your canvas instantly.
             </p>
           </div>
           
           <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
             <span className="font-black text-slate-900 block mb-1 uppercase tracking-tighter text-[8px]">Workflow:</span>
             <ol className="text-[8px] text-slate-500 space-y-1 list-decimal ml-3">
               <li>Make manual updates on canvas</li>
               <li>Click <span className="font-bold text-blue-600">Sync to File</span></li>
               <li>Overwrite <span className="font-bold">project-data.json</span></li>
               <li><span className="italic font-bold">Git Commit & Push</span></li>
             </ol>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
