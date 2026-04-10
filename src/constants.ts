import { Theme, Settings, Game } from './types';

export const NO_IMAGE_URL = 'https://placehold.co/150x150/1e1e1e/52525b?text=No+Image';

export const DEFAULT_SETTINGS: Settings = {
  cloak: 'none',
  panicKey: '`',
  panicUrl: 'https://google.com',
  background: null,
  theme: 'dark',
  customColors: null
};

export const THEMES: Record<string, Theme> = {
  dark: {
    name: 'Dark (Default)',
    primary: '#121212',
    secondary: '#1e1e1e',
    accent: '#27272a',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    background: null
  },
  light: {
    name: 'Light',
    primary: '#ffffff',
    secondary: '#f4f4f5',
    accent: '#e4e4e7',
    text: '#18181b',
    textSecondary: '#52525b',
    background: null
  },
  ocean: {
    name: 'Ocean',
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1920'
  },
  femboy: {
    name: 'Femboy',
    primary: '#fce7f3',
    secondary: '#fdf2f8',
    accent: '#fbcfe8',
    text: '#4a044e',
    textSecondary: '#701a75',
    overlay: 'rgba(255, 255, 255, 0.4)',
    background: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1920'
  },
  minecraft: {
    name: 'Minecraft',
    primary: '#3d2b1f',
    secondary: '#4a3728',
    accent: '#5d8233',
    text: '#f0f0f0',
    textSecondary: '#a0a0a0',
    overlay: 'rgba(0, 0, 0, 0.6)',
    background: 'https://i.ibb.co/zWRpd72r/wallpaper-minecraft-pc-bundle-1920x1080.png'
  }
};

export const CLOAK_DATA: Record<string, { title: string; icon: string }> = {
  none: { title: 'Palm-Ware', icon: 'favicon.ico' },
  google: { title: 'Google', icon: 'https://www.google.com/favicon.ico' },
  classroom: { title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
  drive: { title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png' },
  canvas: { title: 'Dashboard', icon: 'https://canvas.instructure.com/favicon.ico' }
};

export const GAMES: Game[] = [
  {
    id: 'drivemad',
    title: 'Drive Mad',
    category: 'Arcade',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Drive+Mad',
    url: '/games/drivemad.html'
  },
  {
    id: 'basketballfrvr',
    title: 'Basketball FRVR',
    category: 'Sports',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Basketball+FRVR',
    url: '/games/basketballfrvr.html'
  },
  {
    id: 'crossyroad',
    title: 'Crossy Road',
    category: 'Arcade',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Crossy+Road',
    url: '/games/crossyroad.html'
  },
  {
    id: '1v1lol',
    title: '1v1.lol',
    category: 'Action',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=1v1.lol',
    url: '/games/1v1lol.html'
  },
  {
    id: 'magictiles3',
    title: 'Magic Tiles 3',
    category: 'Music',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Magic+Tiles+3',
    url: '/games/magictiles3.html'
  },
  {
    id: 'geometrydash',
    title: 'Geometry Dash',
    category: 'Arcade',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Geometry+Dash',
    url: '/games/geometrydash.html'
  },
  {
    id: 'fnaf1',
    title: "Five Nights at Freddy's 1",
    category: 'Horror',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=FNAF+1',
    url: '/games/fnaf1.html'
  },
  {
    id: 'fnaf2',
    title: "Five Nights at Freddy's 2",
    category: 'Horror',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=FNAF+2',
    url: '/games/fnaf2.html'
  },
  {
    id: 'retrobowl',
    title: 'Retro Bowl',
    category: 'Sports',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Retro+Bowl',
    url: '/games/retrobowl.html'
  },
  {
    id: 'basketbros',
    title: 'Basket Bros',
    category: 'Sports',
    image: 'https://placehold.co/600x400/1e1e1e/52525b?text=Basket+Bros',
    url: '/games/basketbros.html'
  }
];

export const CREDITS = [
  { name: 'nahim2936', role: 'Founder' },
  { name: 'itzsebasfam', role: 'Co-owner' },
  { name: 'attelloblue', role: 'Frontend Developer' },
  { name: 'arongood3d', role: 'Backend Developer' },
  { name: 'srtaco_01', role: 'Backend Developer' },
  { name: 'curlyheadmicheal', role: 'Moderator' },
  { name: 'thegodkat', role: 'Helper' }
];
