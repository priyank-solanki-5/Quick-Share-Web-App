import React, { useState, useEffect } from 'react';
import { DownloadCloud, KeyRound, Loader2, AlertCircle, FileCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ReceiveFile({ initialCode, addToast }) {
  const [code, setCode] = useState(initialCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Auto validate if initialCode is passed from URL query
  useEffect(() => {
    if (initialCode && initialCode.trim().length === 6) {
      validateCode(initialCode.trim());
    }
  }, [initialCode]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setErrorMessage('');
  };

  const validateCode = async (codeToValidate) => {
    const targetCode = codeToValidate || code;
    if (!targetCode || targetCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    setIsValidating(true);
    setErrorMessage('');
    setFileMetadata(null);

    try {
      const response = await fetch(`/api/receive/${targetCode}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setFileMetadata(result.data);
        addToast('File code validated successfully!', 'success');
      } else {
        setErrorMessage(result.message || 'Invalid or expired code');
        addToast(result.message || 'Invalid or expired code', 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrorMessage('Network error validating code. Please try again.');
      addToast('Network error validating code.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownload = () => {
    if (!fileMetadata || !fileMetadata.code) return;
    
    // Trigger download via download API endpoint
    const downloadUrl = `/api/download/${fileMetadata.code}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileMetadata.file.originalname);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setIsDownloaded(true);
    addToast('File download started!', 'success');
  };

  const handleReset = () => {
    setCode('');
    setFileMetadata(null);
    setErrorMessage('');
    setIsDownloaded(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full">
      <div className="w-full glass-card p-6 sm:p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Receive a File</h2>
          <p className="text-slate-400 text-sm mt-1">
            Enter the 6-digit share code to preview and download the file.
          </p>
        </div>

        {/* CODE ENTRY FORM */}
        {!fileMetadata && (
          <form onSubmit={(e) => { e.preventDefault(); validateCode(); }} className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-400" /> Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="code-input"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || code.length !== 6}
              className="btn-primary w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/20"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-5 h-5" />
                  <span>Fetch File</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* VALIDATED FILE DETAILS CARD */}
        {fileMetadata && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div className="overflow-hidden">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
                    Ready for Download
                  </span>
                  <h3 className="text-base font-semibold text-white truncate">{fileMetadata.file.originalname}</h3>
                  <p className="text-xs text-slate-400">{formatBytes(fileMetadata.file.size)}</p>
                </div>
              </div>
            </div>

            {isDownloaded ? (
              <div className="text-center space-y-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <div>
                  <p className="font-semibold text-sm">Download Complete!</p>
                  <p className="text-xs text-slate-400 mt-1">Your file has been delivered successfully.</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                className="btn-primary w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-base"
              >
                <DownloadCloud className="w-5 h-5" />
                <span>Download File Now</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Enter Different Code</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
