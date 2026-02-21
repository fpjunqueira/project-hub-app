import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { provideRouter, withRouterConfig } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  provideTranslateService,
  provideTranslateLoader
} from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG
} from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';

import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';
import { localAuthInterceptor } from './auth/local-auth.interceptor';
import { msalConfig, msalGuardConfig, msalInterceptorConfig } from './auth/msal.config';
import { environment } from '../environments/environment';

const msalInstanceFactory = () => new PublicClientApplication(msalConfig);
const msalGuardConfigFactory = () => msalGuardConfig;
const msalInterceptorConfigFactory = () => msalInterceptorConfig;
const msalProviders = environment.auth.enabled
  ? [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: MsalInterceptor,
        multi: true
      },
      MsalGuard,
      MsalBroadcastService
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    provideHttpClient(withInterceptors([localAuthInterceptor]), withInterceptorsFromDi()),
    ...provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    ...provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateLoader(TranslateHttpLoader)
    }),
    importProvidersFrom(TranslateModule),
    provideAppInitializer(async () => {
      const translate = inject(TranslateService);
      const authService = inject(AuthService);
      const stored = localStorage.getItem('projectHub_lang');
      const lang = stored === 'pt' || stored === 'en' ? stored : 'en';
      try {
        await firstValueFrom(translate.use(lang));
      } catch (err) {
        console.warn('Failed to load translations:', err);
      }
      try {
        await authService.initialize();
      } catch {
        /* Allow app to load even when auth init fails (e.g. backend down) */
      }
    }),
    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: msalGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: msalInterceptorConfigFactory
    },
    MsalService,
    ...msalProviders
  ]
};
