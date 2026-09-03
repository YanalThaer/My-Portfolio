import { ContactDetail } from './portfolio.model';

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function isPhone(detail: { kind?: string; label: string }): boolean {
  if (detail.kind === 'phone') {
    return true;
  }
  const key = detail.label.toLowerCase();
  return key.includes('phone') || key.includes('هاتف');
}

export function isEmail(detail: { kind?: string; label: string; value?: string }): boolean {
  if (detail.kind === 'email') {
    return true;
  }
  if (detail.value?.includes('@')) {
    return true;
  }
  const key = detail.label.toLowerCase();
  return key.includes('email') || key.includes('بريد');
}

export function contactHref(label: string, value: string, kind?: string): string | null {
  const detail = { kind, label, value };
  if (isPhone(detail)) {
    return `tel:+${digitsOnly(value)}`;
  }
  if (isEmail(detail)) {
    return `mailto:${value.trim()}`;
  }
  if (label.toLowerCase().includes('whatsapp') || label.includes('واتساب')) {
    return `https://wa.me/${digitsOnly(value)}`;
  }
  return null;
}

export function whatsappUrlFromDetails(details: ContactDetail[] = []): string | null {
  const phone = details.find((item) => isPhone(item));
  return phone ? `https://wa.me/${digitsOnly(phone.value)}` : null;
}

export function phoneValue(details: ContactDetail[] = []): string {
  return details.find((item) => isPhone(item))?.value || '';
}

export function emailValue(details: ContactDetail[] = []): string {
  return details.find((item) => isEmail(item))?.value || '';
}
