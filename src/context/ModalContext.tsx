import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCancel?: boolean;
  onConfirm?: () => void;
}

interface ModalContextType {
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, options?: Partial<ModalOptions>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({ title: '', message: '' });

  const showAlert = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setOptions({ title, message, type, showCancel: false });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, extraOptions?: Partial<ModalOptions>) => {
    setOptions({ title, message, onConfirm, showCancel: true, ...extraOptions });
    setIsOpen(true);
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        {...options} 
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
