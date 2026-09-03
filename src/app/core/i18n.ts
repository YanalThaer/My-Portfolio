import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type Lang = 'en' | 'ar';

export interface UiStrings {
  skip: string;
  navHome: string;
  navWork: string;
  navResume: string;
  navProjects: string;
  navContact: string;
  openMenu: string;
  closeMenu: string;
  switchToEn: string;
  switchToAr: string;
  switchToLight: string;
  switchToDark: string;
  chooseAccent: string;
  accentColor: string;
  customAccent: string;
  backgroundColor: string;
  customBackground: string;
  defaultBackground: string;
  resetTheme: string;
  themeLockedHint: string;
  contactMe: string;
  viewProjects: string;
  backToTop: string;
  loading: string;
  homeSkills: string;
  copyEmail: string;
  copiedEmail: string;
  imA: string;
  whatsappChat: string;
  whatIDoLead: string;
  whatIDoSpan: string;
  contactAbout: string;
  latestLead: string;
  latestSpan: string;
  filterAll: string;
  filterGroup: string;
  noMatch: string;
  liveDemo: string;
  githubRepo: string;
  privateRepo: string;
  preview: string;
  viewDetails: string;
  backToProjects: string;
  otherProjects: string;
  projectNotFound: string;
  resume: string;
  resumeSections: string;
  headingMy: string;
  contactLead: string;
  contactSpan: string;
  sendMessage: string;
  sending: string;
  fullName: string;
  emailAddress: string;
  phoneOptional: string;
  yourMessage: string;
  fixFields: string;
  formNotConfigured: string;
  sendingMessage: string;
  sent: string;
  sendFailed: string;
  nameRequired: string;
  emailRequired: string;
  messageRequired: string;
  emailInvalid: string;
  checkField: string;
  notProvided: string;
  pageNotFoundLead: string;
  pageNotFoundSpan: string;
  notFoundDesc: string;
  backHome: string;
  whatsapp: string;
  jobTitle: string;
  logoHome: string;
  shortcutsTitle: string;
  shortcutsHint: string;
  shortcutTheme: string;
  shortcutLang: string;
  shortcutAccent: string;
  shortcutCursor: string;
  shortcutHelp: string;
  shortcutClose: string;
  shortcutPalette: string;
  searchOpen: string;
  paletteTitle: string;
  palettePlaceholder: string;
  paletteEmpty: string;
  cursorOn: string;
  cursorOff: string;
}

const UI: Record<Lang, UiStrings> = {
  en: {
    skip: 'Skip to main content',
    navHome: 'Home',
    navWork: 'Work',
    navResume: 'Resume',
    navProjects: 'Projects',
    navContact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToEn: 'Switch to English',
    switchToAr: 'Switch to Arabic',
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
    chooseAccent: 'Choose colors',
    accentColor: 'Accent color',
    customAccent: 'Custom color',
    backgroundColor: 'Background',
    customBackground: 'Custom background',
    defaultBackground: 'Default background',
    resetTheme: 'Reset to default',
    themeLockedHint: 'Light and dark are locked while colors are customized. Press Reset to unlock them.',
    contactMe: 'Contact Me',
    viewProjects: 'View projects',
    backToTop: 'Back to top',
    loading: 'Loading page',
    homeSkills: 'Core skills',
    copyEmail: 'Copy email',
    copiedEmail: 'Email copied',
    imA: "I'm a",
    whatsappChat: 'Chat on WhatsApp',
    whatIDoLead: 'What I',
    whatIDoSpan: 'Do',
    contactAbout: 'Contact me about',
    latestLead: 'Latest',
    latestSpan: 'Projects',
    filterAll: 'All',
    filterGroup: 'Filter projects by technology',
    noMatch: 'No projects match this filter yet.',
    liveDemo: 'Live demo',
    githubRepo: 'GitHub repository',
    privateRepo: 'Private repository',
    preview: 'preview',
    viewDetails: 'Case study',
    backToProjects: 'Back to projects',
    otherProjects: 'Other projects',
    projectNotFound: 'This project page does not exist. Head back to the projects list.',
    resume: 'Resume',
    resumeSections: 'Resume sections',
    headingMy: 'My',
    contactLead: 'Contact',
    contactSpan: 'Me',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    fullName: 'Full name',
    emailAddress: 'Email address',
    phoneOptional: 'Phone number (optional)',
    yourMessage: 'Your message',
    fixFields: 'Please fix the highlighted fields.',
    formNotConfigured: 'Contact form is not configured yet.',
    sendingMessage: 'Sending message...',
    sent: 'Message sent successfully!',
    sendFailed: 'Failed to send message. Please try again.',
    nameRequired: 'Please enter your name.',
    emailRequired: 'Please enter your email.',
    messageRequired: 'Please enter a message.',
    emailInvalid: 'Please enter a valid email address.',
    checkField: 'Please check this field.',
    notProvided: 'Not provided',
    pageNotFoundLead: 'Page',
    pageNotFoundSpan: 'not found',
    notFoundDesc:
      'This link does not exist. Head back to the home page to see my work, resume, and contact details.',
    backHome: 'Back to Home',
    whatsapp: 'WhatsApp',
    jobTitle: 'Software Engineer',
    logoHome: 'Yanal home',
    shortcutsTitle: 'Keyboard shortcuts',
    shortcutsHint: 'Shortcuts',
    shortcutTheme: 'Light / dark',
    shortcutLang: 'Language',
    shortcutAccent: 'Colors',
    shortcutCursor: 'Custom cursor on / off',
    shortcutHelp: 'This list',
    shortcutClose: 'Close',
    shortcutPalette: 'Command palette',
    searchOpen: 'Search',
    paletteTitle: 'Command palette',
    palettePlaceholder: 'Go to a page, project, or action…',
    paletteEmpty: 'Nothing matches.',
    cursorOn: 'Turn custom cursor on',
    cursorOff: 'Turn custom cursor off',
  },
  ar: {
    skip: 'تخطي إلى المحتوى',
    navHome: 'الرئيسية',
    navWork: 'العمل',
    navResume: 'السيرة',
    navProjects: 'المشاريع',
    navContact: 'تواصل',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    switchToEn: 'التبديل إلى الإنجليزية',
    switchToAr: 'التبديل إلى العربية',
    switchToLight: 'التبديل إلى الثيم الفاتح',
    switchToDark: 'التبديل إلى الثيم الغامق',
    chooseAccent: 'اختيار الألوان',
    accentColor: 'لون الثيم',
    customAccent: 'لون مخصص',
    backgroundColor: 'الخلفية',
    customBackground: 'خلفية مخصصة',
    defaultBackground: 'الخلفية الافتراضية',
    resetTheme: 'إعادة للرئيسي',
    themeLockedHint: 'الفاتح والغامق مقفولان أثناء تخصيص الألوان. اضغط إعادة للرئيسي حتى يشتغلوا.',
    contactMe: 'تواصل معي',
    viewProjects: 'عرض المشاريع',
    backToTop: 'العودة للأعلى',
    loading: 'جاري تحميل الصفحة',
    homeSkills: 'المهارات الأساسية',
    copyEmail: 'نسخ البريد',
    copiedEmail: 'تم نسخ البريد',
    imA: 'أنا',
    whatsappChat: 'محادثة واتساب',
    whatIDoLead: 'ماذا',
    whatIDoSpan: 'أقدم',
    contactAbout: 'تواصل معي بخصوص',
    latestLead: 'أحدث',
    latestSpan: 'المشاريع',
    filterAll: 'الكل',
    filterGroup: 'تصفية المشاريع حسب التقنية',
    noMatch: 'لا توجد مشاريع بهذه التقنية بعد.',
    liveDemo: 'عرض حي',
    githubRepo: 'مستودع GitHub',
    privateRepo: 'مستودع خاص',
    preview: 'معاينة',
    viewDetails: 'التفاصيل',
    backToProjects: 'العودة للمشاريع',
    otherProjects: 'مشاريع أخرى',
    projectNotFound: 'صفحة هذا المشروع غير موجودة. عد إلى قائمة المشاريع.',
    resume: 'السيرة الذاتية',
    resumeSections: 'أقسام السيرة',
    headingMy: '',
    contactLead: 'تواصل',
    contactSpan: 'معي',
    sendMessage: 'إرسال الرسالة',
    sending: 'جاري الإرسال...',
    fullName: 'الاسم الكامل',
    emailAddress: 'البريد الإلكتروني',
    phoneOptional: 'رقم الهاتف (اختياري)',
    yourMessage: 'رسالتك',
    fixFields: 'يرجى تصحيح الحقول المحددة.',
    formNotConfigured: 'نموذج التواصل غير معدّ بعد.',
    sendingMessage: 'جاري إرسال الرسالة...',
    sent: 'تم إرسال الرسالة بنجاح.',
    sendFailed: 'تعذر إرسال الرسالة. حاول مرة أخرى.',
    nameRequired: 'يرجى إدخال اسمك.',
    emailRequired: 'يرجى إدخال بريدك الإلكتروني.',
    messageRequired: 'يرجى إدخال رسالة.',
    emailInvalid: 'يرجى إدخال بريد إلكتروني صالح.',
    checkField: 'يرجى التحقق من هذا الحقل.',
    notProvided: 'غير مذكور',
    pageNotFoundLead: 'الصفحة',
    pageNotFoundSpan: 'غير موجودة',
    notFoundDesc: 'هذا الرابط غير موجود. عد إلى الرئيسية للاطلاع على أعمالي وسيرتي وبيانات التواصل.',
    backHome: 'العودة للرئيسية',
    whatsapp: 'واتساب',
    jobTitle: 'مهندس برمجيات',
    logoHome: 'الرئيسية — ينال',
    shortcutsTitle: 'اختصارات الكيبورد',
    shortcutsHint: 'الاختصارات',
    shortcutTheme: 'فاتح / غامق',
    shortcutLang: 'اللغة',
    shortcutAccent: 'الألوان',
    shortcutCursor: 'تشغيل / إيقاف الكرسر المخصص',
    shortcutHelp: 'هذه القائمة',
    shortcutClose: 'إغلاق',
    shortcutPalette: 'قائمة الأوامر',
    searchOpen: 'بحث',
    paletteTitle: 'قائمة الأوامر',
    palettePlaceholder: 'روح لصفحة أو مشروع أو أمر…',
    paletteEmpty: 'ما في نتيجة.',
    cursorOn: 'تشغيل الكرسر المخصص',
    cursorOff: 'إيقاف الكرسر المخصص',
  },
};

const STORAGE_KEY = 'portfolio-lang';

@Injectable({
  providedIn: 'root',
})
export class I18n {
  private readonly document = inject(DOCUMENT);
  readonly lang = signal<Lang>(this.readInitial());
  readonly t = computed(() => UI[this.lang()]);
  readonly isRtl = computed(() => this.lang() === 'ar');

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.apply(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* ignore private-mode failures */
      }
    });
  }

  toggle(): void {
    this.lang.update((lang) => (lang === 'ar' ? 'en' : 'ar'));
  }

  showingCount(count: number): string {
    return this.lang() === 'ar' ? `عرض ${count} مشاريع` : `Showing ${count} projects`;
  }

  usingCount(count: number, tech: string): string {
    if (this.lang() === 'ar') {
      return count === 1 ? `مشروع واحد يستخدم ${tech}` : `${count} مشاريع تستخدم ${tech}`;
    }
    return count === 1 ? `1 project using ${tech}` : `${count} projects using ${tech}`;
  }

  pageTitle(path: string, name: string): string {
    const job = this.t().jobTitle;
    const titles: Record<string, string> = {
      '/': `${name} | ${job}`,
      '/work': `${this.t().navWork} | ${name}`,
      '/resume': `${this.t().navResume} | ${name}`,
      '/projects': `${this.t().navProjects} | ${name}`,
      '/contact': `${this.t().navContact} | ${name}`,
    };
    if (path.startsWith('/projects/') && path !== '/projects') {
      return `${this.t().navProjects} | ${name}`;
    }
    if (path && !titles[path] && path !== '/') {
      return `${this.t().pageNotFoundLead} ${this.t().pageNotFoundSpan} | ${name}`;
    }
    return titles[path] || `${name} | ${job}`;
  }

  private readInitial(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    return 'en';
  }

  private apply(lang: Lang): void {
    const root = this.document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
