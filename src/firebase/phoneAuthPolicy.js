import { newUserProfile } from './userProfilePolicy.js';

export function normalizePhoneNumber(value) {
  let number = value.trim().replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s()-]/g, '');
  if (/^05\d{8}$/.test(number)) number = `+972${number.slice(1)}`;
  if (/^9725\d{8}$/.test(number)) number = `+${number}`;
  if (number.startsWith('00')) number = `+${number.slice(2)}`;
  if (!/^\+[1-9]\d{7,14}$/.test(number)) return null;
  if (number.startsWith('+972') && !/^\+972(?:5\d{8}|[23489]\d{7})$/.test(number)) return null;
  return number;
}

export function phoneProfile(user, role, name, createdAt) {
  return newUserProfile(user, { role, name, authProvider: 'phone' }, createdAt);
}

export function phoneDashboard(profile) {
  if (['blocked', 'inactive', 'suspended'].includes(profile.accountStatus)) throw new Error('account-blocked');
  const route = { student: '/student', teacher: '/teacher', owner: '/owner' }[profile.role];
  if (!route) throw new Error('invalid-role');
  return route;
}
