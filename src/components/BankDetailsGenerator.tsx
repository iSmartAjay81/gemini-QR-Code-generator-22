import React, { useEffect } from 'react';
import { Building2, CreditCard, User, Landmark, IndianRupee, Globe2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  validateIfsc,
  validateAccountNumber,
  generateBankAccountPayload,
  generateEpcPayload,
  formatINR,
} from '../utils/qrPayloads';
import { sounds } from '../utils/sound';

export interface BankFormData {
  mode: 'npci_upi' | 'formatted_text' | 'epc_sepa';
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankName: string;
  branch: string;
  accountType: 'Savings' | 'Current';
  amount: string;
  note: string;
  // SEPA specific
  iban: string;
  bic: string;
}

interface BankDetailsGeneratorProps {
  data: BankFormData;
  onChange: (data: BankFormData) => void;
  onPayloadGenerated: (payload: string, title: string, subtitle: string) => void;
}

// Known bank code prefixes for friendly auto-detection
const BANK_PREFIXES: Record<string, string> = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  UTIB: 'Axis Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  KKBK: 'Kotak Mahindra Bank',
  CNRB: 'Canara Bank',
  UBIN: 'Union Bank of India',
  IDIB: 'Indian Bank',
  YESB: 'Yes Bank',
  IDFB: 'IDFC FIRST Bank',
  INDB: 'IndusInd Bank',
};

export const BankDetailsGenerator: React.FC<BankDetailsGeneratorProps> = ({
  data,
  onChange,
  onPayloadGenerated,
}) => {
  const ifscValidation = validateIfsc(data.ifsc);
  const accValidation = validateAccountNumber(data.accountNumber);

  // Auto-detect bank name from IFSC prefix if not manually typed
  const handleIfscChange = (raw: string) => {
    const val = raw.toUpperCase().trim();
    let detectedBank = data.bankName;
    if (val.length >= 4) {
      const prefix = val.slice(0, 4);
      if (BANK_PREFIXES[prefix] && (!data.bankName || Object.values(BANK_PREFIXES).includes(data.bankName))) {
        detectedBank = BANK_PREFIXES[prefix];
      }
    }
    onChange({ ...data, ifsc: val, bankName: detectedBank });
  };

  useEffect(() => {
    let payload = '';
    let title = '';
    let subtitle = '';

    if (data.mode === 'epc_sepa') {
      payload = generateEpcPayload({
        iban: data.iban || 'DE89370400440532013000',
        bic: data.bic,
        payeeName: data.accountHolderName || 'Beneficiary',
        amount: data.amount ? parseFloat(data.amount) : undefined,
        reference: data.note || 'Bank Transfer',
      });
      title = 'EPC SEPA Bank QR';
      subtitle = `${data.accountHolderName || 'Beneficiary'} • ${data.iban ? `IBAN: ${data.iban.slice(0, 4)}...` : 'SEPA'}`;
    } else {
      payload = generateBankAccountPayload({
        accountNumber: data.accountNumber || '123456789012',
        ifsc: data.ifsc || 'SBIN0001234',
        accountHolderName: data.accountHolderName || 'Account Holder',
        bankName: data.bankName,
        branch: data.branch,
        accountType: data.accountType,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        note: data.note,
        format: data.mode,
      });

      if (data.mode === 'npci_upi') {
        title = 'Direct Bank UPI Payment QR';
        subtitle = `${data.accountHolderName || 'Holder'} • ${data.bankName || 'Direct Account'}`;
      } else {
        title = 'Bank Transfer Details Card';
        subtitle = `${data.bankName || 'Bank'} A/C: ${data.accountNumber ? `••••${data.accountNumber.slice(-4)}` : '••••'}`;
      }
    }

    onPayloadGenerated(payload, title, subtitle);
  }, [data, onPayloadGenerated]);

  return (
    <div className="space-y-5">
      {/* Transfer Format Mode Tabs */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onChange({ ...data, mode: 'npci_upi' });
          }}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            data.mode === 'npci_upi'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>UPI Direct to Bank</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onChange({ ...data, mode: 'formatted_text' });
          }}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            data.mode === 'formatted_text'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Account Card QR</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onChange({ ...data, mode: 'epc_sepa' });
          }}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            data.mode === 'epc_sepa'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>SEPA / Wire</span>
        </button>
      </div>

      {data.mode === 'epc_sepa' ? (
        /* International / SEPA EPC Fields */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              IBAN (International Bank Account Number) *
            </label>
            <input
              type="text"
              value={data.iban}
              onChange={(e) => onChange({ ...data, iban: e.target.value.toUpperCase() })}
              placeholder="e.g. DE89 3704 0044 0532 0130 00"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                BIC / SWIFT Code
              </label>
              <input
                type="text"
                value={data.bic}
                onChange={(e) => onChange({ ...data, bic: e.target.value.toUpperCase() })}
                placeholder="e.g. DBEUST33"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount (EUR €)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.amount}
                onChange={(e) => onChange({ ...data, amount: e.target.value })}
                placeholder="0.00 (Optional)"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* National Bank Transfer Fields (India / Universal) */
        <div className="space-y-4">
          {/* Account Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                Bank Account Number *
              </label>
              {data.accountNumber && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    accValidation.valid ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {accValidation.valid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Valid format
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> 9-18 digits
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              value={data.accountNumber}
              onChange={(e) => onChange({ ...data, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 50100412345678"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
              required
            />
          </div>

          {/* IFSC Code & Auto-Detected Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">IFSC Code *</label>
                {data.ifsc && (
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      ifscValidation.valid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {ifscValidation.valid ? 'Valid' : '11-chars'}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={data.ifsc}
                onChange={(e) => handleIfscChange(e.target.value)}
                maxLength={11}
                placeholder="e.g. HDFC0000128"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={data.bankName}
                onChange={(e) => onChange({ ...data, bankName: e.target.value })}
                placeholder="Auto-detected or enter name"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Account Holder Name & Account Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Account Holder / Beneficiary Name *
              </label>
              <input
                type="text"
                value={data.accountHolderName}
                onChange={(e) => onChange({ ...data, accountHolderName: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Type
              </label>
              <select
                value={data.accountType}
                onChange={(e) => onChange({ ...data, accountType: e.target.value as 'Savings' | 'Current' })}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
          </div>

          {/* Amount & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <IndianRupee className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                Amount (INR ₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={data.amount}
                onChange={(e) => onChange({ ...data, amount: e.target.value })}
                placeholder="0.00 (Customer enters)"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Transfer Remarks / Purpose
              </label>
              <input
                type="text"
                value={data.note}
                onChange={(e) => onChange({ ...data, note: e.target.value })}
                placeholder="e.g. Invoice #201, Tuition"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          {data.mode === 'npci_upi' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              💡 <strong>Instant Direct Bank Transfer:</strong> This creates an official NPCI virtual address (<code className="text-amber-300 font-mono">account@ifsc.ifsc.npci</code>). When scanned by any UPI app, funds deposit immediately directly into your bank account!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
