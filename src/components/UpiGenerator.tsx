import React, { useEffect } from 'react';
import { AtSign, IndianRupee, Store, FileText, CheckCircle2, AlertCircle, ArrowUpRight, Zap, Sparkles } from 'lucide-react';
import { validateUpiId, generateUpiPayload, formatINR } from '../utils/qrPayloads';
import { sounds } from '../utils/sound';

export interface UpiFormData {
  upiId: string;
  payeeName: string;
  amount: string;
  note: string;
  merchantCode?: string;
}

interface UpiGeneratorProps {
  data: UpiFormData;
  onChange: (data: UpiFormData) => void;
  onPayloadGenerated: (payload: string, title: string, subtitle: string) => void;
}

const POPULAR_HANDLES = ['@okhdfcbank', '@oksbi', '@okicici', '@okaxis', '@paytm', '@ybl', '@upi'];
const AMOUNT_CHIPS = [50, 100, 200, 500, 1000, 2000];

export const UpiGenerator: React.FC<UpiGeneratorProps> = ({
  data,
  onChange,
  onPayloadGenerated,
}) => {
  const validation = validateUpiId(data.upiId);

  // Recalculate payload whenever data changes
  useEffect(() => {
    const payload = generateUpiPayload({
      upiId: data.upiId.trim() || 'example@upi',
      payeeName: data.payeeName.trim() || 'Payee Name',
      amount: data.amount ? parseFloat(data.amount) : undefined,
      note: data.note.trim() || undefined,
      merchantCode: data.merchantCode?.trim() || undefined,
    });

    const amountDisplay = data.amount && parseFloat(data.amount) > 0 ? formatINR(data.amount) : 'Any Amount';
    const subtitle = `${data.payeeName || 'Merchant'} • ${amountDisplay}`;

    onPayloadGenerated(payload, 'UPI Scan & Pay QR', subtitle);
  }, [data, onPayloadGenerated]);

  const handleHandlePillClick = (handle: string) => {
    sounds.playPop();
    const current = data.upiId;
    const atIndex = current.indexOf('@');
    const prefix = atIndex !== -1 ? current.slice(0, atIndex) : current;
    const newId = (prefix || 'payee') + handle;
    onChange({ ...data, upiId: newId });
  };

  const handleAddAmount = (add: number) => {
    sounds.playPop();
    const current = parseFloat(data.amount) || 0;
    const next = (current + add).toString();
    onChange({ ...data, amount: next });
  };

  const handleSetAmount = (amount: number) => {
    sounds.playPop();
    onChange({ ...data, amount: amount.toString() });
  };

  return (
    <div className="space-y-5">
      {/* UPI ID Field with live verification */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <AtSign className="w-3.5 h-3.5 text-amber-400" />
            UPI ID / VPA *
          </label>
          {data.upiId && (
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                validation.valid ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {validation.valid ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Valid format
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Needs valid handle
                </>
              )}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={data.upiId}
            onChange={(e) => onChange({ ...data, upiId: e.target.value.toLowerCase().trim() })}
            placeholder="e.g. merchant@okhdfcbank or 9876543210@paytm"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 transition-all"
            required
          />
        </div>

        {/* Quick Bank Handle Suggestions */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Quick handles:</span>
          {POPULAR_HANDLES.map((handle) => (
            <button
              key={handle}
              type="button"
              onClick={() => handleHandlePillClick(handle)}
              className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 hover:border-amber-500/30 transition-colors font-mono"
            >
              {handle}
            </button>
          ))}
        </div>
      </div>

      {/* Payee / Business Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          <Store className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
          Payee / Store Name *
        </label>
        <input
          type="text"
          value={data.payeeName}
          onChange={(e) => onChange({ ...data, payeeName: e.target.value })}
          placeholder="e.g. Sharma Sweets & Cafe"
          className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Amount with quick presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            Amount (INR ₹)
            <span className="text-[10px] text-slate-400 font-normal">
              (Leave blank for customer to enter any amount)
            </span>
          </label>
          {data.amount && parseFloat(data.amount) > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onChange({ ...data, amount: '' });
              }}
              className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear amount
            </button>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={data.amount}
            onChange={(e) => onChange({ ...data, amount: e.target.value })}
            placeholder="0.00 (Customer enters amount)"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Quick Amount Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-medium">Add preset:</span>
          {AMOUNT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSetAmount(chip)}
              className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all font-mono font-medium hover:scale-105 active:scale-95"
            >
              ₹{chip}
            </button>
          ))}
        </div>
      </div>

      {/* Note / Purpose */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          <FileText className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
          Transaction Note / Remarks (Optional)
        </label>
        <input
          type="text"
          value={data.note}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
          placeholder="e.g. Coffee & snacks, Order #302, Table 4"
          className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Offline Instant Notice */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Works with GPay, PhonePe, Paytm, BHIM, Cred & Banking apps</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
          NPCI Standard
        </span>
      </div>
    </div>
  );
};
