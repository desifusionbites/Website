import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message);
  // Default to +91 country code if 10 digits
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodedMsg}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
