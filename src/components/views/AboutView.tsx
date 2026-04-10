import React, { useState } from 'react';
import { Palmtree, Info, MessageSquare, AlertCircle, ClipboardList, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CREDITS } from '../../constants';

const PatchNotesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-secondary border border-accent w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-accent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg text-main">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-main">Patch Notes</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg text-secondary hover:text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              <div>
                <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-3">Version 2.2</h3>
                <p className="text-sm text-secondary italic">No patch notes available for this version.</p>
              </div>
            </div>
            <div className="p-4 bg-primary/50 border-t border-accent text-center">
              <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter">Thanks for using Palm-Ware!</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AboutView: React.FC = () => {
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 flex-1"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-12 py-8">
        <section className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="bg-accent/50 p-5 rounded-3xl mb-6 border border-accent shadow-xl">
              <Palmtree className="w-16 h-16 text-main" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold text-main tracking-tight">About Palm-Ware</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-accent text-secondary text-xs font-bold rounded-full border border-accent uppercase tracking-widest">Version 2.2</span>
                <button 
                  onClick={() => setIsPatchNotesOpen(true)}
                  className="px-2 py-1 bg-accent hover:opacity-80 text-secondary hover:text-main text-xs font-bold rounded-full border border-accent transition-all cursor-pointer flex items-center justify-center" 
                  title="View Patch Notes"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              Palm-Ware is a next-generation unblocked games platform designed for speed, 
              simplicity, and a premium gaming experience. We believe everyone should have 
              access to high-quality entertainment without unnecessary restrictions.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="https://discord.gg/pt6kbu2CEg" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-secondary border border-accent rounded-xl hover:opacity-80 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-main">Join our Discord</h3>
                <p className="text-sm text-secondary">Connect with the community</p>
              </div>
            </div>
          </a>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLScP_1MuUNCKxAujT2Ug9d83WJbirb5K4trxwEQQhtxTG5bMKg/viewform?usp=dialog" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 bg-secondary border border-accent rounded-xl hover:opacity-80 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-main">Report a Problem</h3>
                <p className="text-sm text-secondary">Help us improve Palm-Ware</p>
              </div>
            </div>
          </a>
        </section>

        <section className="relative h-80 overflow-hidden bg-secondary border border-accent rounded-xl p-8 flex flex-col items-center">
          <div className="w-full relative">
            <div className="credits-roll flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-4 mb-4">
                <Palmtree className="w-10 h-10 text-secondary" />
                <div className="text-secondary uppercase tracking-[0.3em] text-xs font-black">The Palmware Team</div>
              </div>
              <div className="flex flex-col items-center gap-8">
                {CREDITS.map((c, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-bold text-main">{c.name}</div>
                    <div className="text-sm text-zinc-500 font-medium">{c.role}</div>
                  </div>
                ))}
              </div>
              <div className="h-20"></div>
            </div>
          </div>
        </section>
      </div>

      <PatchNotesModal isOpen={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} />
    </motion.section>
  );
};

export default AboutView;
