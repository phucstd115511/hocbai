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
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop with optical blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2.5 sm:p-6 text-center">
        <div 
          className={`relative transform overflow-hidden rounded-2xl sm:rounded-[32px] neu-card bg-[#EBECF0] dark:bg-[#1A1E24] border border-white/80 dark:border-white/10 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all my-auto w-full max-h-[92dvh] flex flex-col ${maxWidth}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-black/5 dark:border-white/5 shrink-0">
            <h3 className="text-sm sm:text-lg font-display font-extrabold text-[#2D3748] dark:text-white tracking-tight truncate pr-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl neu-btn flex items-center justify-center text-[#718096] dark:text-[#94A3B8] hover:text-[#FF8800] active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
