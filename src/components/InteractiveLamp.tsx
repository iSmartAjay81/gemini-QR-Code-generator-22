import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lamp, LampCeiling, Sparkles, Volume2, VolumeX, ShieldCheck, UserCheck, LogIn, UserPlus } from 'lucide-react';
import { sounds } from '../utils/sound';

interface InteractiveLampProps {
  isLampOn: boolean;
  onToggleLamp: () => void;
  currentUser: { name: string; businessName?: string; upiId?: string } | null;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
}

export const InteractiveLamp: React.FC<InteractiveLampProps> = ({
  isLampOn,
  onToggleLamp,
  currentUser,
  onOpenAuthModal,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePullCord = () => {
    setIsPulling(true);
    sounds.playLampSwitch(!isLampOn);
    setTimeout(() => {
      onToggleLamp();
      setIsPulling(false);
    }, 180);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playPop();
  };

  return (
    <div className="relative w-full overflow-hidden pt-2 pb-6 transition-all duration-700">
      {/* Light Cone Projection when Lamp is ON */}
      <AnimatePresence>
        {isLampOn && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.2 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.3 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="lamp-light-cone absolute left-1/2 -translate-x-1/2 top-14 w-[540px] sm:w-[720px] md:w-[980px] h-[360px] rounded-b-[400px] z-0"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center">
        {/* Lamp Apparatus */}
        <div className="flex flex-col items-center relative">
          {/* Ceiling suspension cord */}
          <div className="w-[3px] h-7 bg-gradient-to-b from-slate-600 via-slate-400 to-amber-700/80 rounded-full" />

          {/* Lamp Fixture & Shade */}
          <div className="relative flex flex-col items-center group cursor-pointer" onClick={handlePullCord}>
            {/* Top brass mounting ring */}
            <div className="w-8 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 rounded-sm shadow-md" />

            {/* Lamp Dome / Shade */}
            <div
              className={`w-28 sm:w-36 h-12 rounded-t-full transition-all duration-500 relative flex items-end justify-center shadow-xl border-t border-amber-300/30 ${
                isLampOn
                  ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-b-2 border-amber-400 shadow-amber-500/30'
                  : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-b-2 border-slate-700'
              }`}
            >
              {/* Metallic highlight streak */}
              <div className="absolute top-1 left-4 right-4 h-[2px] bg-white/30 rounded-full blur-[0.5px]" />

              {/* Glowing Bulb inside */}
              <div className="relative -mb-3">
                <div
                  className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isLampOn
                      ? 'bg-gradient-to-b from-yellow-100 to-amber-300 lamp-bulb-glow scale-110'
                      : 'bg-slate-700/70 border border-slate-600'
                  }`}
                >
                  {/* Glowing filaments */}
                  {isLampOn ? (
                    <motion.div
                      animate={{ opacity: [0.85, 1, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-4 h-4 rounded-full bg-amber-100 border border-amber-400/80 shadow-[inset_0_0_8px_rgba(255,200,50,0.9)]"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Hanging Pull Chain */}
            {/* Interactive Hanging Pull Chain */}
            <div
              className="absolute -right-2 sm:right-2 top-12 flex flex-col items-center cursor-grab active:cursor-grabbing select-none group/chain z-20"
              onClick={(e) => {
                e.stopPropagation();
                handlePullCord();
              }}
              title="Pull lamp cord to toggle Sign In & Illumination"
            >
              {/* Beaded chain */}
              <motion.div
                animate={isPulling ? { height: 44 } : { height: 26 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="w-[3px] beaded-cord rounded-full"
              />

              {/* Brass pull acorn weight with drag spring */}
              <motion.button
                type="button"
                aria-label={isLampOn ? 'Turn lamp off' : 'Turn lamp on to view Sign Up and Login'}
                drag="y"
                dragConstraints={{ top: 0, bottom: 20 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 8) {
                    handlePullCord();
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePullCord();
                }}
                animate={isPulling ? { y: 14, scale: 0.95 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`w-4 h-5 rounded-b-full rounded-t-sm border shadow-lg flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing ${
                  isLampOn
                    ? 'bg-gradient-to-b from-amber-300 to-yellow-600 border-yellow-200 shadow-yellow-500/50'
                    : 'bg-gradient-to-b from-slate-400 to-slate-600 border-slate-300'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Lamp Control Pill & Prompt Indicator */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePullCord}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-xs sm:text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
              isLampOn
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 shadow-amber-900/30'
                : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
            }`}
          >
            {isLampOn ? (
              <>
                <LampCeiling className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Lamp Lit: Illuminated Auth Drawer Open</span>
                <span className="sm:hidden">Lamp Lit • Auth Active</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0" />
              </>
            ) : (
              <>
                <Lamp className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Pull Cord to Illuminate Sign In & Vault</span>
                <span className="sm:hidden">Pull Cord to Light</span>
                <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
              </>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Turn Sound FX On' : 'Turn Sound FX Off'}
            className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* Illuminated Sign Up / Login Console Drawer under the Lamp */}
        <AnimatePresence>
          {isLampOn && (
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-4 w-full max-w-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/95 to-amber-950/40 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden"
            >
              {/* Drawer Handle aesthetic notch */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-amber-400/40" />

              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h2 className="text-base font-semibold text-amber-100 font-display">
                        {currentUser ? `Welcome, ${currentUser.name}` : 'Illuminated Auth Drawer'}
                      </h2>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {currentUser ? 'Logged In • Synced' : 'Sign In / Sign Up'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/90 mt-0.5">
                      {currentUser
                        ? `Merchant Profile Active • Default UPI: ${currentUser.upiId || 'Not set'}`
                        : 'Sign in to save your merchant UPI ID, bank details & generate branded standees (100% offline).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => onOpenAuthModal('signin')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Manage Account
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onOpenAuthModal('signin');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onOpenAuthModal('signup');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-md shadow-amber-500/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
