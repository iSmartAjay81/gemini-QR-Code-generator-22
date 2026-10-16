import React, { useState } from 'react';
import { User, Store, AtSign, Landmark, Shield, Sparkles, CheckCircle2, ArrowRight, UserCheck, LogOut, KeyRound } from 'lucide-react';
import { UserProfile } from './AuthModal';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

interface AuthStepProps {
  currentUser: UserProfile | null;
  onSaveAndProceed: (profile: UserProfile) => void;
  onProceedAsGuest: () => void;
  onLogout: () => void;
}

export const AuthStep: React.FC<AuthStepProps> = ({
  currentUser,
  onSaveAndProceed,
  onProceedAsGuest,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name or business name');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      upiId: upiId.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      ifsc: ifsc.trim().toUpperCase() || undefined,
      bankName: bankName.trim() || undefined,
    };

    sounds.playSuccessChime();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    onSaveAndProceed(profile);
  };

  const handleQuickDemo = (demoType: 'chai' | 'tech') => {
    sounds.playPop();
    const demoProfile: UserProfile =
      demoType === 'chai'
        ? {
            name: 'Rohan Sharma',
            businessName: 'Sharma Chai & Snacks Corner',
            upiId: 'rohansharma@okhdfcbank',
            accountNumber: '50100456789012',
            ifsc: 'HDFC0000128',
            bankName: 'HDFC Bank',
          }
        : {
            name: 'Priya Patel',
            businessName: 'TechNova Gadgets & Accessories',
            upiId: 'technova@paytm',
            accountNumber: '3209876543210',
            ifsc: 'SBIN0001234',
            bankName: 'State Bank of India',
          };

    sounds.playSuccessChime();
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    onSaveAndProceed(demoProfile);
  };

  // If already logged in, show the current active profile card with a 1-click continue
  if (currentUser) {
    return (
      <div className="rounded-3xl p-6 sm:p-8 border border-amber-500/40 bg-slate-900/90 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-lg shadow-amber-500/30">
              {currentUser.name[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-white font-display">
                  Welcome, {currentUser.name}
                </h2>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-amber-300 font-medium mt-0.5">
                {currentUser.businessName || 'Verified Merchant Profile'} • 100% Offline Active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Account
          </button>
        </div>

        {/* Saved details preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Configured UPI ID:</span>
            <span className="text-amber-300 font-mono font-semibold">
              {currentUser.upiId || 'Not configured'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Bank Account:</span>
            <span className="text-slate-200 font-mono font-semibold">
              {currentUser.accountNumber
                ? `••••${currentUser.accountNumber.slice(-4)} (${currentUser.bankName || 'Bank'})`
                : 'Not configured'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playSuccessChime();
            onSaveAndProceed(currentUser);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>Continue to Enter UPI & Bank Info (Step 2)</span>
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-amber-500/40 bg-slate-900/90 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pb-5 mb-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Sign Up or Login Required
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Please sign up or log in to unlock the QR Code Generator & Merchant Studio
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Instant Demo Profiles Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30">
        <div className="text-xs font-semibold text-amber-300 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Quick 1-Click Demo Profiles (Auto-fills everything):
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickDemo('chai')}
            className="flex-1 min-w-[200px] text-xs py-2.5 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 transition-all font-semibold flex items-center justify-between hover:scale-[1.01]"
          >
            <span>☕ Sharma Chai Corner (UPI + Bank)</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('tech')}
            className="flex-1 min-w-[200px] text-xs py-2.5 px-3.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-200 transition-all font-semibold flex items-center justify-between hover:scale-[1.01]"
          >
            <span>💻 TechNova Gadgets (UPI + Bank)</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Toggle Sign Up vs Sign In */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setAuthMode('signup');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            authMode === 'signup'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setAuthMode('signin');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            authMode === 'signin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Existing Merchant Sign In
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Full Name / Owner Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Shop / Business Name (Optional)
          </label>
          <div className="relative">
            <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Sharma Sweets & Cafe"
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Default UPI ID / VPA (Optional)
          </label>
          <div className="relative">
            <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
              placeholder="e.g. yourname@okhdfcbank"
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bank Account Number (Optional)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 50100412345678"
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              IFSC Code (Optional)
            </label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0000128"
              maxLength={11}
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Save & Proceed to UPI/Bank Info (Step 2)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </form>
    </div>
  );
};
