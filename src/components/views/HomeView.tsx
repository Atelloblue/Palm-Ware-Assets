import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, Gamepad2, Link as LinkIcon, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const HomeView: React.FC = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 flex-1 flex flex-col items-center justify-center"
    >
      <div className="max-w-4xl mx-auto w-full py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="bg-accent/50 p-5 rounded-3xl mb-6 border border-accent shadow-xl">
            <Palmtree className="w-20 h-20 text-main" />
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-4 text-main">Palm-Ware</h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Your post-work entertainment hub. <span className="text-main font-semibold">Palm-Ware</span> gives you 
            curated links and games to seamlessly play and browse social media when you're done with work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <div className="bg-secondary border border-accent p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-accent/50 p-3 rounded-xl mb-4"><Gamepad2 className="w-6 h-6 text-main" /></div>
            <h3 className="text-lg font-semibold text-main mb-2">Curated Games</h3>
            <p className="text-sm text-secondary">A handpicked selection of the best web games to play instantly.</p>
          </div>
          <div className="bg-secondary border border-accent p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-accent/50 p-3 rounded-xl mb-4"><LinkIcon className="w-6 h-6 text-main" /></div>
            <h3 className="text-lg font-semibold text-main mb-2">Quick Links</h3>
            <p className="text-sm text-secondary">Direct shortcuts to unblocked sites.</p>
          </div>
          <div className="bg-secondary border border-accent p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="bg-accent/50 p-3 rounded-xl mb-4"><Zap className="w-6 h-6 text-main" /></div>
            <h3 className="text-lg font-semibold text-main mb-2">Instant Access</h3>
            <p className="text-sm text-secondary">No downloads or installations required. Just click and play right in your browser.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/games" className="flex items-center gap-3 px-8 py-4 bg-main hover:opacity-90 text-primary rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg">
            <Gamepad2 className="w-5 h-5" />
            <span>Play Games</span>
          </Link>
          <Link to="/unblockers" className="flex items-center gap-3 px-8 py-4 bg-secondary hover:bg-accent border border-accent rounded-xl text-main font-semibold transition-all hover:scale-105 active:scale-95">
            <LinkIcon className="w-5 h-5" />
            <span>Open Unblockers</span>
          </Link>
          <Link to="/browser" className="flex items-center gap-3 px-8 py-4 bg-accent hover:bg-zinc-700 border border-accent rounded-xl text-main font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg">
            <Globe className="w-5 h-5" />
            <span>Open Browser</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default HomeView;
