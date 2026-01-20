
import React from 'react';
import { Users, Plus, Edit2, Trash2, Download, Upload, FileJson, Github } from 'lucide-react';
import { Group } from '../types';

interface SidebarProps {
  groups: Group[];
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, onAddGroup, onEditGroup, onDeleteGroup, onExport, onImport }) => {
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
      
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center text-slate-800 mb-4">
          <Github className="w-5 h-5 mr-2 text-slate-700" />
          <h2 className="font-bold text-sm tracking-tight">Git Persistence</h2>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onExport}
            className="w-full flex items-center justify-center p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all group shadow-lg shadow-slate-200"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Update Project File</span>
          </button>
          
          <label className="flex items-center justify-center p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group cursor-pointer shadow-sm">
            <Upload className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-700">Import Local JSON</span>
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
        
        <div className="mt-5 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
           <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
             <span className="font-black text-slate-900 block mb-1 uppercase tracking-tighter">Workflow:</span>
             1. Press <span className="text-indigo-600 font-bold">Update Project File</span><br/>
             2. Save as <span className="text-slate-900 font-bold">project-data.json</span><br/>
             3. <span className="italic font-bold">Git Commit & Push</span> to share.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
