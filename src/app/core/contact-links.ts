import { ContactDetail } from './portfolio.model';

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function contactHref(label: string, value: string): string | null {
  const key = label.toLowerCase();
  if (key.includes('phone')) {
    return `tel:+${digitsOnly(value)}`;
  }
  if (key.includes('email')) {
    return `mailto:${value.trim()}`;
  }
  if (key.includes('whatsapp')) {
    return `https://wa.me/${digitsOnly(value)}`;
  }
  return null;
}

export function whatsappUrlFromDetails(details: ContactDetail[] = []): string | null {
  const phone = details.find((item) => item.label.toLowerCase().includes('phone'));
  return phone ? `https://wa.me/${digitsOnly(phone.value)}` : null;
}

export function phoneValue(details: ContactDetail[] = []): string {
  return details.find((item) => item.label.toLowerCase().includes('phone'))?.value || '';
}
