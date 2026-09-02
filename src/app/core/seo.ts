import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { emailValue } from './contact-links';
import { I18n } from './i18n';
import { Portfolio } from './portfolio';
import { PortfolioData } from './portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18n);
  private data: PortfolioData | null = null;

  constructor() {
    inject(Portfolio)
      .getData()
      .subscribe((data) => {
        this.data = data;
        this.update();
      });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.update();
    });

    toObservable(this.i18n.lang).subscribe(() => this.update());
  }

  private update(): void {
    if (!this.data) {
      return;
    }

    const name = this.data.home.name;
    const description = this.data.home.summary;
    const pageTitle = this.i18n.pageTitle(this.router.url.split('?')[0], name);
    const image = this.absoluteUrl('images/og.jpg');
    const url = this.absoluteUrl(this.router.url.replace(/^\//, ''));
    const locale = this.i18n.lang() === 'ar' ? 'ar_JO' : 'en_US';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'author', content: name });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.setCanonical(url);
    this.setJsonLd(name, description, pageTitle, url, image);
  }

  private absoluteUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const origin = this.document.location?.origin || '';
    const clean = path.replace(/^\//, '');
    return clean ? `${origin}/${clean}` : origin;
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(
    name: string,
    description: string,
    pageTitle: string,
    url: string,
    image: string,
  ): void {
    const origin = this.absoluteUrl('');
    const sameAs = this.data?.home.socials.map((item) => item.url).filter(Boolean) || [];
    const email = emailValue(this.data?.contact.details);
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: `${name} | ${this.i18n.t().jobTitle}`,
          url: origin,
          inLanguage: this.i18n.lang() === 'ar' ? 'ar' : 'en',
        },
        {
          '@type': 'WebPage',
          name: pageTitle,
          url,
          isPartOf: { '@id': origin },
          inLanguage: this.i18n.lang() === 'ar' ? 'ar' : 'en',
        },
        {
          '@type': 'Person',
          name,
          url: origin,
          image,
          description,
          jobTitle: this.i18n.t().jobTitle,
          email: email ? `mailto:${email}` : undefined,
          address: {
            '@type': 'PostalAddress',
            addressLocality: this.i18n.lang() === 'ar' ? 'عمّان' : 'Amman',
            addressCountry: 'JO',
          },
          sameAs,
        },
      ],
    };

    let script = this.document.getElementById('structured-data');
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'structured-data';
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }
}
