import { Timestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  isPlus: boolean;
  email: string | null;
  role?: string;
  createdAt: Timestamp;
  activationKey?: string | null;
  activatedAt?: Timestamp | null;
}

export interface ActivationKey {
  key: string;
  used: boolean;
  createdAt: Timestamp;
  createdByEmail: string | null;
  usedBy?: string;
  usedByEmail?: string | null;
}

export interface ManagedUnblocker {
  id: string;
  title: string;
  category: string;
  icon: string;
  verified: boolean;
  isPlus: boolean;
  createdAt?: Timestamp;
  createdByEmail?: string;
}

export interface ManagedLink {
  id: string;
  targetUnblockerId: string;
  title: string;
  url: string;
  isPlus: boolean;
  createdAt?: Timestamp;
  createdByEmail?: string;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  url: string;
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string | null;
  overlay?: string;
}

export interface Settings {
  cloak: string;
  panicKey: string;
  panicUrl: string;
  background: string | null;
  theme: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
  } | null;
}
