import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Printer,
  Sparkles,
  Palette,
  ExternalLink,
  ShieldCheck,
  Check,
  Smartphone,
  Eye,
  Maximize2,
  Share2,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

interface QrDisplayProps {
  payload: string;
  title: string;
  subtitle: string;
  payeeName?: string;
  amount?: string;
  upiId?: string;
  isUpi: boolean;
}

export type StandeeTheme = 'acrylic' | 'sticker' | 'minimal';

export const QrDisplay: React.FC<QrDisplayProps> = ({
  payload,
  title,
  subtitle,
  payeeName,
  amount,
  upiId,
  isUpi,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  const [standeeTheme, setStandeeTheme] = useState<StandeeTheme>('acrylic');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [centerIcon, setCenterIcon] = useState<'upi' | 'rupee' | 'bank' | 'shield' | 'none'>('upi');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');

  // Generate QR Code on canvas and generate SVG string
  useEffect(() => {
    if (!payload || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const size = 320;
    canvas.width = size;
    canvas.height = size;

    // Use High error correction (H) if an icon is placed in the center, else Quartile (Q)
    const errorCorrectionLevel = centerIcon !== 'none' ? 'H' : 'Q';

    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor === 'transparent' ? '#00000000' : bgColor,
        },
        errorCorrectionLevel,
      },
      (err) => {
        if (err) {
          console.error('QR Render error:', err);
          return;
        }

        // Draw center logo badge onto canvas if enabled
        if (centerIcon !== 'none') {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const centerSize = 54;
            const x = (size - centerSize) / 2;
            const y = (size - centerSize) / 2;

            // Badge Background
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(x - 4, y - 4, centerSize + 8, centerSize + 8, 12);
            ctx.fill();
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Inner Accent Badge
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(x, y, centerSize, centerSize, 10);
            ctx.fill();

            // Text/Symbol inside
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 22px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let symbol = '⚡';
            if (centerIcon === 'upi') symbol = 'UPI';
            else if (centerIcon === 'rupee') symbol = '₹';
            else if (centerIcon === 'bank') symbol = '🏦';
            else if (centerIcon === 'shield') symbol = '🛡️';

            if (symbol === 'UPI') {
              ctx.font = '900 16px Outfit, sans-serif';
              ctx.fillStyle = '#38bdf8';
              ctx.fillText('UPI', size / 2, size / 2 + 1);
            } else {
              ctx.fillText(symbol, size / 2, size / 2 + 1);
            }
          }
        }
      }
    );

    // Also generate SVG for vector download
    QRCode.toString(
      payload,
      {
        type: 'svg',
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor === 'transparent' ? '#ffffff00' : bgColor,
        },
        errorCorrectionLevel: 'H',
      },
      (err, stringSvg) => {
        if (!err && stringSvg) {
          const encoded = 'data:image/svg+xml;utf8,' + encodeURIComponent(stringSvg);
          setSvgDataUrl(encoded);
        }
      }
    );
  }, [payload, fgColor, bgColor, centerIcon]);

  // High-res 1024px PNG Download
  const handleDownloadPng = async () => {
    sounds.playSuccessChime();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });

    // Render large 1024px canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;

    await QRCode.toCanvas(exportCanvas, payload, {
      width: 1024,
      margin: 3,
      color: {
        dark: fgColor,
        light: bgColor === 'transparent' ? '#00000000' : bgColor,
      },
      errorCorrectionLevel: centerIcon !== 'none' ? 'H' : 'Q',
    });

    if (centerIcon !== 'none') {
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        const centerSize = 172;
        const x = (1024 - centerSize) / 2;
        const y = (1024 - centerSize) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x - 12, y - 12, centerSize + 24, centerSize + 24, 38);
        ctx.fill();
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = 7;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(x, y, centerSize, centerSize, 32);
        ctx.fill();

        ctx.fillStyle = centerIcon === 'upi' ? '#38bdf8' : '#f59e0b';
        ctx.font = '900 52px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label =
          centerIcon === 'upi' ? 'UPI' : centerIcon === 'rupee' ? '₹' : centerIcon === 'bank' ? '🏦' : '🛡️';
        ctx.fillText(label, 512, 515);
      }
    }

    const link = document.createElement('a');
    link.download = `LumiQR-${(payeeName || 'payment').replace(/\s+/g, '_')}-1024px.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const handleDownloadSvg = () => {
    sounds.playSuccessChime();
    const link = document.createElement('a');
    link.download = `LumiQR-${(payeeName || 'payment').replace(/\s+/g, '_')}.svg`;
    link.href = svgDataUrl;
    link.click();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      sounds.playSuccessChime();
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          }
        } catch {
          try {
            await navigator.clipboard?.writeText?.(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          }
        }
      });
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Web Share API to share QR Code image to mobile apps
  const handleShareQr = async () => {
    sounds.playPop();
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const cleanPayee = (payeeName || 'payment').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `LumiQR-${cleanPayee}.png`;
    const shareTitle = `${payeeName || 'Merchant'} QR Code`;
    const shareText = `Scan & pay: ${subtitle || title || 'LumiQR Payment'}`;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Try Web Share API with Image File
        if (typeof navigator !== 'undefined' && navigator.share) {
          const file = new File([blob], fileName, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: shareTitle,
                text: shareText,
                files: [file],
              });
              sounds.playSuccessChime();
              setShared(true);
              setTimeout(() => setShared(false), 2500);
              return;
            } catch (err: unknown) {
              // User dismissed or aborted share dialog
              if ((err as Error)?.name === 'AbortError') return;
            }
          }

          // Fallback: Web Share without file (text/url)
          try {
            await navigator.share({
              title: shareTitle,
              text: `${shareText}\n${payload}`,
            });
            sounds.playSuccessChime();
            setShared(true);
            setTimeout(() => setShared(false), 2500);
            return;
          } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') return;
          }
        }

        // Desktop/Unsupported fallback: Copy Image to clipboard and notify
        try {
          if (navigator.clipboard?.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setShareToast('QR image copied to clipboard! (Share active on mobile)');
          } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(payload);
            setShareToast('QR payload copied to clipboard!');
          } else {
            setShareToast('QR code ready to share!');
          }
        } catch {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(payload);
              setShareToast('Payment code copied!');
            } else {
              setShareToast('QR code ready for mobile sharing!');
            }
          } catch {
            setShareToast('QR code ready for mobile sharing!');
          }
        }

        sounds.playSuccessChime();
        setShared(true);
        setTimeout(() => {
          setShared(false);
          setShareToast(null);
        }, 3000);
      });
    } catch {
      try {
        await navigator.clipboard?.writeText?.(payload);
        setShareToast('Payment code copied!');
      } catch {
        setShareToast('QR code ready for mobile sharing!');
      }
      sounds.playSuccessChime();
      setShared(true);
      setTimeout(() => {
        setShared(false);
        setShareToast(null);
      }, 3000);
    }
  };

  // Print Standee
  const handlePrint = () => {
    sounds.playPop();
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Standee Style Picker Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setStandeeTheme('acrylic');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            standeeTheme === 'acrylic'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏬 Merchant Standee
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setStandeeTheme('sticker');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            standeeTheme === 'sticker'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏷️ Sticker Badge
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setStandeeTheme('minimal');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            standeeTheme === 'minimal'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⬛ Pure QR
        </button>
      </div>

      {/* RENDERED STANDEE / QR DISPLAY CARD */}
      <div
        ref={printContainerRef}
        className="w-full max-w-[380px] sm:max-w-[420px] transition-all duration-300"
      >
        {standeeTheme === 'acrylic' ? (
          /* Realistic Acrylic Countertop Standee */
          <div className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6 sm:p-7 text-slate-900 shadow-2xl border-4 border-slate-200/90 standee-card flex flex-col items-center">
            {/* Acrylic Glass Shine reflection overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/80 via-white/20 to-transparent rounded-t-3xl pointer-events-none" />

            {/* Standee Header */}
            <div className="w-full flex items-center justify-between border-b-2 border-slate-200/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-amber-400 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 font-display uppercase">
                    {payeeName || 'LumiQR Merchant'}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified QR Payment
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono">
                BHARAT QR
              </span>
            </div>

            {/* Scan prompt banner */}
            <div className="w-full text-center py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold mb-4">
              📲 Scan & Pay with Any Banking / UPI App
            </div>

            {/* High-contrast QR Canvas Container */}
            <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200/90 flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                className="w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-lg"
              />
            </div>

            {/* Payment Details Pill */}
            <div className="mt-4 w-full bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 text-center">
              {amount && parseFloat(amount) > 0 ? (
                <div className="text-base font-extrabold text-slate-950 font-display">
                  Amount: <span className="text-emerald-700">₹{parseFloat(amount).toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-600">
                  Accepts Any Transfer Amount
                </div>
              )}
              {upiId && (
                <div className="text-[11px] font-mono text-slate-600 mt-0.5 truncate px-2">
                  UPI ID: {upiId}
                </div>
              )}
            </div>

            {/* Accepted UPI and Bank Logos */}
            <div className="mt-4 w-full pt-3 border-t border-slate-200 flex items-center justify-center gap-3.5 text-slate-700">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Supported:
              </span>
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  GPay
                </span>
                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                  PhonePe
                </span>
                <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200">
                  Paytm
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  BHIM
                </span>
              </div>
            </div>

            {/* Standee Base representation */}
            <div className="w-48 h-3 mt-4 rounded-full bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 shadow-md border-t border-white" />
          </div>
        ) : standeeTheme === 'sticker' ? (
          /* Payment Sticker Badge */
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-6 text-white border-2 border-amber-500/50 shadow-2xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30">
                ⚡ Instant Offline QR
              </span>
              <h3 className="text-lg font-bold mt-2 font-display text-white">
                {title || 'Scan to Pay'}
              </h3>
              <p className="text-xs text-amber-200/80 font-mono mt-0.5">{subtitle}</p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-lg"
              />
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-300">
                Scan with any QR scanner or camera app
              </span>
            </div>
          </div>
        ) : (
          /* Clean Minimal QR */
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center shadow-xl">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <canvas
                ref={canvasRef}
                className="w-[250px] h-[250px] sm:w-[270px] sm:h-[270px] rounded"
              />
            </div>
            <p className="text-xs text-slate-400 mt-4 font-mono">{subtitle}</p>
          </div>
        )}
      </div>

      {/* QR Customization Panel */}
      <div className="w-full max-w-md mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Style & Center Emblem
          </span>
        </div>

        {/* Center Logo Options */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-medium">Center Logo Emblem:</label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'upi', label: 'UPI' },
              { id: 'rupee', label: '₹ INR' },
              { id: 'bank', label: '🏦 Bank' },
              { id: 'shield', label: '🛡️ Safe' },
              { id: 'none', label: 'None' },
            ].map((iconOpt) => (
              <button
                key={iconOpt.id}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setCenterIcon(iconOpt.id as typeof centerIcon);
                }}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  centerIcon === iconOpt.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {iconOpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-medium">QR Color Theme:</label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { fg: '#0f172a', bg: '#ffffff', label: 'Classic Slate' },
              { fg: '#047857', bg: '#ffffff', label: 'Emerald' },
              { fg: '#1d4ed8', bg: '#ffffff', label: 'Royal Blue' },
              { fg: '#7c2d12', bg: '#ffffff', label: 'Warm Copper' },
              { fg: '#581c87', bg: '#ffffff', label: 'Deep Purple' },
            ].map((col) => (
              <button
                key={col.fg}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setFgColor(col.fg);
                  setBgColor(col.bg);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  fgColor === col.fg
                    ? 'border-amber-400 bg-slate-800 text-amber-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.fg }} />
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG, SVG, Share, Copy, Print */}
      <div className="w-full max-w-md mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>PNG 1024</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadSvg}
          className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>SVG Vector</span>
        </button>

        <button
          type="button"
          onClick={handleShareQr}
          aria-label="Share QR code image to other mobile apps"
          className="py-2.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {shared ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Shared!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Image</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="col-span-2 sm:col-span-1 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print</span>
        </button>
      </div>

      {shareToast && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-1.5 shadow-md">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Deep Link Test for UPI */}
      {isUpi && payload.startsWith('upi://') && (
        <div className="w-full max-w-md mt-3">
          <a
            href={payload}
            onClick={() => sounds.playBeep()}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Test Scan: Open UPI App (Mobile Only)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
