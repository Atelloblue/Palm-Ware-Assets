import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db, collection, onSnapshot } from '../../firebase';
import { ManagedUnblocker, ManagedLink } from '../../types';
import { NO_IMAGE_URL } from '../../constants';

const UnblockersView: React.FC = () => {
  const { userData, isPlus } = useAuth();
  const { showAlert } = useModal();
  const [managedUnblockers, setManagedUnblockers] = useState<ManagedUnblocker[]>([]);
  const [managedLinks, setManagedLinks] = useState<ManagedLink[]>([]);

  useEffect(() => {
    const unblockersUnsub = onSnapshot(collection(db, 'managedUnblockers'), (snapshot) => {
      const list: ManagedUnblocker[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as ManagedUnblocker));
      setManagedUnblockers(list);
    });

    const linksUnsub = onSnapshot(collection(db, 'managedLinks'), (snapshot) => {
      const list: ManagedLink[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as ManagedLink));
      setManagedLinks(list);
    });

    return () => {
      unblockersUnsub();
      linksUnsub();
    };
  }, []);

  const getCombinedUnblockers = () => {
    const combined = [...managedUnblockers];
    combined.sort((a, b) => a.title.localeCompare(b.title));
    return combined;
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 flex-1"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-main mb-2">Unblockers</h1>
            <p className="text-secondary">Access your favorite web unblockers.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-20">
          {getCombinedUnblockers().map(p => {
            const isLocked = p.isPlus && !isPlus;
            
            return (
              <Link 
                key={p.id}
                to={isLocked ? '#' : `/unblocker/${p.id}`}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    showAlert('Plus Required', 'Palm-Ware Plus is required to access this unblocker.', 'warning');
                  }
                }}
                className={`group relative bg-secondary border border-accent rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isLocked ? 'opacity-50 grayscale' : 'hover:border-zinc-600'
                }`}
              >
                <div className="w-16 h-16 mb-4 rounded-xl bg-primary p-3 flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={p.icon || NO_IMAGE_URL} 
                    alt={p.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity rounded-lg" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE_URL; }}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-secondary/60 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                      <Lock className="w-6 h-6 text-amber-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-main">{p.title}</h3>
                  {p.verified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/10" />}
                  {p.isPlus && (
                    <span className="px-1.5 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">
                      Plus
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 mt-1">{p.category}</span>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default UnblockersView;
