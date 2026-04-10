import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useModal } from '../../context/ModalContext';

const BrowserView: React.FC = () => {
  const { showAlert } = useModal();

  useEffect(() => {
    showAlert('Browser Status', 'The browser is currently broken and will be fixed in version 2.3.', 'error');
  }, [showAlert]);
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen overflow-hidden bg-primary"
    >
      <div className="flex items-center justify-between p-4 bg-secondary border-b border-accent z-50">
        <div className="flex items-center gap-4">
          <RouterLink to="/" className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary hover:text-main transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </RouterLink>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-main" />
            <h2 className="font-bold text-main">Palm-Ware Browser</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        <iframe 
          src="https://v3ontop.b-cdn.net/" 
          className="w-full h-full border-none"
          allowFullScreen
        />
      </div>
    </motion.section>
  );
};

export default BrowserView;
