import { Component, inject, input } from '@angular/core';
import { I18n } from '../core/i18n';

export type SkeletonPage = 'home' | 'work' | 'resume' | 'projects' | 'project' | 'contact';

@Component({
  selector: 'app-page-skeleton',
  template: `
    @switch (page()) {
      @case ('home') {
        <section class="home active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <div class="home-detail">
            <span class="sk sk-h1"></span>
            <span class="sk sk-tag"></span>
            <span class="sk sk-h2"></span>
            <span class="sk sk-text"></span>
            <span class="sk sk-text sk-w70"></span>
            <div class="home-skills">
              @for (item of chips; track item) {
                <span class="sk sk-chip"></span>
              }
            </div>
            <div class="btn-sci">
              <span class="sk sk-btn"></span>
              <span class="sk sk-btn"></span>
              <span class="sk sk-link"></span>
              <div class="sci">
                @for (item of cards3; track item) {
                  <span class="sk sk-sci"></span>
                }
              </div>
            </div>
          </div>
          <div class="home-img">
            <div class="img-box">
              <div class="img-item sk-photo"></div>
            </div>
          </div>
        </section>
      }
      @case ('work') {
        <section class="service active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <span class="sk sk-heading"></span>
          <div class="services-container">
            @for (item of cards3; track item) {
              <article class="services-box">
                <span class="sk sk-icon"></span>
                <span class="sk sk-line sk-w60"></span>
                <span class="sk sk-text"></span>
                <span class="sk sk-text sk-w80"></span>
              </article>
            }
          </div>
        </section>
      }
      @case ('resume') {
        <section class="resume active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <div class="resume-container">
            <div class="resume-box">
              <div class="resume-tabs">
                @for (item of cards4; track item) {
                  <span class="sk sk-tab"></span>
                }
              </div>
              <span class="sk sk-tab sk-cv"></span>
            </div>
            <div class="resume-box">
              <span class="sk sk-heading-start"></span>
              <div class="resume-list">
                @for (item of cards3; track item) {
                  <article class="resume-item">
                    <span class="sk sk-line sk-w30"></span>
                    <span class="sk sk-line sk-w70"></span>
                    <span class="sk sk-text"></span>
                    <span class="sk sk-text sk-w80"></span>
                  </article>
                }
              </div>
            </div>
          </div>
        </section>
      }
      @case ('projects') {
        <section class="portfolio active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <span class="sk sk-heading"></span>
          <div class="project-filters">
            @for (item of chips; track item) {
              <span class="sk sk-chip"></span>
            }
          </div>
          <div class="portfolio-container">
            @for (item of cards4; track item) {
              <article class="portfolio-box">
                <div class="project-media sk-media"></div>
                <div class="portfolio-detail">
                  <span class="sk sk-line sk-w50"></span>
                  <span class="sk sk-text"></span>
                  <span class="sk sk-text sk-w80"></span>
                  <div class="sk-chip-row">
                    <span class="sk sk-chip"></span>
                    <span class="sk sk-chip"></span>
                    <span class="sk sk-chip"></span>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      }
      @case ('project') {
        <section class="project-page active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <span class="sk sk-line sk-w30 sk-back"></span>
          <div class="project-hero">
            <div class="project-hero-copy">
              <span class="sk sk-line sk-w40"></span>
              <span class="sk sk-heading-start"></span>
              <span class="sk sk-text"></span>
              <span class="sk sk-text sk-w80"></span>
              <div class="sk-chip-row">
                <span class="sk sk-chip"></span>
                <span class="sk sk-chip"></span>
                <span class="sk sk-chip"></span>
              </div>
              <div class="btn-sci">
                <span class="sk sk-btn"></span>
                <span class="sk sk-btn"></span>
              </div>
            </div>
            <div class="project-media sk-media"></div>
          </div>
        </section>
      }
      @case ('contact') {
        <section class="contact active sk-page" aria-busy="true">
          <span class="sr-only">{{ i18n.t().loading }}</span>
          <div class="contact-container">
            <div class="contact-box">
              <span class="sk sk-heading-start"></span>
              <span class="sk sk-text"></span>
              <span class="sk sk-text sk-w70"></span>
              @for (item of cards3; track item) {
                <div class="contact-detail">
                  <span class="sk sk-icon"></span>
                  <div class="sk-detail">
                    <span class="sk sk-line sk-w40"></span>
                    <span class="sk sk-line sk-w70"></span>
                  </div>
                </div>
              }
            </div>
            <div class="contact-box">
              <span class="sk sk-heading"></span>
              <div class="field-box sk-fields">
                <span class="sk sk-field"></span>
                <span class="sk sk-field"></span>
                <span class="sk sk-field sk-field-wide"></span>
                <span class="sk sk-area"></span>
              </div>
              <span class="sk sk-btn"></span>
            </div>
          </div>
        </section>
      }
    }
  `,
})
export class PageSkeleton {
  readonly page = input.required<SkeletonPage>();
  protected readonly i18n = inject(I18n);
  protected readonly chips = [1, 2, 3, 4, 5];
  protected readonly cards3 = [1, 2, 3];
  protected readonly cards4 = [1, 2, 3, 4];
}
