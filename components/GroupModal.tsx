
import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
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
    if (!name.trim()) return;
    onSave({ ...initialData, name: name.trim(), color });
  };

  const paletteColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{initialData ? 'Update Group' : 'New Canvas Group'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6 text-slate-300 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</label>
            <input 
              autoFocus
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
              placeholder="e.g. Sales Division"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Palette className="w-3.5 h-3.5 mr-1.5" /> Identity Palette
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Custom Picker</span>
                  <span className="text-[10px] font-bold text-blue-500 font-mono">{color.toUpperCase()}</span>
                </div>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md ring-2 ring-slate-100 border border-slate-200">
                  <input 
                    type="color" 
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
              {paletteColors.map(c => (
                <button 
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-sm border transition-all hover:scale-125 ${color.toLowerCase() === c.toLowerCase() ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-300'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_COLORS.map(c => (
                <button 
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 rounded-lg border-2 transition-all shadow-sm hover:scale-105 ${color === c ? 'border-slate-800 ring-2 ring-slate-100' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors">Cancel</button>
            <button 
              type="submit" 
              className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
