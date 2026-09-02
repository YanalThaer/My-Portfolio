import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, switchMap, shareReplay } from 'rxjs';
import { I18n } from './i18n';
import { PortfolioData } from './portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class Portfolio {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18n);
  private readonly data$ = toObservable(this.i18n.lang).pipe(
    switchMap((lang) =>
      this.http.get<PortfolioData>(lang === 'ar' ? 'data/portfolio.ar.json' : 'data/portfolio.json'),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getData(): Observable<PortfolioData> {
    return this.data$;
  }
}
