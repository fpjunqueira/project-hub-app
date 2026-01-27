import {
  BrowserCacheLocation,
  Configuration,
  InteractionType
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    knownAuthorities: []
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false
  }
};

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: ['openid', 'profile', 'email']
  }
};

export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, Array<string>>([
    ['/api', ['api://project-hub/.default']],
    ['/security', ['api://security-service/.default']]
  ])
};
