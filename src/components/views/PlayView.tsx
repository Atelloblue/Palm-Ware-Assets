import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Maximize2, RotateCcw, Palmtree } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GAMES } from '../../constants';
import { useSettings } from '../../context/SettingsContext';

const PlayView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');
  const [progress, setProgress] = useState(0);

  const game = GAMES.find(g => g.id === id);

  useEffect(() => {
    if (game) {
      setIframeSrc(game.url);
      setLoading(true);
    }
  }, [game]);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      // Finish in ~400ms
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const handleReload = () => {
    setLoading(true);
    const current = iframeSrc;
    setIframeSrc('');
    setTimeout(() => setIframeSrc(current), 100);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('player-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  if (!game) return null;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col overflow-hidden bg-primary"
    >
      <div className="flex items-center justify-between p-4 bg-secondary border-b border-accent z-50">
        <div className="flex items-center gap-4">
          <RouterLink to="/games" className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary hover:text-main transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </RouterLink>
          <h2 className="font-bold text-main">{game.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleReload}
            className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary hover:text-main transition-colors" 
            title="Reload Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary hover:text-main transition-colors" 
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div id="player-container" className="flex-1 relative bg-black overflow-hidden">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000000]"
            >
              <div className="flex flex-col items-center gap-8 w-full max-w-[200px]">
                <div className="flex flex-col items-center gap-4">
                  <Palmtree className="w-20 h-20 text-white fill-white/10" strokeWidth={1.5} />
                  <h1 className="text-2xl font-semibold text-white tracking-tight">Palm-Tree</h1>
                </div>
                
                <div className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {iframeSrc && (
          <iframe 
            src={iframeSrc}
            onLoad={() => setLoading(false)}
            className={`absolute inset-0 w-full h-full border-none transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
            allowFullScreen
          />
        )}
      </div>
    </motion.section>
  );
};

export default PlayView;
