import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/Layout';
import HomeView from './components/views/HomeView';
import AboutView from './components/views/AboutView';
import SettingsView from './components/views/SettingsView';
import UnblockersView from './components/views/UnblockersView';
import LinksView from './components/views/LinksView';
import GamesView from './components/views/GamesView';
import PlayView from './components/views/PlayView';
import BrowserView from './components/views/BrowserView';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ModalProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomeView />} />
                <Route path="about" element={<AboutView />} />
                <Route path="settings" element={<SettingsView />} />
                <Route path="unblockers" element={<UnblockersView />} />
                <Route path="unblocker/:id" element={<LinksView />} />
                <Route path="games" element={<GamesView />} />
                <Route path="play/:id" element={<PlayView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              <Route path="browser" element={<BrowserView />} />
            </Routes>
          </Router>
        </ModalProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
