export const environment = {
  auth: {
    enabled: true,
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    knownAuthorities: [],
    scopes: ['openid', 'profile', 'email'],
    mockUser: {
      username: 'local-dev',
      displayName: 'Local Developer',
      password: 'admin123'
    }
  }
};
