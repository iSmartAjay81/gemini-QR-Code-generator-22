import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { motion } from 'motion/react';
import { X, Upload, ScanLine, CheckCircle2, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadResultToForm?: (decoded: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onLoadResultToForm,
}) => {
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDecodedData(null);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not process canvas context');
          setIsScanning(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsScanning(false);
        if (code && code.data) {
          sounds.playBeep();
          setDecodedData(code.data);
        } else {
          setError('No QR code detected in this image. Please upload a clear QR photo.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyDecoded = () => {
    if (!decodedData) return;
    navigator.clipboard.writeText(decodedData);
    sounds.playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Offline QR Scanner & Tester</h2>
            <p className="text-xs text-slate-400">Upload any QR code image to decode and inspect</p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-7 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Click to upload QR code screenshot or image
          </span>
          <span className="text-xs text-slate-500">Supports PNG, JPG, WEBP • 100% Client-Side</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isScanning && (
          <div className="mt-4 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            Analyzing QR pixels offline...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        {decodedData && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Successfully Decoded QR
              </span>
              <button
                type="button"
                onClick={handleCopyDecoded}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 font-mono text-xs text-amber-300 break-all select-all border border-slate-800">
              {decodedData}
            </div>

            {onLoadResultToForm && decodedData.startsWith('upi://') && (
              <button
                type="button"
                onClick={() => {
                  onLoadResultToForm(decodedData);
                  onClose();
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Fill Decoded Payment into UPI Generator
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
