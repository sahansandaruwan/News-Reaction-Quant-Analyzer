import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Check, Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey } from '../lib/geminiClient';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existing = getStoredGeminiApiKey();
      setApiKey(existing);
      setIsSaved(Boolean(existing));
      setTestStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    setStoredGeminiApiKey(cleanKey);
    setIsSaved(Boolean(cleanKey));
    if (onKeyUpdated) onKeyUpdated(Boolean(cleanKey));
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setStoredGeminiApiKey('');
    setIsSaved(false);
    if (onKeyUpdated) onKeyUpdated(false);
    setTestStatus('idle');
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setErrorMsg('Please enter a Gemini API key first.');
      return;
    }
    setTestStatus('testing');
    setErrorMsg('');

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK' }] }]
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || `API error code ${res.status}`);
      }

      setTestStatus('success');
      setStoredGeminiApiKey(apiKey.trim());
      setIsSaved(true);
      if (onKeyUpdated) onKeyUpdated(true);
    } catch (err: any) {
      setTestStatus('error');
      setErrorMsg(err.message || 'Key validation failed. Please check key permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Configure Gemini API Key
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Enable live AI news sentiment & stock price prediction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Gemini API Key
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                  setErrorMsg('');
                }}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
              />
              {isSaved && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your API key is stored securely in your browser's local storage and used directly to analyze market headlines and generate quantitative predictions.
            </p>
          </div>

          {/* Test Status Banner */}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>Gemini API key verified successfully! AI prediction engine is ready.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={!apiKey.trim() || testStatus === 'testing'}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Testing Key...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Test API Key
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                >
                  Clear Key
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
