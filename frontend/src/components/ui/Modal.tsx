'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
        className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-2 border-[#1B5E20]/20 z-10 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5 shrink-0">
            <div className="space-y-1">
              {title && <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-gray-500 font-medium">{description}</p>}
            </div>

            {showCloseButton && (
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

export const Dialog = Modal;
