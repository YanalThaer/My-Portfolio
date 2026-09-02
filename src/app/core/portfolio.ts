import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { PortfolioData } from './portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class Portfolio {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<PortfolioData>('data/portfolio.json')
    .pipe(shareReplay(1));

  getData(): Observable<PortfolioData> {
    return this.data$;
  }
}
