/**
 * Pure utility functions for generating standard payment and offline QR code payloads.
 */

export interface UpiPayloadParams {
  upiId: string;
  payeeName: string;
  amount?: string | number;
  note?: string;
  merchantCode?: string;
  currency?: string;
}

export interface BankAccountParams {
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankName?: string;
  branch?: string;
  amount?: string | number;
  note?: string;
  accountType?: 'Savings' | 'Current';
  format?: 'npci_upi' | 'formatted_text';
}

export interface EpcBankParams {
  iban: string;
  bic?: string;
  payeeName: string;
  amount?: string | number;
  reference?: string;
}

export interface WifiParams {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

/**
 * Validates a UPI ID / Virtual Payment Address (VPA).
 * Standard format: username@bankhandle (e.g. name@okhdfcbank, 9876543210@paytm)
 */
export function validateUpiId(id: string): { valid: boolean; error?: string } {
  const trimmed = id.trim();
  if (!trimmed) {
    return { valid: false, error: 'UPI ID cannot be empty' };
  }
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
  if (!upiRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid UPI format. Expected format: username@bank (e.g. alex@oksbi, store@paytm)',
    };
  }
  return { valid: true };
}

/**
 * Validates Indian IFSC code (11 characters: 4 letters, 0, 6 alphanumeric).
 */
export function validateIfsc(ifsc: string): { valid: boolean; error?: string } {
  const trimmed = ifsc.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: 'IFSC Code cannot be empty' };
  }
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid IFSC format. Must be 11 characters (e.g., SBIN0001234, HDFC0000240)',
    };
  }
  return { valid: true };
}

/**
 * Validates Bank Account Number.
 */
export function validateAccountNumber(account: string): { valid: boolean; error?: string } {
  const clean = account.replace(/[\s-]/g, '');
  if (!clean) {
    return { valid: false, error: 'Account number cannot be empty' };
  }
  if (!/^\d{9,18}$/.test(clean)) {
    return { valid: false, error: 'Account number should be 9 to 18 digits' };
  }
  return { valid: true };
}

/**
 * Generates a valid UPI QR payload adhering to NPCI specifications.
 */
export function generateUpiPayload(params: UpiPayloadParams): string {
  const cleanId = params.upiId.trim();
  const cleanName = params.payeeName.trim() || 'Merchant';
  const currency = params.currency || 'INR';

  const urlParams = new URLSearchParams();
  urlParams.set('pa', cleanId);
  urlParams.set('pn', cleanName);
  urlParams.set('cu', currency);

  if (params.amount !== undefined && params.amount !== null && params.amount !== '') {
    const num = typeof params.amount === 'string' ? parseFloat(params.amount) : params.amount;
    if (!isNaN(num) && num > 0) {
      urlParams.set('am', num.toFixed(2));
    }
  }

  if (params.note && params.note.trim()) {
    urlParams.set('tn', params.note.trim());
  }

  if (params.merchantCode && params.merchantCode.trim()) {
    urlParams.set('mc', params.merchantCode.trim());
  }

  return `upi://pay?${urlParams.toString()}`;
}

/**
 * Generates official NPCI Bank Account UPI Payload or Formatted Wire Text.
 * NPCI UPI format: upi://pay?pa={account}@{ifsc}.ifsc.npci&pn={name}...
 */
export function generateBankAccountPayload(params: BankAccountParams): string {
  const cleanAcc = params.accountNumber.replace(/[\s-]/g, '');
  const cleanIfsc = params.ifsc.trim().toUpperCase();
  const cleanName = params.accountHolderName.trim() || 'Account Holder';

  if (params.format === 'formatted_text') {
    return [
      `BANK ACCOUNT TRANSFER DETAILS`,
      `Account Name: ${cleanName}`,
      `Account Number: ${cleanAcc}`,
      `IFSC Code: ${cleanIfsc}`,
      params.bankName ? `Bank Name: ${params.bankName.trim()}` : null,
      params.branch ? `Branch: ${params.branch.trim()}` : null,
      params.accountType ? `Account Type: ${params.accountType}` : null,
      params.amount ? `Amount: ₹${parseFloat(String(params.amount)).toFixed(2)}` : null,
      params.note ? `Remark / Ref: ${params.note.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Official NPCI Account + IFSC UPI address format
  const npciVpa = `${cleanAcc}@${cleanIfsc}.ifsc.npci`;
  return generateUpiPayload({
    upiId: npciVpa,
    payeeName: cleanName,
    amount: params.amount,
    note: params.note || (params.bankName ? `Transfer to ${params.bankName}` : 'Bank Transfer'),
  });
}

/**
 * Generates an EPC QR / Girocode payload for SEPA / European Bank Transfers.
 */
export function generateEpcPayload(params: EpcBankParams): string {
  const cleanIban = params.iban.replace(/\s+/g, '').toUpperCase();
  const cleanBic = (params.bic || '').replace(/\s+/g, '').toUpperCase();
  const cleanName = params.payeeName.trim();
  const amountStr = params.amount ? `EUR${parseFloat(String(params.amount)).toFixed(2)}` : '';
  const ref = params.reference ? params.reference.trim() : '';

  return [
    'BCD',
    '002',
    '1',
    'SCT',
    cleanBic,
    cleanName,
    cleanIban,
    amountStr,
    '',
    '',
    ref,
  ].join('\n');
}

/**
 * Generates standard Wi-Fi QR Code string.
 */
export function generateWifiPayload(params: WifiParams): string {
  const escapeWifi = (str: string) => str.replace(/([\\;,:"])/g, '\\$1');
  const enc = params.encryption || 'WPA';
  const ssid = escapeWifi(params.ssid.trim());
  const pass = params.password ? escapeWifi(params.password) : '';
  const hidden = params.hidden ? 'true' : 'false';

  return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
}

/**
 * Formats numbers into Indian Currency format (₹ 1,25,000.00).
 */
export function formatINR(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
}
