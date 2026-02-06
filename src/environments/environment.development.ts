export const environment = {
  auth: {
    enabled: false,
    clientId: 'local-dev',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    knownAuthorities: [],
    scopes: ['openid', 'profile', 'email'],
    mockUser: {
      username: 'admin',
      displayName: 'Local Admin',
      password: 'admin123'
    }
  }
};
