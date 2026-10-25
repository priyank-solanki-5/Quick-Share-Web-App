import React from 'react';
import { UploadCloud, DownloadCloud, ShieldCheck, Zap, Clock } from 'lucide-react';

export default function Home({ onSelectMode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Title & Tagline */}
      <div className="text-center max-w-3xl mb-12 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <Zap className="w-3.5 h-3.5" /> Instant & Encrypted File Sharing
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
          Share files seamlessly using <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">6-digit codes</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          No sign-up required. Upload your file to get a 6-digit code or QR link for temporary fast downloads.
        </p>
      </div>

      {/* Main Choice Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-2">
        {/* SEND CARD */}
        <div 
          onClick={() => onSelectMode('send')}
          className="glass-card glass-card-hover p-8 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all shadow-lg shadow-indigo-500/10">
            <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Send File</h2>
          <p className="text-slate-400 text-sm mb-6">
            Upload any file to instantly generate a 6-digit code and shareable QR code.
          </p>
          <div className="btn-primary w-full py-3">
            <UploadCloud className="w-5 h-5" />
            <span>Upload & Share</span>
          </div>
        </div>

        {/* RECEIVE CARD */}
        <div 
          onClick={() => onSelectMode('receive')}
          className="glass-card glass-card-hover p-8 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600/30 transition-all shadow-lg shadow-purple-500/10">
            <DownloadCloud className="w-10 h-10 text-purple-400 group-hover:text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Receive File</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter a 6-digit code or scan a QR code to download shared files securely.
          </p>
          <div className="btn-secondary w-full py-3 border-purple-500/30 hover:bg-purple-500/10">
            <DownloadCloud className="w-5 h-5 text-purple-400" />
            <span>Enter 6-Digit Code</span>
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>10-Min Auto Expiry</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Automatic File Deletion</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>No Login Required</span>
        </div>
      </div>
    </div>
  );
}
