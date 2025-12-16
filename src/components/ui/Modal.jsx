import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto border-2 border-rose-200 animate-slideUp">
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-rose-200">
            <h2 className="text-2xl font-bold text-rose-900">{title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-rose-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="text-rose-900">
          {children}
        </div>
        {!title && onClose && (
          <div className="mt-6 pt-4 flex justify-end border-t-2 border-rose-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-rose-600 bg-white border-2 border-rose-300 rounded-xl hover:bg-rose-50 transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
