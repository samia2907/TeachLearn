import { normalizePhoneNumber } from './phoneAuthPolicy.js';

// Contact information only: this never verifies or changes an Auth provider.
export function normalizeContactPhone(value = '') {
  const phone = String(value ?? '').trim()
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776));
  if (!phone) return null;
  if (phone.length > 40) throw new Error('auth/invalid-phone-number');
  const normalized = normalizePhoneNumber(phone);
  if (normalized) return normalized;
  const compact = phone.replace(/[\s()-]/g, '');
  if (/^0[234589]\d{7,8}$/.test(compact)) return `+972${compact.slice(1)}`;
  if (/^972\d{8,9}$/.test(compact)) return `+${compact}`;
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
  // Keep other contact formats; international formatting is not required.
  return phone;
}
