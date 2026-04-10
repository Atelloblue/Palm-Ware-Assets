import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Link as LinkIcon, Lock, ExternalLink, Link2Off } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db, collection, onSnapshot, doc, getDoc } from '../../firebase';
import { ManagedUnblocker, ManagedLink } from '../../types';

const LinksView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isPlus } = useAuth();
  const { showAlert } = useModal();
  const [unblocker, setUnblocker] = useState<ManagedUnblocker | null>(null);
  const [links, setLinks] = useState<ManagedLink[]>([]);
  const [statuses, setStatuses] = useState<Record<number, 'checking' | 'unblocked' | 'blocked'>>({});

  useEffect(() => {
    if (!id) return;

    const fetchUnblocker = async () => {
      const d = await getDoc(doc(db, 'managedUnblockers', id));
      if (d.exists()) {
        setUnblocker({ ...d.data(), id: d.id } as ManagedUnblocker);
      }
    };
    fetchUnblocker();

    const linksUnsub = onSnapshot(collection(db, 'managedLinks'), (snapshot) => {
      const list: ManagedLink[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as ManagedLink;
        if (data.targetUnblockerId === id) {
          list.push({ ...data, id: doc.id });
        }
      });
      setLinks(list);
    });

    return () => linksUnsub();
  }, [id]);

  useEffect(() => {
    links.forEach((link, index) => {
      setStatuses(prev => ({ ...prev, [index]: 'checking' }));
      
      const check = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          await fetch(link.url, { mode: 'no-cors', signal: controller.signal });
          clearTimeout(timeoutId);
          setStatuses(prev => ({ ...prev, [index]: 'unblocked' }));
        } catch (error) {
          setStatuses(prev => ({ ...prev, [index]: 'blocked' }));
        }
      };
      check();
    });
  }, [links]);

  if (!unblocker) return null;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 flex-1"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <RouterLink to="/unblockers" className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary hover:text-main transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </RouterLink>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-main">{unblocker.title}</h1>
              {unblocker.verified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/10" />}
              {unblocker.isPlus && (
                <span className="px-2 py-1 bg-main text-[12px] font-black text-primary rounded uppercase tracking-tighter">
                  Plus
                </span>
              )}
            </div>
            <p className="text-secondary">Available links for {unblocker.title}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary border border-accent border-dashed rounded-xl">
              <div className="p-4 bg-accent/50 rounded-full mb-4">
                <Link2Off className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-main mb-2">No Links Available</h3>
              <p className="text-secondary max-w-xs">There are currently no links available for {unblocker.title}. Please check back later.</p>
            </div>
          ) : (
            links.map((link, index) => {
              const linkIsLocked = link.isPlus && !isPlus;
              const status = statuses[index] || 'checking';

              return (
                <a 
                  key={link.id}
                  href={linkIsLocked ? undefined : link.url}
                  target={linkIsLocked ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (linkIsLocked) {
                      e.preventDefault();
                      showAlert('Plus Required', 'Palm-Ware Plus is required to access this link.', 'warning');
                    }
                  }}
                  className={`group flex items-center justify-between p-6 bg-secondary border border-accent rounded-xl transition-all ${
                    linkIsLocked ? 'opacity-50 grayscale' : 'hover:opacity-80 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-accent rounded-lg text-secondary group-hover:text-main transition-colors flex-shrink-0 relative">
                      <LinkIcon className="w-6 h-6" />
                      {linkIsLocked && (
                        <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center rounded-lg">
                          <Lock className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-main truncate">{link.title}</h3>
                        {link.isPlus && (
                          <span className="px-1.5 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">
                            Plus
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary truncate max-w-[150px] sm:max-w-md">{link.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="hidden md:block">
                      {status === 'checking' && (
                        <span className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse"></span>
                          Checking...
                        </span>
                      )}
                      {status === 'unblocked' && (
                        <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Status: Unblocked
                        </span>
                      )}
                      {status === 'blocked' && (
                        <span className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                          Status: Blocked
                        </span>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-accent/50 text-secondary group-hover:text-main transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default LinksView;
