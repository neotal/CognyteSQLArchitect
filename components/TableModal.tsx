
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Key, Search, Type, Hash } from 'lucide-react';
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
    
    // Validation: Unique Name
    const isDuplicateName = allTables.some(t => t.id !== initialData?.id && t.name.toLowerCase() === name.toLowerCase());
    if (isDuplicateName) {
      alert("A table with this name already exists. Please choose a unique name.");
      return;
    }

    if (selectedGroupIds.length === 0) {
      alert("At least one group must be selected.");
      return;
    }

    if (columns.some(c => !c.name.trim())) {
      alert("All columns must have a name.");
      return;
    }

    onSave({
      ...initialData,
      name,
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{initialData ? 'Update Table' : 'New SQL Table'}</h2>
            <p className="text-xs text-slate-400 font-medium">Define your schema, keys and relationships.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6 text-slate-300 hover:text-slate-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Basic Info</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="table_name"
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Optional description of the table's purpose..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all h-24 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Color Accent</label>
                <div className="grid grid-cols-4 gap-3">
                  {DEFAULT_COLORS.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm ${color === c ? 'border-slate-800 scale-105 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Associations</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
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
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table Schema</label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search cols..." 
                    value={colSearch}
                    onChange={e => setColSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-40 transition-all"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddColumn}
                  className="flex items-center px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Column
                </button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-60 overflow-y-auto bg-slate-50/30">
              {filteredColumns.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-sm font-medium italic">
                   No columns match your search.
                </div>
              )}
              {filteredColumns.map(col => (
                <div key={col.id} className="p-3.5 flex items-center space-x-3 bg-white hover:bg-slate-50 transition-colors group">
                  <button 
                    type="button"
                    title={col.isKey ? "Remove Primary Key" : "Set as Primary Key"}
                    onClick={() => handleUpdateColumn(col.id, { isKey: !col.isKey })}
                    className={`p-2 rounded-xl transition-all ${col.isKey ? 'bg-amber-100 text-amber-600 shadow-inner' : 'bg-slate-100 text-slate-300 hover:text-amber-400 hover:bg-slate-200'}`}
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="e.g. created_at"
                      value={col.name}
                      onChange={e => handleUpdateColumn(col.id, { name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
          <button onClick={onClose} className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-black text-sm uppercase tracking-widest transition-colors">Discard</button>
          <button 
            onClick={handleSubmit}
            className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
          >
            {initialData ? 'Update Entity' : 'Create Entity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
