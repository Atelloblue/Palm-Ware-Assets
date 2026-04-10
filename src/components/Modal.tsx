import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'info',
  showCancel = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-400" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-rose-400" />;
      default: return <Info className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-secondary border border-accent w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-accent rounded-2xl">
                  {getIcon()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-main mb-2">{title}</h2>
              <p className="text-sm text-secondary leading-relaxed">{message}</p>
            </div>
            <div className="p-4 bg-primary/50 border-t border-accent flex gap-3">
              {showCancel && (
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-accent hover:bg-zinc-700 text-main rounded-xl font-bold transition-all active:scale-95"
                >
                  {cancelText}
                </button>
              )}
              <button 
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-main text-primary rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
