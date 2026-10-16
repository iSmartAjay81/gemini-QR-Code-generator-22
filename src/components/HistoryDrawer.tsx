import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Trash2, ArrowRight, IndianRupee, Landmark, Globe, Wifi, FileText } from 'lucide-react';
import { sounds } from '../utils/sound';

export interface SavedQrItem {
  id: string;
  type: 'upi' | 'bank' | 'other';
  title: string;
  subtitle: string;
  payload: string;
  amount?: string;
  timestamp: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedQrItem[];
  onSelectItem: (item: SavedQrItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">Saved QR History</h3>
                <p className="text-xs text-slate-400">Offline history on this device</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No recent QR codes saved yet. Create a UPI or Bank QR to automatically save it!
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    sounds.playPop();
                    onSelectItem(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-400/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-amber-400 shrink-0">
                      {item.type === 'upi' ? (
                        <IndianRupee className="w-4 h-4" />
                      ) : item.type === 'bank' ? (
                        <Landmark className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              ))
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClearHistory();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Saved History
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
