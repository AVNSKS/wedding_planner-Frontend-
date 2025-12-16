import React from 'react';
import { X, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, type = 'info', title, message, confirmText = 'OK', onConfirm }) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      border: 'border-rose-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: CheckCircle,
      buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-rose-900'
    },
    error: {
      bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
      border: 'border-rose-300',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      icon: AlertTriangle,
      buttonBg: 'bg-rose-500 hover:bg-rose-600',
      textColor: 'text-rose-900'
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: AlertCircle,
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
      textColor: 'text-amber-900'
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-50 to-sky-50',
      border: 'border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: Info,
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-900'
    }
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-900/20 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`${style.bg} rounded-2xl w-full max-w-md border-2 ${style.border} shadow-2xl animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between p-6 border-b-2 ${style.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${style.iconBg}`}>
              <Icon className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <h3 className={`text-xl font-bold ${style.textColor}`}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className={`${style.iconColor} hover:opacity-70 transition-colors p-1 hover:bg-white/50 rounded-lg`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`${style.textColor} leading-relaxed`}>{message}</p>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t-2 ${style.border}`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-xl font-bold ${style.textColor} bg-white border-2 ${style.border} hover:bg-gray-50 transition-all`}
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-black ${style.buttonBg} transition-all shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
