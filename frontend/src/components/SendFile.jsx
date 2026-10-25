import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Copy, Check, File, RefreshCw, Clock, Loader2, QrCode } from 'lucide-react';

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function SendFile({ addToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // seconds
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Timer countdown hook
  useEffect(() => {
    if (!sessionData || !sessionData.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sessionData.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        addToast('Code has expired!', 'error');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('baseUrl', window.location.origin);

      const response = await fetch('/api/send', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSessionData(result.data);
        const remaining = Math.max(0, Math.floor((result.data.expiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        addToast('File uploaded! 6-digit code generated.', 'success');
      } else {
        addToast(result.message || 'Upload failed', 'error');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Network error during file upload.', 'error');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopyCode = () => {
    if (!sessionData) return;
    navigator.clipboard.writeText(sessionData.code);
    setIsCopied(true);
    addToast('6-digit code copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSessionData(null);
    setIsCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
      <div className="w-full glass-card p-6 sm:p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Send a File</h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload your file to get a 6-digit code & QR link valid for 10 minutes.
          </p>
        </div>

        {/* STEP 1: UPLOAD AREA */}
        {!sessionData && !isUploading && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Drag and drop your file here
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                or click to browse from your device
              </p>
              <span className="text-xs text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                Max file size: 50 MB
              </span>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isUploading && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-white">Uploading & generating code...</h3>
            <p className="text-slate-400 text-sm mt-1">{selectedFile?.name}</p>
          </div>
        )}

        {/* STEP 2: CODE & QR GENERATED RESULT */}
        {sessionData && (
          <div className="space-y-6">
            {/* File info bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">{sessionData.file.originalname}</p>
                  <p className="text-xs text-slate-400">{formatBytes(sessionData.file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Waiting for receiver
                </span>
              </div>
            </div>

            {/* 6-DIGIT CODE BOX */}
            <div className="text-center space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your 6-Digit Share Code
              </label>
              <div className="relative flex items-center justify-center">
                <div className="code-display w-full">
                  {sessionData.code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="absolute right-3 p-3 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600 rounded-xl border border-slate-700 transition-all"
                  title="Copy Code"
                >
                  {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* QR CODE & TIMER GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              {/* QR Code image */}
              <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 mb-2">
                  <img src={sessionData.qrDataUrl} alt="QR Code" className="w-36 h-36" />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Scan to receive on mobile
                </span>
              </div>

              {/* Expiry Timer */}
              <div className="flex flex-col items-center justify-center text-center p-4 border-t sm:border-t-0 sm:border-l border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Code Expiry</span>
                </div>
                <div className={`text-4xl font-extrabold font-mono ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                  {formatTimer(timeLeft)}
                </div>
                <p className="text-xs text-slate-500">
                  Code will automatically expire and file will be deleted when time runs out.
                </p>
              </div>
            </div>

            {/* RESET / SEND NEW FILE */}
            <button
              onClick={handleReset}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Send Another File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
