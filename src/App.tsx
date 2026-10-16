/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  QrCode,
  IndianRupee,
  Landmark,
  Globe,
  ScanLine,
  History,
  ShieldCheck,
  User,
  Zap,
  BookmarkPlus,
  BookOpen,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { InteractiveLamp } from './components/InteractiveLamp';
import { AuthModal, UserProfile } from './components/AuthModal';
import { UpiGenerator, UpiFormData } from './components/UpiGenerator';
import { BankDetailsGenerator, BankFormData } from './components/BankDetailsGenerator';
import { OtherQrGenerators } from './components/OtherQrGenerators';
import { QrDisplay } from './components/QrDisplay';
import { QrScannerModal } from './components/QrScannerModal';
import { HistoryDrawer, SavedQrItem } from './components/HistoryDrawer';
import { AuthStep } from './components/AuthStep';
import { sounds } from './utils/sound';

export type MainTabType = 'upi' | 'bank' | 'other';
export type PageStep = 'auth' | 'input' | 'qr_page';

export default function App() {
  // Lamp State
  const [isLampOn, setIsLampOn] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('lumi_qr_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Step Navigation: strictly locked to 'auth' if not logged in
  const [currentStep, setCurrentStep] = useState<PageStep>(() => {
    try {
      const stored = localStorage.getItem('lumi_qr_user');
      return stored ? 'input' : 'auth';
    } catch {
      return 'auth';
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Active Generator Tab
  const [activeTab, setActiveTab] = useState<MainTabType>('upi');

  // Scanner & History Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);

  // UPI Form State
  const [upiData, setUpiData] = useState<UpiFormData>(() => ({
    upiId: currentUser?.upiId || 'rohansharma@okhdfcbank',
    payeeName: currentUser?.businessName || currentUser?.name || 'Sharma Sweets & Cafe',
    amount: '150',
    note: 'Dinner & Fresh Sweets',
  }));

  // Bank Form State
  const [bankData, setBankData] = useState<BankFormData>(() => ({
    mode: 'npci_upi',
    accountNumber: currentUser?.accountNumber || '50100412345678',
    ifsc: currentUser?.ifsc || 'HDFC0000128',
    accountHolderName: currentUser?.name || 'Priya Sharma',
    bankName: currentUser?.bankName || 'HDFC Bank',
    branch: 'Downtown Branch',
    accountType: 'Savings',
    amount: '1200',
    note: 'Invoice Payment',
    iban: 'DE89370400440532013000',
    bic: 'DBEUST33',
  }));

  // Active Payload State
  const [activePayload, setActivePayload] = useState<string>('');
  const [qrTitle, setQrTitle] = useState<string>('UPI Payment QR');
  const [qrSubtitle, setQrSubtitle] = useState<string>('Sharma Sweets • ₹150.00');

  // History State
  const [historyItems, setHistoryItems] = useState<SavedQrItem[]>(() => {
    try {
      const stored = localStorage.getItem('lumi_qr_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handlePayloadGenerated = useCallback(
    (payload: string, title: string, subtitle: string) => {
      setActivePayload(payload);
      setQrTitle(title);
      setQrSubtitle(subtitle);
    },
    []
  );

  // Save current profile to localStorage
  const handleSaveUser = (profile: UserProfile | null) => {
    setCurrentUser(profile);
    if (profile) {
      localStorage.setItem('lumi_qr_user', JSON.stringify(profile));
      if (profile.upiId) {
        setUpiData((prev) => ({
          ...prev,
          upiId: profile.upiId || prev.upiId,
          payeeName: profile.businessName || profile.name || prev.payeeName,
        }));
      }
      if (profile.accountNumber) {
        setBankData((prev) => ({
          ...prev,
          accountNumber: profile.accountNumber || prev.accountNumber,
          ifsc: profile.ifsc || prev.ifsc,
          bankName: profile.bankName || prev.bankName,
          accountHolderName: profile.name || prev.accountHolderName,
        }));
      }
      setCurrentStep('input');
    } else {
      localStorage.removeItem('lumi_qr_user');
      setCurrentStep('auth');
    }
  };

  const handleApplyProfileToForm = (profile: UserProfile) => {
    if (activeTab === 'upi') {
      setUpiData((prev) => ({
        ...prev,
        upiId: profile.upiId || prev.upiId,
        payeeName: profile.businessName || profile.name || prev.payeeName,
      }));
    } else {
      setBankData((prev) => ({
        ...prev,
        accountNumber: profile.accountNumber || prev.accountNumber,
        ifsc: profile.ifsc || prev.ifsc,
        bankName: profile.bankName || prev.bankName,
        accountHolderName: profile.name || prev.accountHolderName,
      }));
    }
  };

  // Save QR to History
  const handleSaveToHistory = () => {
    if (!activePayload) return;
    sounds.playSuccessChime();
    const newItem: SavedQrItem = {
      id: Date.now().toString(),
      type: activeTab,
      title: qrTitle,
      subtitle: qrSubtitle,
      payload: activePayload,
      amount: activeTab === 'upi' ? upiData.amount : bankData.amount,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...historyItems.slice(0, 19)];
    setHistoryItems(updated);
    localStorage.setItem('lumi_qr_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem('lumi_qr_history');
  };

  const handleRestoreHistoryItem = (item: SavedQrItem) => {
    setActivePayload(item.payload);
    setQrTitle(item.title);
    setQrSubtitle(item.subtitle);
  };

  const handleAuthProceed = (profile: UserProfile) => {
    handleSaveUser(profile);
    setCurrentStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedAsGuest = () => {
    sounds.playPop();
    setCurrentStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen text-slate-100 transition-colors duration-700 selection:bg-amber-500/30 selection:text-amber-200 ${
        isLampOn
          ? 'bg-gradient-to-b from-slate-950 via-[#0e1320] to-[#090b10]'
          : 'bg-gradient-to-b from-[#06080d] via-[#090b10] to-[#040508]'
      }`}
    >
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight font-display text-white">
                  Lumi<span className="text-amber-400">QR</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Zap className="w-3 h-3" />
                  100% Offline
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <>
                {/* Offline Scanner */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setScannerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Verify / Scan QR</span>
                </button>

                {/* History Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setHistoryOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors relative"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">History</span>
                  {historyItems.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                      {historyItems.length}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Prompt View Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setPromptModalOpen(true);
              }}
              title="View the master engineering prompt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prompt</span>
            </button>

            {/* User Profile / Auth Status Badge */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-sm shadow-amber-500/20 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                🔒 Sign In Required
              </span>
            )}
          </div>
        </div>
      </header>

      {/* INTERACTIVE DESK LAMP (PULL CORD TO ILLUMINATE SIGN UP / LOGIN) */}
      <InteractiveLamp
        isLampOn={isLampOn}
        onToggleLamp={() => setIsLampOn(!isLampOn)}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Studio Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {!currentUser ? (
          /* STRICT AUTH GATE: WITHOUT LOGIN OR SIGNUP NO OTHER OPTION IS SHOWN */
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <AuthStep
              currentUser={null}
              onSaveAndProceed={handleAuthProceed}
              onProceedAsGuest={() => {}}
              onLogout={() => handleSaveUser(null)}
            />
          </div>
        ) : (
          /* UNLOCKED: ONLY SHOWN AFTER LOGIN / SIGN UP */
          <>
            {/* 3-Step Progress / Page Switcher Bar */}
            <div className="max-w-3xl mx-auto mb-7 flex items-center justify-between p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto gap-1">
              {/* Step 1: Sign Up / Login */}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('auth');
                }}
                className={`flex-1 min-w-[130px] py-2.5 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 'auth'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/20 text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="truncate">Merchant Profile</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              {/* Step 2: Configure UPI & Bank */}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('input');
                }}
                className={`flex-1 min-w-[140px] py-2.5 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 'input'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/20 text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="truncate">Payment Details</span>
              </button>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              {/* Step 3: Generated QR & Standee */}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('qr_page');
                }}
                className={`flex-1 min-w-[140px] py-2.5 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 'qr_page'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/20 text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="truncate">Generated Standee</span>
              </button>
            </div>

            {currentStep === 'auth' ? (
              <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                <AuthStep
                  currentUser={currentUser}
                  onSaveAndProceed={handleAuthProceed}
                  onProceedAsGuest={() => {}}
                  onLogout={() => handleSaveUser(null)}
                />
              </div>
            ) : currentStep === 'input' ? (
          /* STEP 2: INPUT & CONFIGURE UPI / BANK DETAILS */
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Back to Step 1 bar */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('auth');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Step 1: Sign Up / Account</span>
              </button>

              {currentUser && (
                <span className="text-xs text-slate-400">
                  Signed in: <strong className="text-white">{currentUser.name}</strong>
                </span>
              )}
            </div>
            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveTab('upi');
                }}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'upi'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <IndianRupee className="w-4 h-4" />
                <span>UPI Payment QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveTab('bank');
                }}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'bank'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Bank Account QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setActiveTab('other');
                }}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'other'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Web & Wi-Fi</span>
              </button>
            </div>

            {/* Active Generator Form Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border transition-all duration-500 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                isLampOn
                  ? 'bg-slate-900/80 border-amber-500/30 desk-glow'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800/90">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                    {activeTab === 'upi'
                      ? 'Configure Instant UPI Payment'
                      : activeTab === 'bank'
                      ? 'Configure Bank Transfer Details'
                      : 'Configure Web & Wi-Fi QR'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {activeTab === 'upi'
                      ? 'Enter your UPI ID and amount, then click below to generate your QR Code on the next page'
                      : activeTab === 'bank'
                      ? 'Direct NPCI Account+IFSC transfer or International SEPA wire format'
                      : 'Connect customers to your website, menu, or guest Wi-Fi network'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  title="Bookmark this QR to History"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>

              {/* Form Content */}
              {activeTab === 'upi' && (
                <UpiGenerator
                  data={upiData}
                  onChange={setUpiData}
                  onPayloadGenerated={handlePayloadGenerated}
                />
              )}

              {activeTab === 'bank' && (
                <BankDetailsGenerator
                  data={bankData}
                  onChange={setBankData}
                  onPayloadGenerated={handlePayloadGenerated}
                />
              )}

              {activeTab === 'other' && (
                <OtherQrGenerators onPayloadGenerated={handlePayloadGenerated} />
              )}

              {/* NEXT PAGE: GENERATE QR CODE ACTION BUTTON */}
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSuccessChime();
                    setCurrentStep('qr_page');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>Generate QR Code (Next Page)</span>
                  <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Offline Privacy Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Client-Side Engine:</strong> All QR encoding, SVG generation, and sound synthesis happen 100% inside your browser. No data is ever sent to any remote server.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* PAGE 2: GENERATED QR CODE & STANDEE STUDIO SHOWCASE */
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Return & Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('input');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all hover:-translate-x-0.5"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>← Back / Edit Payment Details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-slate-700 transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to History</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setCurrentStep('input');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  <span>New QR Code</span>
                </button>
              </div>
            </div>

            {/* Payment Summary Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Ready for Scan & Payment</div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">
                    {activeTab === 'upi'
                      ? upiData.payeeName || 'Merchant'
                      : bankData.accountHolderName || 'Account Holder'}
                  </h2>
                  <div className="text-xs font-mono text-amber-300">
                    {activeTab === 'upi'
                      ? `UPI: ${upiData.upiId}`
                      : `A/C: ${bankData.accountNumber} • IFSC: ${bankData.ifsc}`}
                  </div>
                </div>
              </div>

              {activeTab === 'upi' && upiData.amount && parseFloat(upiData.amount) > 0 && (
                <div className="px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-right">
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">Total Amount</div>
                  <div className="text-lg font-extrabold text-white font-display">
                    ₹{parseFloat(upiData.amount).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Standee & QR Code Studio Display */}
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-amber-500/30 desk-glow shadow-2xl flex flex-col items-center">
              <QrDisplay
                payload={activePayload}
                title={qrTitle}
                subtitle={qrSubtitle}
                payeeName={activeTab === 'upi' ? upiData.payeeName : bankData.accountHolderName}
                amount={activeTab === 'upi' ? upiData.amount : bankData.amount}
                upiId={activeTab === 'upi' ? upiData.upiId : undefined}
                isUpi={activeTab === 'upi' || bankData.mode === 'npci_upi'}
              />
            </div>

            {/* Return to Edit details button at the bottom */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCurrentStep('input');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 underline underline-offset-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Want to change amount or bank details? Go back to edit
              </button>
            </div>
          </div>
        )}
      </>
    )}
    </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        currentUser={currentUser}
        onClose={() => setAuthModalOpen(false)}
        onSaveUser={handleSaveUser}
        onApplyProfileToForm={handleApplyProfileToForm}
      />

      {/* QR Scanner / Inspector Modal */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onLoadResultToForm={(decoded) => {
          try {
            const url = new URL(decoded);
            const pa = url.searchParams.get('pa') || '';
            const pn = url.searchParams.get('pn') || '';
            const am = url.searchParams.get('am') || '';
            const tn = url.searchParams.get('tn') || '';
            setActiveTab('upi');
            setUpiData({
              upiId: pa,
              payeeName: pn || 'Merchant',
              amount: am,
              note: tn,
            });
            sounds.playSuccessChime();
          } catch {
            // Ignore format
          }
        }}
      />

      {/* Saved History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={historyItems}
        onSelectItem={handleRestoreHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Prompt Engineer Drawer / Modal */}
      {promptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white font-display">
                  Best Animated Prompt Spec
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPromptModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 font-mono text-xs text-amber-200/90 leading-relaxed max-h-96 overflow-y-auto border border-slate-800 select-all">
              {`Create a modern, hyper-tactile offline QR Code Studio & Payment Generator with:
1. Interactive Beaded Pull-Cord Desk Lamp with spring physics, toggle switch, warm ray lighting cone, filament glow, and Web Audio API click sound.
2. Illuminated Auth Drawer: Pulling the lamp cord reveals an illuminated merchant Sign In and Sign Up portal with 100% offline local storage persistence.
3. UPI Payment QR Generator: Instant live generation as you type UPI ID and Amount, with quick bank handle chips (@okhdfcbank, @oksbi, @paytm), preset amount pills (+₹50, +₹100, +₹500, +₹1000), and test scan deep link.
4. Bank Transfer QR Generator: Direct NPCI Account+IFSC UPI payment QR (account@ifsc.ifsc.npci) and International SEPA Girocode / Wire text cards with auto-detected bank names from IFSC prefixes.
5. Realistic 3D Acrylic Countertop Standee: Displays official merchant standee with "Scan & Pay with Any UPI App", supported app badges (GPay, PhonePe, Paytm, BHIM), custom shop name, and verified badge.
6. Export: 1024px High-Res PNG, SVG vector, copy image blob to clipboard, and print view.
7. 100% Client-Side & Offline: Zero external server dependencies, instant responsiveness.`}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Create a modern, hyper-tactile offline QR Code Studio & Payment Generator with an interactive pull-cord desk lamp that illuminates sign-up/login, instant UPI ID and amount conversion to QR code, bank transfer QR generation, and realistic acrylic countertop payment standees.`
                  );
                  sounds.playSuccessChime();
                  setPromptModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Copy Prompt to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
