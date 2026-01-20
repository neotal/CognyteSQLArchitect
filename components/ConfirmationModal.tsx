
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-red-50/30">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-black tracking-tight">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white rounded-full transition-colors text-slate-300 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-left">
            {message}
          </p>
        </div>

        <div className="p-6 bg-slate-50 flex flex-row gap-3 border-t border-slate-100">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white text-slate-500 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
