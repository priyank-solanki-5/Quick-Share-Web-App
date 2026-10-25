import React from 'react';
import { Share2, Home } from 'lucide-react';

export default function Navbar({ onGoHome, activeMode }) {
  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            Quick Share
          </span>
        </div>

        {activeMode !== 'home' && (
          <button
            onClick={onGoHome}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        )}
      </div>
    </nav>
  );
}
