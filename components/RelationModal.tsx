
import React, { useState, useEffect } from 'react';
import { X, Search, Link2, Database, Table as TableIcon, Layers } from 'lucide-react';
import { Table, Relationship, RelationType, Column } from '../types';

interface RelationModalProps {
  tables: Table[];
  initialData?: Relationship | null;
  onSave: (fromTableId: string, fromColId: string, toTableId: string, toColId: string, type: RelationType) => void;
  onClose: () => void;
}

const RelationModal: React.FC<RelationModalProps> = ({ tables, initialData, onSave, onClose }) => {
  const [fromTableId, setFromTableId] = useState(initialData?.fromTableId || '');
  const [fromColId, setFromColId] = useState(initialData?.fromColumnId || '');
  const [toTableId, setToTableId] = useState(initialData?.toTableId || '');
  const [toColId, setToColId] = useState(initialData?.toColumnId || '');
  const [type, setType] = useState<RelationType>(initialData?.type || '1:1');
  
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [colSearchFrom, setColSearchFrom] = useState('');
  const [colSearchTo, setColSearchTo] = useState('');

  const relationTypes: RelationType[] = ['1:1', '1:N', 'N:1', 'N:N'];

  // Table Selection logic: Table cannot connect to itself
  const filteredFromTables = tables
    .filter(t => t.id !== toTableId)
    .filter(t => t.name.toLowerCase().includes(searchFrom.toLowerCase()));
    
  const filteredToTables = tables
    .filter(t => t.id !== fromTableId)
    .filter(t => t.name.toLowerCase().includes(searchTo.toLowerCase()));
  
  const fromTable = tables.find(t => t.id === fromTableId);
  const toTable = tables.find(t => t.id === toTableId);

  const fromCols = fromTable?.columns.filter(c => c.name.toLowerCase().includes(colSearchFrom.toLowerCase())) || [];
  const toCols = toTable?.columns.filter(c => c.name.toLowerCase().includes(colSearchTo.toLowerCase())) || [];

  useEffect(() => {
    // Reset column if table changes and it's not the initial edit load
    if (initialData?.fromTableId !== fromTableId) {
      setFromColId('');
    }
  }, [fromTableId]);

  useEffect(() => {
    if (initialData?.toTableId !== toTableId) {
      setToColId('');
    }
  }, [toTableId]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Link2 className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{initialData ? 'Update Connection' : 'New Column Relationship'}</h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Connect specific attributes across tables</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="p-8 grid grid-cols-7 gap-6 overflow-y-auto">
          {/* FROM SIDE */}
          <div className="col-span-3 space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 text-center">Source Table</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" placeholder="Filter tables..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchFrom} onChange={e => setSearchFrom(e.target.value)}
                />
              </div>
              <div className="h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {filteredFromTables.map(t => (
                  <button 
                    key={t.id} onClick={() => setFromTableId(t.id)}
                    className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center ${
                      fromTableId === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:border-blue-300 border border-transparent text-slate-700'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5 mr-2 opacity-70" />
                    <span className="font-bold text-xs truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${fromTableId ? 'bg-slate-50 border-slate-200 shadow-inner' : 'bg-slate-50/50 border-slate-100 opacity-50 pointer-events-none'}`}>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Source Attribute</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" placeholder="Filter columns..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={colSearchFrom} onChange={e => setColSearchFrom(e.target.value)}
                />
              </div>
              <div className="h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {fromCols.map(c => (
                  <button 
                    key={c.id} onClick={() => setFromColId(c.id)}
                    className={`w-full p-2.5 text-left rounded-xl transition-all border ${
                      fromColId === c.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MID SECTION: Cardinality */}
          <div className="col-span-1 flex flex-col items-center justify-center space-y-4 px-2">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
             <div className="space-y-2 w-full">
               {relationTypes.map(rt => (
                 <button 
                  key={rt} onClick={() => setType(rt)}
                  className={`w-full py-3 rounded-xl border-2 transition-all font-black text-sm ${
                    type === rt ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm scale-105' : 'border-slate-100 text-slate-300 hover:border-slate-200'
                  }`}
                 >
                   {rt}
                 </button>
               ))}
             </div>
             <div className="bg-slate-900 rounded-full p-2 text-white animate-bounce mt-4 shadow-xl">
               <Layers className="w-5 h-5" />
             </div>
          </div>

          {/* TO SIDE */}
          <div className="col-span-3 space-y-4">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 text-center">Target Table</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" placeholder="Filter tables..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTo} onChange={e => setSearchTo(e.target.value)}
                />
              </div>
              <div className="h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {filteredToTables.map(t => (
                  <button 
                    key={t.id} onClick={() => setToTableId(t.id)}
                    className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center ${
                      toTableId === t.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:border-indigo-300 border border-transparent text-slate-700'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5 mr-2 opacity-70" />
                    <span className="font-bold text-xs truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${toTableId ? 'bg-slate-50 border-slate-200 shadow-inner' : 'bg-slate-50/50 border-slate-100 opacity-50 pointer-events-none'}`}>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Target Attribute</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" placeholder="Filter columns..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={colSearchTo} onChange={e => setColSearchTo(e.target.value)}
                />
              </div>
              <div className="h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {toCols.map(c => (
                  <button 
                    key={c.id} onClick={() => setToColId(c.id)}
                    className={`w-full p-2.5 text-left rounded-xl transition-all border ${
                      toColId === c.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex justify-end space-x-4 bg-white">
          <button onClick={onClose} className="px-8 py-3 text-slate-500 font-black text-xs uppercase tracking-widest">Discard</button>
          <button 
            disabled={!fromTableId || !fromColId || !toTableId || !toColId}
            onClick={() => onSave(fromTableId, fromColId, toTableId, toColId, type)}
            className="px-12 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
          >
            {initialData ? 'Update Relationship' : 'Commit Relationship'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
