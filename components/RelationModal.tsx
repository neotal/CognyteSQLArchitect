
import React, { useState } from 'react';
import { X, Search, Link2 } from 'lucide-react';
import { Table, RelationType } from '../types';

interface RelationModalProps {
  tables: Table[];
  onSave: (from: string, to: string, type: RelationType) => void;
  onClose: () => void;
}

const RelationModal: React.FC<RelationModalProps> = ({ tables, onSave, onClose }) => {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [type, setType] = useState<RelationType>('1:1');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const relationTypes: RelationType[] = ['1:1', '1:N', 'N:1', 'N:N'];

  const filteredFrom = tables.filter(t => t.name.toLowerCase().includes(searchFrom.toLowerCase()));
  const filteredTo = tables.filter(t => t.name.toLowerCase().includes(searchTo.toLowerCase()) && t.id !== fromId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Link2 className="w-6 h-6 text-blue-600" /></div>
            <h2 className="text-2xl font-black text-slate-800">Establish Relationship</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="p-8 grid grid-cols-3 gap-8">
          {/* Source Table Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Source Table</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Filter source..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={searchFrom}
                onChange={e => setSearchFrom(e.target.value)}
              />
            </div>
            <div className="h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-2xl p-2 bg-slate-50/30">
              {filteredFrom.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setFromId(t.id)}
                  className={`w-full p-3 text-left rounded-xl transition-all border ${
                    fromId === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white hover:border-blue-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold">{t.name}</div>
                  <div className="text-[10px] opacity-70">{t.columns.length} columns</div>
                </button>
              ))}
            </div>
          </div>

          {/* Relation Type */}
          <div className="flex flex-col items-center justify-center space-y-6">
             <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Cardinality</label>
             <div className="grid grid-cols-2 gap-3 w-full">
               {relationTypes.map(rt => (
                 <button 
                  key={rt}
                  onClick={() => setType(rt)}
                  className={`py-4 px-2 rounded-2xl border-2 transition-all font-black text-xl ${
                    type === rt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-300 hover:border-slate-200'
                  }`}
                 >
                   {rt}
                 </button>
               ))}
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl text-center w-full">
               <p className="text-xs text-slate-400 leading-relaxed">
                 Defines how records in the <span className="text-blue-600 font-bold">source</span> relate to records in the <span className="text-blue-600 font-bold">target</span>.
               </p>
             </div>
          </div>

          {/* Target Table Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Target Table</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Filter target..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTo}
                onChange={e => setSearchTo(e.target.value)}
              />
            </div>
            <div className="h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-2xl p-2 bg-slate-50/30">
              {filteredTo.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setToId(t.id)}
                  className={`w-full p-3 text-left rounded-xl transition-all border ${
                    toId === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white hover:border-blue-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold">{t.name}</div>
                  <div className="text-[10px] opacity-70">{t.columns.length} columns</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex justify-end space-x-4 bg-slate-50">
          <button onClick={onClose} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800">Cancel</button>
          <button 
            disabled={!fromId || !toId}
            onClick={() => onSave(fromId, toId, type)}
            className="px-12 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-200 disabled:shadow-none transition-all"
          >
            Create Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
