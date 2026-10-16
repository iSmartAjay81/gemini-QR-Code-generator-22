import React, { useState, useEffect } from 'react';
import { Globe, Wifi, FileText, Lock, Eye, EyeOff } from 'lucide-react';
import { generateWifiPayload } from '../utils/qrPayloads';
import { sounds } from '../utils/sound';

export type OtherTabType = 'url' | 'wifi' | 'text';

interface OtherQrGeneratorsProps {
  onPayloadGenerated: (payload: string, title: string, subtitle: string) => void;
}

export const OtherQrGenerators: React.FC<OtherQrGeneratorsProps> = ({
  onPayloadGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<OtherTabType>('url');

  // URL state
  const [url, setUrl] = useState('https://');

  // WiFi state
  const [ssid, setSsid] = useState('Home_5G_WiFi');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Text state
  const [text, setText] = useState('Scan to connect or verify offline.');

  useEffect(() => {
    if (activeTab === 'url') {
      const targetUrl = url.trim() || 'https://example.com';
      onPayloadGenerated(targetUrl, 'Web Link QR Code', targetUrl);
    } else if (activeTab === 'wifi') {
      const payload = generateWifiPayload({
        ssid: ssid || 'WiFi Network',
        password,
        encryption,
        hidden,
      });
      onPayloadGenerated(
        payload,
        'Wi-Fi Instant Connect QR',
        `Network: ${ssid || 'Unknown'} (${encryption})`
      );
    } else {
      const val = text.trim() || 'Offline QR';
      onPayloadGenerated(val, 'Custom Text QR Code', `${val.slice(0, 32)}...`);
    }
  }, [activeTab, url, ssid, password, encryption, hidden, text, onPayloadGenerated]);

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('url');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website URL</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('wifi');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'wifi'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Wi-Fi Network</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('text');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Plain Text / Note</span>
        </button>
      </div>

      {activeTab === 'url' && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Target URL / Link
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourstore.com"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500"
          />
        </div>
      )}

      {activeTab === 'wifi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Network Name (SSID) *
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. MyStore_Guest"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Encryption Type
              </label>
              <select
                value={encryption}
                onChange={(e) => setEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password (Open)</option>
              </select>
            </div>

            {encryption !== 'nopass' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wi-Fi Password"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Text / Message / Crypto Address
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type any message, address, serial number, or note..."
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl p-3 text-sm text-white placeholder-slate-500 font-mono"
          />
        </div>
      )}
    </div>
  );
};
