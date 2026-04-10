import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, OperationType, handleFirestoreError } from '../firebase';
import { UserData } from '../types';
import { FirebaseUser } from '../firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isPlus: boolean;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        const newData: UserData = {
          uid: auth.currentUser.uid,
          isPlus: false,
          email: auth.currentUser.email,
          createdAt: Timestamp.now()
        };
        await setDoc(doc(db, 'users', auth.currentUser.uid), newData);
        setUserData(newData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await refreshUserData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isPlus = userData?.isPlus || false;
  const isAdmin = user?.email === 'notify.bluedhost@gmail.com' || 
                  user?.email === 'brynleyportillo1@gmail.com' || 
                  user?.email === 'crwnexecutor@gmail.com' || 
                  userData?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userData, loading, isPlus, isAdmin, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
