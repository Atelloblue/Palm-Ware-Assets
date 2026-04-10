import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  User, 
  ShieldCheck, 
  Server, 
  AlertTriangle, 
  EyeOff, 
  Trash2, 
  Paintbrush, 
  Upload, 
  Crown, 
  Check, 
  Info, 
  MessageSquare, 
  LogOut, 
  CheckCircle,
  Key,
  LayoutGrid,
  Link2,
  BadgeCheck,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useModal } from '../../context/ModalContext';
import { THEMES, CLOAK_DATA, NO_IMAGE_URL } from '../../constants';
import { auth, db, googleProvider, signInWithPopup, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, onSnapshot, Timestamp, OperationType, handleFirestoreError } from '../../firebase';
import { ActivationKey, ManagedUnblocker, ManagedLink } from '../../types';

const SettingsView: React.FC = () => {
  const { user, userData, isPlus, isAdmin, refreshUserData } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { showAlert, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState('general');
  const [activationKey, setActivationKey] = useState('');
  const [activationStatus, setActivationStatus] = useState({ message: '', isError: false });
  const [generatedKey, setGeneratedKey] = useState('');
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [managedUnblockers, setManagedUnblockers] = useState<ManagedUnblocker[]>([]);
  const [managedLinks, setManagedLinks] = useState<ManagedLink[]>([]);
  const [selectedLinkType, setSelectedLinkType] = useState<'basic' | 'plus'>('basic');
  
  // Admin Form States
  const [unblockerForm, setUnblockerForm] = useState({ id: '', title: '', icon: '', category: '', verified: false, isPlus: false });
  const [linkForm, setLinkForm] = useState({ targetId: '', title: '', url: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const keysUnsub = onSnapshot(collection(db, 'activationKeys'), (snapshot) => {
      const keysList: ActivationKey[] = [];
      snapshot.forEach(doc => keysList.push(doc.data() as ActivationKey));
      keysList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setKeys(keysList);
    });

    const unblockersUnsub = onSnapshot(collection(db, 'managedUnblockers'), (snapshot) => {
      const list: ManagedUnblocker[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as ManagedUnblocker));
      list.sort((a, b) => a.title.localeCompare(b.title));
      setManagedUnblockers(list);
    });

    const linksUnsub = onSnapshot(collection(db, 'managedLinks'), (snapshot) => {
      const list: ManagedLink[] = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id } as ManagedLink));
      list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setManagedLinks(list);
    });

    return () => {
      keysUnsub();
      unblockersUnsub();
      linksUnsub();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
      showAlert('Login Failed', 'Could not sign in with Google.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleActivatePlus = async () => {
    if (!activationKey || !user) return;
    setActivationStatus({ message: 'Verifying key...', isError: false });
    
    try {
      const keyDoc = await getDoc(doc(db, 'activationKeys', activationKey.toUpperCase()));
      if (!keyDoc.exists()) throw new Error('Invalid activation key.');
      
      const keyData = keyDoc.data() as ActivationKey;
      if (keyData.used) throw new Error('This key has already been used.');

      await updateDoc(doc(db, 'activationKeys', activationKey.toUpperCase()), {
        used: true,
        usedBy: user.uid,
        usedByEmail: user.email
      });

      await updateDoc(doc(db, 'users', user.uid), {
        isPlus: true,
        activationKey: activationKey.toUpperCase(),
        activatedAt: Timestamp.now()
      });

      await refreshUserData();
      setActivationStatus({ message: 'Palm-Ware Plus activated successfully!', isError: false });
      setActivationKey('');
      showAlert('Success', 'Palm-Ware Plus has been activated!', 'success');
    } catch (error: any) {
      setActivationStatus({ message: error.message, isError: true });
      showAlert('Activation Failed', error.message, 'error');
    }
  };

  const generateKey = async () => {
    if (!user) return;
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const key = `PALM-PLUS-${segment()}-${segment()}`;

      await setDoc(doc(db, 'activationKeys', key), {
        key: key,
        used: false,
        createdAt: Timestamp.now(),
        createdByEmail: user.email
      });

      setGeneratedKey(key);
      showAlert('Key Generated', `New key: ${key}`, 'success');
    } catch (error) {
      console.error('Failed to generate key:', error);
      showAlert('Error', 'Failed to generate key.', 'error');
    }
  };

  const deleteKey = async (key: string) => {
    const keyInfo = keys.find(k => k.key === key);
    showConfirm('Delete Key', `Are you sure you want to delete key: ${key}?`, async () => {
      try {
        if (keyInfo?.used && keyInfo.usedBy) {
          await updateDoc(doc(db, 'users', keyInfo.usedBy), { isPlus: false, activationKey: null });
        }
        await deleteDoc(doc(db, 'activationKeys', key));
        showAlert('Deleted', 'Key has been deleted.', 'success');
      } catch (error) {
        console.error('Failed to delete key:', error);
        showAlert('Error', 'Failed to delete key.', 'error');
      }
    }, { type: 'warning' });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('File Too Large', 'Image is too large! Please choose an image under 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSettings({ background: event.target?.result as string });
        showAlert('Success', 'Custom background applied!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUnblocker = async () => {
    if (!unblockerForm.id || !unblockerForm.title || !user) return;
    try {
      await setDoc(doc(db, 'managedUnblockers', unblockerForm.id), {
        ...unblockerForm,
        createdAt: Timestamp.now(),
        createdByEmail: user.email
      });
      setUnblockerForm({ id: '', title: '', icon: '', category: '', verified: false, isPlus: false });
      showAlert('Success', 'Unblocker added!', 'success');
    } catch (error) {
      console.error('Failed to add unblocker:', error);
      showAlert('Error', 'Failed to add unblocker.', 'error');
    }
  };

  const handleAddLink = async () => {
    if (!linkForm.targetId || !linkForm.title || !linkForm.url || !user) return;
    try {
      const newDocRef = doc(collection(db, 'managedLinks'));
      await setDoc(newDocRef, {
        targetUnblockerId: linkForm.targetId,
        title: linkForm.title,
        url: linkForm.url,
        isPlus: selectedLinkType === 'plus',
        createdAt: Timestamp.now(),
        createdByEmail: user.email
      });
      setLinkForm({ targetId: linkForm.targetId, title: '', url: '' });
      showAlert('Success', 'Link added!', 'success');
    } catch (error) {
      console.error('Failed to add link:', error);
      showAlert('Error', 'Failed to add link.', 'error');
    }
  };

  const bootstrapData = async () => {
    showConfirm('Bootstrap Data', 'This will upload all initial unblockers and links to Firestore. Continue?', async () => {
      // Logic from index.html bootstrap
      // ... (omitted for brevity)
      showAlert('Info', 'Bootstrap logic would run here.', 'info');
    });
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 flex-1"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-main mb-3">Settings</h1>
          <p className="text-secondary">Customize your Palm-Ware experience.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-secondary border border-accent rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'general', icon: SettingsIcon, label: 'General' },
            { id: 'customization', icon: Palette, label: 'Customization' },
            { id: 'account', icon: User, label: 'Account' },
            ...(isAdmin ? [{ id: 'admin', icon: ShieldCheck, label: 'Admin' }] : [])
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-accent text-main' : 'text-secondary hover:text-main'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6 pb-24">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><AlertTriangle className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Panic Key</h3>
                    <p className="text-sm text-secondary">Press this key to immediately redirect to a safe site.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Panic Key</label>
                    <input 
                      type="text" 
                      value={settings.panicKey}
                      onChange={(e) => updateSettings({ panicKey: e.target.value })}
                      placeholder="e.g. ` or Escape" 
                      className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Panic URL</label>
                    <input 
                      type="text" 
                      value={settings.panicUrl}
                      onChange={(e) => updateSettings({ panicUrl: e.target.value })}
                      placeholder="https://google.com" 
                      className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><EyeOff className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Tab Cloak</h3>
                    <p className="text-sm text-secondary">Change the tab title and icon to hide your activity.</p>
                  </div>
                </div>
                <select 
                  value={settings.cloak}
                  onChange={(e) => updateSettings({ cloak: e.target.value })}
                  className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors"
                >
                  {Object.entries(CLOAK_DATA).map(([id, data]) => (
                    <option key={id} value={id}>{data.title}</option>
                  ))}
                </select>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Trash2 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Clear All Data</h3>
                    <p className="text-sm text-secondary">Reset all settings and clear your browser's storage for this site.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { showConfirm('Reset Settings', 'Are you sure you want to reset all settings?', resetSettings, { type: 'warning' }); }}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-semibold transition-all active:scale-95"
                >
                  Clear Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'customization' && (
            <div className="space-y-6">
              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><Palette className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">UI Theme</h3>
                    <p className="text-sm text-secondary">Select a theme to change the colors and background of the app.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(THEMES).map(([id, theme]) => (
                    <button 
                      key={id}
                      onClick={() => updateSettings({ theme: id })}
                      className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                        settings.theme === id ? 'border-main bg-accent' : 'border-accent hover:border-zinc-500 bg-secondary'
                      }`}
                    >
                      <div className="w-full aspect-video rounded-lg mb-2 overflow-hidden border border-accent flex">
                        <div className="w-1/3 h-full" style={{ backgroundColor: theme.primary }}></div>
                        <div className="w-1/3 h-full" style={{ backgroundColor: theme.secondary }}></div>
                        <div className="w-1/3 h-full" style={{ backgroundColor: theme.accent }}></div>
                      </div>
                      <span className="text-xs font-bold text-main">{theme.name}</span>
                      {settings.theme === id && (
                        <div className="absolute top-2 right-2 bg-main text-primary rounded-full p-0.5 shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                  {isPlus && (
                    <button 
                      onClick={() => updateSettings({ theme: 'custom' })}
                      className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                        settings.theme === 'custom' ? 'border-main bg-accent' : 'border-accent hover:border-zinc-500 bg-secondary'
                      }`}
                    >
                      <div className="w-full aspect-video rounded-lg mb-2 overflow-hidden border border-accent flex">
                        <div className="w-1/3 h-full" style={{ backgroundColor: settings.customColors?.primary || '#121212' }}></div>
                        <div className="w-1/3 h-full" style={{ backgroundColor: settings.customColors?.secondary || '#1e1e1e' }}></div>
                        <div className="w-1/3 h-full" style={{ backgroundColor: settings.customColors?.accent || '#27272a' }}></div>
                      </div>
                      <span className="text-xs font-bold text-main">Custom</span>
                      {settings.theme === 'custom' && (
                        <div className="absolute top-2 right-2 bg-main text-primary rounded-full p-0.5 shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6 relative overflow-hidden">
                {!isPlus && (
                  <div className="absolute inset-0 z-10 bg-secondary/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="px-2 py-1 bg-main text-[12px] font-black text-primary rounded uppercase tracking-tighter mb-3">Plus</div>
                    <h3 className="text-lg font-bold text-main mb-1">Plus Feature</h3>
                    <p className="text-sm text-secondary max-w-[200px]">Palm-Ware Plus is required to use custom themes.</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><Paintbrush className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main flex items-center gap-2">
                      Custom Theme
                      <span className="px-1.5 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">Plus</span>
                    </h3>
                    <p className="text-sm text-secondary">Design your own color palette.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {['primary', 'secondary', 'accent'].map(key => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)} Background
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={settings.customColors?.[key as keyof typeof settings.customColors] || '#000000'}
                            onChange={(e) => updateSettings({ 
                              customColors: { ...(settings.customColors || { primary: '#121212', secondary: '#1e1e1e', accent: '#27272a', text: '#f4f4f5', textSecondary: '#a1a1aa' }), [key]: e.target.value } 
                            })}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" 
                          />
                          <span className="text-sm font-mono text-secondary">
                            {(settings.customColors?.[key as keyof typeof settings.customColors] || '#000000').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {['text', 'textSecondary'].map(key => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                          {key === 'text' ? 'Main Text' : 'Secondary Text'}
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={settings.customColors?.[key as keyof typeof settings.customColors] || '#ffffff'}
                            onChange={(e) => updateSettings({ 
                              customColors: { ...(settings.customColors || { primary: '#121212', secondary: '#1e1e1e', accent: '#27272a', text: '#f4f4f5', textSecondary: '#a1a1aa' }), [key]: e.target.value } 
                            })}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" 
                          />
                          <span className="text-sm font-mono text-secondary">
                            {(settings.customColors?.[key as keyof typeof settings.customColors] || '#ffffff').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <button 
                        onClick={() => updateSettings({ theme: 'custom' })}
                        className="w-full px-4 py-2 bg-main text-primary rounded-lg font-bold hover:opacity-90 transition-all active:scale-95"
                      >
                        Apply Custom Theme
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><Upload className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Custom Background</h3>
                    <p className="text-sm text-secondary">Upload a custom image for your background.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex-1 w-full">
                    <input type="file" ref={fileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:opacity-80 text-main rounded-lg font-semibold cursor-pointer transition-all border border-accent"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </div>
                  </label>
                  <button 
                    onClick={() => updateSettings({ background: null })}
                    className="w-full sm:w-auto px-6 py-3 bg-accent/50 hover:bg-accent text-secondary border border-accent rounded-lg font-semibold transition-all active:scale-95"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-xs text-secondary mt-3 italic">
                  {settings.background ? 'Custom background applied.' : 'No custom background set.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent rounded-lg"><Crown className="w-5 h-5 text-amber-400" /></div>
                    <div>
                      <h3 className="font-semibold text-main">Palm-Ware Plus</h3>
                      <p className="text-sm text-secondary">Activate premium features with a license key.</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPlus ? 'bg-main/20 text-main' : 'bg-accent text-secondary'}`}>
                    {isPlus ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {!isPlus && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-primary/50 border border-accent rounded-xl space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-accent text-[10px] font-bold text-secondary rounded uppercase tracking-tighter">Basic</span>
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-xs text-secondary"><Check className="w-3 h-3 text-green-500" /> Standard Unblockers</li>
                          <li className="flex items-center gap-2 text-xs text-secondary"><Check className="w-3 h-3 text-green-500" /> Default Themes</li>
                          <li className="flex items-center gap-2 text-xs text-secondary"><Check className="w-3 h-3 text-green-500" /> Built-in Browser</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-main/5 border border-main/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">Plus</span>
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-xs text-main"><Check className="w-3 h-3 text-main" /> Custom Theme Creator</li>
                          <li className="flex items-center gap-2 text-xs text-main"><Check className="w-3 h-3 text-main" /> Exclusive Premium Unblockers</li>
                          <li className="flex items-center gap-2 text-xs text-main">
                            <Check className="w-3 h-3 text-main" /> 
                            <div className="flex items-center gap-1.5">
                              Free Palm-Ware Roblox Executor
                              <Info className="w-3 h-3 text-secondary cursor-help" title="Coming Summer 2026" />
                            </div>
                          </li>
                          <li className="flex items-center gap-2 text-xs text-main"><Check className="w-3 h-3 text-main" /> Early Access to Palm-Ware Proxy</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><MessageSquare className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-sm font-bold text-main">Want Palm-Ware Plus?</h4>
                          <p className="text-xs text-secondary">Join our Discord to purchase a key.</p>
                        </div>
                      </div>
                      <a href="https://discord.gg/pt6kbu2CEg" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-6 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 text-center">
                        Join Discord
                      </a>
                    </div>
                  </>
                )}
                
                {!user ? (
                  <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-all active:scale-95">
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    <span>Login with Google</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-primary rounded-lg border border-accent">
                      <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-accent" alt="Avatar" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-main truncate">{user.displayName}</p>
                        <p className="text-xs text-secondary truncate">{user.email}</p>
                      </div>
                      <button onClick={handleLogout} className="p-2 text-secondary hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    {!isPlus ? (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-secondary uppercase">Activation Key</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={activationKey}
                            onChange={(e) => setActivationKey(e.target.value)}
                            placeholder="XXXX-XXXX-XXXX" 
                            className="flex-1 bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors uppercase" 
                          />
                          <button 
                            onClick={handleActivatePlus}
                            className="px-6 py-3 bg-main text-primary rounded-lg font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                          >
                            Activate
                          </button>
                        </div>
                        {activationStatus.message && (
                          <p className={`text-xs italic ${activationStatus.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                            {activationStatus.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-accent border border-accent rounded-lg text-main text-sm font-medium">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Palm-Ware Plus is Active!</span>
                        </div>
                        <p className="text-xs opacity-80">Thank you for supporting Palm-Ware. Enjoy your premium features.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-6">
              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-accent rounded-lg text-main"><Key className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Activation Keys</h3>
                    <p className="text-sm text-secondary">Manage activation keys and user status.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <button onClick={generateKey} className="w-full px-6 py-3 bg-main text-primary rounded-lg font-bold hover:opacity-90 transition-all active:scale-95">
                      Generate New Plus Key
                    </button>
                    {generatedKey && (
                      <div className="p-3 bg-primary border border-accent rounded-lg text-center font-mono text-sm text-main select-all">
                        {generatedKey}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Active Keys</h4>
                      <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-secondary">{keys.length}</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {keys.map(key => (
                        <div key={key.key} className="flex items-center justify-between p-3 bg-primary border border-accent rounded-lg group hover:border-main/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-main truncate">{key.key}</span>
                              {key.used ? 
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">Used</span> : 
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded">Available</span>
                              }
                            </div>
                            {key.createdByEmail && <p className="text-[10px] text-secondary truncate mt-0.5">Created by: {key.createdByEmail}</p>}
                            {key.used && <p className="text-[10px] text-secondary truncate mt-0.5">Used by: {key.usedByEmail || 'Unknown'}</p>}
                          </div>
                          <button onClick={() => deleteKey(key.key)} className="p-1.5 text-secondary hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><LayoutGrid className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Manage Unblockers</h3>
                    <p className="text-sm text-secondary">Create and manage unblocker categories.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="ID (e.g. 'rosin')" value={unblockerForm.id} onChange={e => setUnblockerForm({...unblockerForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-primary border border-accent rounded-lg p-3 text-sm text-main focus:outline-none focus:border-main transition-colors" />
                    <input type="text" placeholder="Title (e.g. 'Rosin')" value={unblockerForm.title} onChange={e => setUnblockerForm({...unblockerForm, title: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-sm text-main focus:outline-none focus:border-main transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Icon URL (optional)" value={unblockerForm.icon} onChange={e => setUnblockerForm({...unblockerForm, icon: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-sm text-main focus:outline-none focus:border-main transition-colors" />
                    <input type="text" placeholder="Category (default: Unblocker)" value={unblockerForm.category} onChange={e => setUnblockerForm({...unblockerForm, category: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-sm text-main focus:outline-none focus:border-main transition-colors" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={unblockerForm.verified} onChange={e => setUnblockerForm({...unblockerForm, verified: e.target.checked})} className="hidden" />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${unblockerForm.verified ? 'bg-main border-main' : 'border-accent'}`}>
                        <Check className={`w-3 h-3 text-primary ${unblockerForm.verified ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <span className="text-xs text-secondary group-hover:text-main transition-colors">Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={unblockerForm.isPlus} onChange={e => setUnblockerForm({...unblockerForm, isPlus: e.target.checked})} className="hidden" />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${unblockerForm.isPlus ? 'bg-main border-main' : 'border-accent'}`}>
                        <Check className={`w-3 h-3 text-primary ${unblockerForm.isPlus ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <span className="text-xs text-secondary group-hover:text-main transition-colors">Plus Only</span>
                    </label>
                  </div>
                  <button onClick={handleAddUnblocker} className="w-full px-6 py-3 bg-main text-primary rounded-lg font-bold hover:opacity-90 transition-all active:scale-95">
                    Add Unblocker
                  </button>

                  <div className="pt-4 border-t border-accent">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Active Unblockers</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {managedUnblockers.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-primary border border-accent rounded-lg group hover:border-main/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center overflow-hidden">
                              <img src={u.icon || NO_IMAGE_URL} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-main truncate">{u.title}</span>
                                {u.verified && <BadgeCheck className="w-3 h-3 text-blue-400" />}
                                {u.isPlus && <span className="px-1.5 py-0.5 bg-main text-[8px] font-black text-primary rounded uppercase tracking-tighter">Plus</span>}
                              </div>
                              <p className="text-[8px] text-secondary truncate">{u.category || 'Unblocker'}</p>
                            </div>
                          </div>
                          <button onClick={async () => { if(window.confirm('Delete unblocker?')) await deleteDoc(doc(db, 'managedUnblockers', u.id)); }} className="p-1.5 text-secondary hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-accent rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-accent rounded-lg text-secondary"><Link2 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-main">Manage Links</h3>
                    <p className="text-sm text-secondary">Add links to unblockers.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-1 bg-primary border border-accent rounded-lg">
                    <button onClick={() => setSelectedLinkType('basic')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${selectedLinkType === 'basic' ? 'bg-accent text-main' : 'text-secondary hover:text-main'}`}>BASIC</button>
                    <button onClick={() => setSelectedLinkType('plus')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${selectedLinkType === 'plus' ? 'bg-accent text-main' : 'text-secondary hover:text-main'}`}>PLUS</button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-secondary uppercase">Target Unblocker</label>
                    <select value={linkForm.targetId} onChange={e => setLinkForm({...linkForm, targetId: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors">
                      <option value="">Select Unblocker...</option>
                      {managedUnblockers.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-secondary uppercase">Link Details</label>
                    <input type="text" placeholder="Link Title (e.g. 'Server 1')" value={linkForm.title} onChange={e => setLinkForm({...linkForm, title: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors" />
                    <input type="text" placeholder="URL (e.g. 'https://...')" value={linkForm.url} onChange={e => setLinkForm({...linkForm, url: e.target.value})} className="w-full bg-primary border border-accent rounded-lg p-3 text-main focus:outline-none focus:border-main transition-colors" />
                  </div>

                  <button onClick={handleAddLink} className="w-full px-6 py-3 bg-main text-primary rounded-lg font-bold hover:opacity-90 transition-all active:scale-95">
                    Add Link
                  </button>

                  <div className="pt-4 border-t border-accent">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Active Links</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {managedLinks.map(link => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-primary border border-accent rounded-lg group hover:border-main/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-main truncate">{link.title}</span>
                              {link.isPlus ? <span className="px-1.5 py-0.5 bg-main text-[10px] font-black text-primary rounded uppercase tracking-tighter">Plus</span> : <span className="px-1.5 py-0.5 bg-accent text-[10px] font-bold text-secondary rounded uppercase tracking-tighter">Basic</span>}
                            </div>
                            <p className="text-[10px] text-secondary truncate mt-0.5">{link.url}</p>
                            <p className="text-[10px] text-secondary truncate mt-0.5">Target: {link.targetUnblockerId}</p>
                          </div>
                          <button onClick={async () => { if(window.confirm('Delete link?')) await deleteDoc(doc(db, 'managedLinks', link.id)); }} className="p-1.5 text-secondary hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={bootstrapData} className="px-4 py-2 text-[10px] font-bold text-secondary hover:text-main border border-accent rounded-lg transition-colors">
                  BOOTSTRAP INITIAL DATA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default SettingsView;
