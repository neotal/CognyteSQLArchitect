
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Key, Search, Type, Hash, Palette, AlertCircle } from 'lucide-react';
import { Table, Column, Group } from '../types';
import { DEFAULT_COLORS } from '../constants';

interface TableModalProps {
  groups: Group[];
  initialData?: Table | null;
  allTables: Table[];
  onSave: (table: any) => void;
  onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ groups, initialData, allTables, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || DEFAULT_COLORS[0]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(initialData?.groupIds || [groups[0]?.id || 'default']);
  const [columns, setColumns] = useState<Column[]>(initialData?.columns || [{ id: crypto.randomUUID(), name: 'id', isKey: true }]);
  const [colSearch, setColSearch] = useState('');

  const handleAddColumn = () => {
    setColumns([...columns, { id: crypto.randomUUID(), name: '', isKey: false }]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const handleUpdateColumn = (id: string, updates: Partial<Column>) => {
    setColumns(columns.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const filteredColumns = columns.filter(c => c.name.toLowerCase().includes(colSearch.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isDuplicateName = allTables.some(t => t.id !== initialData?.id && t.name.toLowerCase() === name.toLowerCase());
    if (isDuplicateName) {
      alert("A table with this name already exists.");
      return;
    }

    if (selectedGroupIds.length === 0) {
      alert("Error: You must assign this table to at least one group.");
      return;
    }

    if (columns.some(c => !c.name.trim())) {
      alert("All columns must have valid names.");
      return;
    }

    onSave({
      ...initialData,
      name: name.trim(),
      description,
      color,
      groupIds: selectedGroupIds,
      columns
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{initialData ? 'Edit Entity' : 'New Table Entity'}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Define your schema architecture</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6 text-slate-300 hover:text-slate-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="e.g. users_registry"
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Table Context</label>
                <textarea 
                  placeholder="Add a description for hover view..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all h-24 text-sm resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Accent</label>
                  <div className="flex items-center space-x-1 border border-slate-100 px-1.5 py-0.5 rounded-lg bg-slate-50">
                    <input 
                      type="color" 
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-6 h-6 cursor-pointer border-none bg-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_COLORS.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 rounded-lg border-2 transition-all ${color === c ? 'border-slate-800 scale-105 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Group (Required)</label>
                  {selectedGroupIds.length === 0 && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                  {groups.map(g => (
                    <button 
                      key={g.id}
                      type="button"
                      onClick={() => {
                        if (selectedGroupIds.includes(g.id)) {
                          if (selectedGroupIds.length > 1) {
                            setSelectedGroupIds(selectedGroupIds.filter(id => id !== g.id));
                          }
                        } else {
                          setSelectedGroupIds([...selectedGroupIds, g.id]);
                        }
                      }}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all ${
                        selectedGroupIds.includes(g.id) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schema Fields</label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search fields..." 
                    value={colSearch}
                    onChange={e => setColSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-44 transition-all"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddColumn}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Field
                </button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-60 overflow-y-auto bg-slate-50/30 custom-scrollbar">
              {filteredColumns.map(col => (
                <div key={col.id} className="p-3.5 flex items-center space-x-3 bg-white hover:bg-blue-50/10 transition-colors group">
                  <button 
                    type="button"
                    title={col.isKey ? "Primary Key" : "Set Primary Key"}
                    onClick={() => handleUpdateColumn(col.id, { isKey: !col.isKey })}
                    className={`p-2.5 rounded-xl transition-all ${col.isKey ? 'bg-amber-100 text-amber-600 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="column_name"
                      value={col.name}
                      onChange={e => handleUpdateColumn(col.id, { name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveColumn(col.id)}
                    className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 flex justify-end items-center space-x-4 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-12 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Create Table'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
