import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-90 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-[#111] rounded-lg w-full max-w-md p-6 shadow-xl border border-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}