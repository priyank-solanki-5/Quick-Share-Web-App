import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SendFile from './components/SendFile';
import ReceiveFile from './components/ReceiveFile';
import Toast from './components/Toast';

export default function App() {
  const [activeMode, setActiveMode] = useState('home'); // 'home' | 'send' | 'receive'
  const [urlCode, setUrlCode] = useState('');
  const [toasts, setToasts] = useState([]);

  // Check URL parameters for ?code=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam && codeParam.trim().length === 6) {
      setUrlCode(codeParam.trim());
      setActiveMode('receive');
    }
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGoHome = () => {
    setActiveMode('home');
    // Clear URL query without reload if needed
    if (window.location.search) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar onGoHome={handleGoHome} activeMode={activeMode} />

      <main className="flex-1 flex flex-col">
        {activeMode === 'home' && (
          <Home onSelectMode={(mode) => setActiveMode(mode)} />
        )}

        {activeMode === 'send' && (
          <SendFile addToast={addToast} />
        )}

        {activeMode === 'receive' && (
          <ReceiveFile initialCode={urlCode} addToast={addToast} />
        )}
      </main>

      <footer className="w-full border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>Quick Share &copy; {new Date().getFullYear()} &bull; Fast, temporary & encrypted file sharing</p>
      </footer>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
