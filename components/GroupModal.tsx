
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Group } from '../types';
import { DEFAULT_COLORS } from '../constants';

interface GroupModalProps {
  initialData?: Group | null;
  onSave: (group: any) => void;
  onClose: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ initialData, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initialData, name, color });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Group' : 'New Group'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Group Name</label>
            <input 
              autoFocus
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Sales, Authentication"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Identifier Color</label>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_COLORS.map(c => (
                <button 
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all shadow-sm ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-500 font-medium">Cancel</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              {initialData ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
