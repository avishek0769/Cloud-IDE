import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Glassmorphic dark overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        {/* Modal Card */}
        <div className="relative bg-[#0c0c0f] rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-900/80 z-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded-md hover:bg-gray-800/40 transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}