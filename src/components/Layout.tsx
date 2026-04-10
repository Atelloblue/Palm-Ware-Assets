import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Palmtree, Info, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { isPlus } = useAuth();
  const location = useLocation();
  
  // Hide header in play view
  const isPlayView = location.pathname.startsWith('/play/');
  
  return (
    <div className={`flex flex-col ${isPlayView ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!isPlayView && (
        <header className="flex items-center justify-between p-6 z-50 sticky top-0 bg-primary/80 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Palmtree className="w-6 h-6 text-main" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-main">Palm-Ware</span>
              {isPlus && (
                <span className="px-1.5 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">
                  Plus
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              to="/about" 
              className="p-2 rounded-md hover:bg-accent transition-colors text-secondary hover:text-main" 
              title="About"
            >
              <Info className="w-6 h-6" />
            </Link>
            <Link 
              to="/settings" 
              className="p-2 rounded-md hover:bg-accent transition-colors text-secondary hover:text-main" 
              title="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </Link>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
