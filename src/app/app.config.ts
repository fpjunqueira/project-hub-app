import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
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
    provideAppInitializer(() => inject(AuthService).initialize()),
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
