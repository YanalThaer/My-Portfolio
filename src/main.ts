import { bootstrapApplication } from '@angular/platform-browser';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Initialize Vercel Speed Insights
injectSpeedInsights();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
