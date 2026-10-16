import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUpiId,
  validateIfsc,
  validateAccountNumber,
  generateUpiPayload,
  generateBankAccountPayload,
  generateEpcPayload,
  generateWifiPayload,
  formatINR,
} from './qrPayloads.ts';

test('validateUpiId validates correct handles and flags invalid', () => {
  assert.equal(validateUpiId('alex@okhdfcbank').valid, true);
  assert.equal(validateUpiId('shop99@paytm').valid, true);
  assert.equal(validateUpiId('user.name@oksbi').valid, true);

  assert.equal(validateUpiId('').valid, false);
  assert.equal(validateUpiId('no-at-sign').valid, false);
  assert.equal(validateUpiId('@onlydomain').valid, false);
});

test('validateIfsc validates 11-char IFSC code standard', () => {
  assert.equal(validateIfsc('SBIN0001234').valid, true);
  assert.equal(validateIfsc('HDFC0000240').valid, true);
  assert.equal(validateIfsc('sbin0001234').valid, true); // case insensitive

  assert.equal(validateIfsc('SBIN1234').valid, false); // too short
  assert.equal(validateIfsc('SBINX001234').valid, false); // 5th char must be 0
});

test('validateAccountNumber checks digit count between 9 and 18', () => {
  assert.equal(validateAccountNumber('123456789012').valid, true);
  assert.equal(validateAccountNumber('1234 5678 9012').valid, true); // spaces stripped

  assert.equal(validateAccountNumber('1234').valid, false); // too short
  assert.equal(validateAccountNumber('12345678901234567890').valid, false); // too long
});

test('generateUpiPayload creates compliant NPCI payment URI', () => {
  const payload = generateUpiPayload({
    upiId: 'merchant@okhdfcbank',
    payeeName: 'Organic Store',
    amount: 250.5,
    note: 'Order 101',
  });

  assert.ok(payload.startsWith('upi://pay?'));
  const url = new URL(payload);
  assert.equal(url.searchParams.get('pa'), 'merchant@okhdfcbank');
  assert.equal(url.searchParams.get('pn'), 'Organic Store');
  assert.equal(url.searchParams.get('am'), '250.50');
  assert.equal(url.searchParams.get('cu'), 'INR');
  assert.equal(url.searchParams.get('tn'), 'Order 101');
});

test('generateBankAccountPayload produces NPCI account+IFSC virtual VPA', () => {
  const payload = generateBankAccountPayload({
    accountNumber: '987654321012',
    ifsc: 'HDFC0001234',
    accountHolderName: 'Priya Sharma',
    amount: 1500,
    note: 'Tuition Fee',
  });

  const url = new URL(payload);
  assert.equal(url.searchParams.get('pa'), '987654321012@HDFC0001234.ifsc.npci');
  assert.equal(url.searchParams.get('pn'), 'Priya Sharma');
  assert.equal(url.searchParams.get('am'), '1500.00');
});

test('generateBankAccountPayload produces formatted text when selected', () => {
  const textPayload = generateBankAccountPayload({
    accountNumber: '987654321012',
    ifsc: 'HDFC0001234',
    accountHolderName: 'Priya Sharma',
    bankName: 'HDFC Bank',
    accountType: 'Savings',
    format: 'formatted_text',
  });

  assert.ok(textPayload.includes('BANK ACCOUNT TRANSFER DETAILS'));
  assert.ok(textPayload.includes('Account Number: 987654321012'));
  assert.ok(textPayload.includes('IFSC Code: HDFC0001234'));
  assert.ok(textPayload.includes('Bank Name: HDFC Bank'));
});

test('generateEpcPayload generates valid SEPA Girocode string', () => {
  const epc = generateEpcPayload({
    iban: 'DE89370400440532013000',
    bic: 'DBEUST33',
    payeeName: 'Hans Schmidt',
    amount: 45.2,
    reference: 'Invoice 2026-99',
  });

  const lines = epc.split('\n');
  assert.equal(lines[0], 'BCD');
  assert.equal(lines[1], '002');
  assert.equal(lines[3], 'SCT');
  assert.equal(lines[4], 'DBEUST33');
  assert.equal(lines[5], 'Hans Schmidt');
  assert.equal(lines[6], 'DE89370400440532013000');
  assert.equal(lines[7], 'EUR45.20');
});

test('generateWifiPayload properly escapes and sets parameters', () => {
  const wifi = generateWifiPayload({
    ssid: 'Café;Net',
    password: 'my:Secret;Password',
    encryption: 'WPA',
  });

  assert.equal(wifi, 'WIFI:T:WPA;S:Café\\;Net;P:my\\:Secret\\;Password;H:false;;');
});

test('formatINR formats currency strings properly', () => {
  const formatted = formatINR(5000);
  assert.ok(formatted.includes('5,000') || formatted.includes('5000'));
});
