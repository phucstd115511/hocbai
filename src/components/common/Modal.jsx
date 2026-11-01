import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with optical blur */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div 
          className={`relative transform overflow-hidden rounded-[32px] neu-card bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 text-left shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-all sm:my-8 w-full ${maxWidth}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/5 dark:border-white/5">
            <h3 className="text-lg font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
