import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Store, AtSign, Building2, CheckCircle2, Shield, LogOut, Sparkles, KeyRound } from 'lucide-react';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

export interface UserProfile {
  name: string;
  email?: string;
  businessName?: string;
  upiId?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'signin' | 'signup';
  currentUser: UserProfile | null;
  onClose: () => void;
  onSaveUser: (user: UserProfile | null) => void;
  onApplyProfileToForm?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  currentUser,
  onClose,
  onSaveUser,
  onApplyProfileToForm,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState(currentUser?.name || '');
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [upiId, setUpiId] = useState(currentUser?.upiId || '');
  const [accountNumber, setAccountNumber] = useState(currentUser?.accountNumber || '');
  const [ifsc, setIfsc] = useState(currentUser?.ifsc || '');
  const [bankName, setBankName] = useState(currentUser?.bankName || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name');
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

    onSaveUser(profile);
    sounds.playSuccessChime();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    onClose();
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

    onSaveUser(demoProfile);
    sounds.playSuccessChime();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  const handleLogout = () => {
    sounds.playPop();
    onSaveUser(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile Details if Already Logged In */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/30">
                {currentUser.name[0]?.toUpperCase() || 'M'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  {currentUser.name}
                  <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                </h2>
                <p className="text-xs text-amber-200/80">
                  {currentUser.businessName || 'Independent Merchant Account'}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Default UPI ID</span>
                <span className="text-amber-300 font-mono font-medium">
                  {currentUser.upiId || 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Bank Account</span>
                <span className="text-slate-200 font-mono">
                  {currentUser.accountNumber
                    ? `••••${currentUser.accountNumber.slice(-4)}`
                    : 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">IFSC / Bank</span>
                <span className="text-slate-200 font-mono">
                  {currentUser.ifsc ? `${currentUser.ifsc} (${currentUser.bankName || 'Bank'})` : 'Not configured'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {onApplyProfileToForm && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onApplyProfileToForm(currentUser);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Fill Active Generator
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="py-3 px-4 rounded-xl font-medium text-xs text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  {mode === 'signup' ? 'Create Merchant Account' : 'Merchant Sign In'}
                </h2>
                <p className="text-xs text-slate-400">
                  100% Offline & Private • Stored securely in your browser
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[11px] font-medium text-amber-300/90 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Instant 1-Click Demo Profiles (Try Now):
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('chai')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 transition-colors"
                >
                  ☕ Sharma Chai Corner (UPI + Bank)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('tech')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-200 transition-colors"
                >
                  💻 TechNova Gadgets
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name / Owner Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Shop / Business Name (Optional)
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Electronics, Sweet Bakery"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default UPI ID / VPA (Optional)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank Account No.
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="9-18 digits"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {mode === 'signup' ? 'Create & Activate Account' : 'Sign In to Studio'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                }}
                className="text-xs text-amber-300 hover:underline"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up with custom store details"
                  : 'Already created an account? Switch to Sign In'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
