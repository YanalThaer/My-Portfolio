export interface SocialLink {
  url: string;
  icon: string;
  label: string;
}

export interface HomeData {
  name: string;
  roles: { text: string; i: number }[];
  summary: string;
  cvUrl: string;
  cvLabel: string;
  image: string;
  socials: SocialLink[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface SkillItem {
  name: string;
  icon: string;
}

export interface ResumeData {
  tabs: string[];
  experience: TimelineItem[];
  education: TimelineItem[];
  skills: SkillItem[];
  about: string;
}

export interface ProjectItem {
  number: string;
  title: string;
  description: string;
  tech: string;
  github: string | null;
  liveUrl?: string | null;
  image?: string | null;
}

export interface ContactDetail {
  icon: string;
  kind?: 'phone' | 'email' | 'address';
  label: string;
  value: string;
}

export interface ContactData {
  title: string;
  description: string;
  details: ContactDetail[];
  web3forms?: {
    accessKey: string;
  };
}

export interface PortfolioData {
  logo: string;
  home: HomeData;
  services: ServiceItem[];
  resume: ResumeData;
  projects: ProjectItem[];
  contact: ContactData;
}
