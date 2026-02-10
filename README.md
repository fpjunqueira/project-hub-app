# project-hub-app
Project Hub Frontend Angular App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.0.

## Architecture overview

The frontend is organized as a small, layered Angular app that keeps routing, UI
composition, domain logic, and HTTP access separated. The main layers live under
`src/app` and are designed to make each responsibility easy to find.

### 1) Application shell (bootstrap + app-level providers)

**Responsibility:** initialize global providers and render the root router outlet.

- `src/app/app.config.ts` wires the router and HTTP client.
- `src/app/app.ts` hosts the root component and the `RouterOutlet`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

### 2) Routing layer

**Responsibility:** map URLs to the top-level feature views.

- `src/app/app.routes.ts` redirects `/` to `/login` and defines guarded routes
  for list, view, and form screens for each domain.

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'projects', component: ProjectsListComponent, canActivate: [authGuard] }
];
```

### 3) Domain presentation + state (list + view + form components)

**Responsibility:** own UI state, bind forms, and call services for data.

Each domain has standalone list, view, and form components that hold view
state and use a service to load/save data. Example:
`src/app/components/projects/list/projects-list.component.ts`

```ts
projects: Project[] = [];
isLoading = false;
error = '';

refresh(): void {
  this.projectService.list().subscribe({
    next: (projects) => (this.projects = projects),
    error: () => (this.error = 'Failed to load projects.')
  });
}
```

### 4) Data access layer (services)

**Responsibility:** encapsulate HTTP calls to the backend API.

Services live alongside their domain and expose a small CRUD surface. Example:
`src/app/components/projects/service/project.service.ts`

```ts
private baseUrl = '/api/projects';

list() {
  return this.http.get<Project[]>(this.baseUrl);
}
```

### 5) Domain model layer (domain types)

**Responsibility:** define shared entity shapes for compile-time safety.

Each domain defines its own interface in a `model` folder, for example:
`src/app/components/projects/model/project.model.ts`.

```ts
export interface Project {
  id?: number;
  projectName: string;
}
```

## Configuration and access

- **Backend URL:** the app expects the API at `http://localhost:8080` and uses
  `proxy.conf.json` to forward `/api` requests during development.
- **Login endpoint:** `POST /api/auth/login` (see the Spring Security backend).
- **Authorization:** the JWT token is stored in local storage and sent as
  `Authorization: Bearer <token>` for all API calls.

### Development server

To start a local development server, run:

```bash
ng serve
```

If you want the proxy enabled explicitly, use:

```bash
ng serve --proxy-config proxy.conf.json
```

Once the server is running, open your browser and navigate to
`http://localhost:4200/`. The application will automatically reload whenever
you modify any of the source files.

### Accessing the app

1. Start the backend (`project-hub` Java service) on port `8080`.
2. Start the Angular dev server on port `4200`.
3. Navigate to `http://localhost:4200/` and log in with a valid backend user.

## DEV Mode: Running Without Security-Service

The Angular app supports a **development profile** that allows you to run and test locally without the security-service. This is the default when using `ng serve`.

### How DEV Mode Is Selected

`angular.json` uses the **development** configuration by default for `ng serve`:

```json
"serve": {
  "configurations": {
    "development": { "buildTarget": "project-hub:build:development" }
  },
  "defaultConfiguration": "development"
}
```

The development build uses `fileReplacements` to swap `environment.ts` with `environment.development.ts`, which sets `auth.enabled: false`.

### Environment Configuration

`src/environments/environment.development.ts`:

```ts
export const environment = {
  auth: {
    enabled: false,
    mockUser: {
      username: 'admin',
      displayName: 'Local Admin',
      password: 'admin123'
    }
  }
};
```

### Auth Flow When `auth.enabled: false`

1. MSAL providers are not registered; the app uses local auth instead.
2. `AuthService.initializeLocal()` calls `loginLocal()`, which POSTs credentials to `/api/auth/login`.
3. The project-hub-service (not security-service) handles this endpoint and returns a JWT.
4. `localAuthInterceptor` attaches the JWT as `Authorization: Bearer <token>` to all `/api` requests.
5. The MSAL protected resource map is empty, so no `/security` calls are made.

### Proxy Configuration

`proxy.conf.json` forwards `/api` to project-hub-service on port 8080:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

There is no proxy for `/security` — the security-service is not involved in DEV mode.

### What You Need to Run

| Component | Required in DEV? | Role |
|-----------|------------------|------|
| Angular app (`ng serve` / `npm start`) | ✅ Yes | UI at `http://localhost:4200` |
| project-hub-service (port 8080) | ✅ Yes | Provides `/api/auth/login` and CRUD APIs |
| security-service (port 8081) | ❌ No | Only used when `auth.enabled: true` (MSAL) |

### Steps to Run in DEV Mode

1. Start project-hub-service:
   ```bash
   cd path/to/project-hub-service
   ./mvnw spring-boot:run
   ```
2. Start the Angular dev server:
   ```bash
   ng serve
   ```
3. Open `http://localhost:4200` and log in with `admin` / `admin123`.

---

## MSAL and Authentication Across the Services

This section explains how Microsoft Authentication Library (MSAL) is used in the ecosystem and how authentication is implemented across the Angular app, project-hub-service, and security-service.

### What Is MSAL?

MSAL (Microsoft Authentication Library) is a **client-side authentication SDK** from Microsoft that obtains tokens from Azure Entra ID (formerly Azure AD) and Azure AD B2C. It implements OAuth 2.0 and OpenID Connect flows and manages token acquisition, caching, and renewal for SPAs, mobile, desktop, and server-side applications.

MSAL is not a protocol — it is a library that **implements** OAuth2/OIDC and exposes APIs for signing users in and calling protected resources.

### Two Authentication Modes in the Angular App

The Angular app supports two distinct authentication modes, controlled by `environment.auth.enabled`:

| Mode | `auth.enabled` | Login flow | Token source | Backend |
|------|----------------|------------|--------------|---------|
| **DEV / Local** | `false` | Username + password | project-hub JWT | project-hub-service only |
| **Production / MSAL** | `true` | Azure Entra ID redirect | IdP access tokens | project-hub + security-service |

### Angular App Implementation

**1. Environment and configuration**

- `environment.development.ts`: `auth.enabled: false` → local JWT flow.
- `environment.ts`: `auth.enabled: true` → MSAL flow (for production builds).

**2. Auth service (`src/app/auth/auth.service.ts`)**

- When `auth.enabled: false`: calls `loginLocal()` → `POST /api/auth/login` → stores project-hub JWT in localStorage.
- When `auth.enabled: true`: uses MSAL redirect login, stores accounts in MSAL cache, and derives auth state from MSAL.

**3. MSAL configuration (`src/app/auth/msal.config.ts`)**

- `msalConfig`: clientId, authority, redirect URIs, scopes.
- `msalGuardConfig`: interaction type (redirect) and scopes for the login request.
- `msalInterceptorConfig`: protected resource map — when `auth.enabled` is true:
  - `/api` → `api://project-hub/.default`
  - `/security` → `api://security-service/.default`

**4. Interceptors**

- `MsalInterceptor` (when `auth.enabled: true`): attaches MSAL access tokens to `/api` and `/security` requests based on the protected resource map.
- `localAuthInterceptor`: when `auth.enabled: false`, attaches the project-hub JWT to `/api` requests.

**5. App config (`src/app/app.config.ts`)**

- Registers MSAL instance and config for all builds.
- Registers `MsalInterceptor`, `MsalGuard`, and `MsalBroadcastService` only when `auth.enabled: true`.

### Security-Service Implementation

The security-service is an **OAuth2 Resource Server**. It does not use MSAL; it validates JWT access tokens issued by the Identity Provider (Azure Entra ID/B2C).

**1. Configuration**

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://login.microsoftonline.com/{tenant}/v2.0
          audiences: api://security-service
```

**2. Flow**

1. User signs in via MSAL in the Angular app.
2. MSAL obtains an access token for `api://security-service` from the IdP.
3. Angular calls `/security/me` or `/security/permissions` with `Authorization: Bearer <token>`.
4. Spring Security validates the JWT (signature, issuer, audience) via JWKS.
5. `JwtAuthoritiesConverter` maps IdP claims (roles, groups, scopes) to Spring authorities.
6. `PermissionService` maps roles to application permissions.
7. The controller returns identity or permission data.

**3. Endpoints**

- `GET /me` — identity and claims.
- `GET /permissions` — resolved permissions from roles and claims.

### Project-Hub-Service Implementation

The project-hub-service uses a **custom JWT flow** for local/DEV usage. It does not validate Azure Entra ID tokens.

**1. Custom JWT flow (used in DEV mode)**

- `AuthController`: `POST /api/auth/login` accepts username and password.
- `AuthService`: authenticates against `UserDetailsService`, issues a JWT via `JwtService`.
- `JwtService`: signs JWTs with an HS256 secret from configuration.
- `JwtAuthenticationFilter`: validates the Bearer token on each request and populates `SecurityContext`.

**2. Token validation**

- Uses symmetric secret (`app.jwt.secret`) to decode and validate JWTs.
- No IdP or JWKS integration; only tokens issued by itself are accepted.

**3. Intended production flow (MSAL)**

When `auth.enabled: true`, the Angular app obtains Entra tokens and sends them to `/api`. To fully support MSAL in production, the project-hub-service would need to be extended as an OAuth2 Resource Server (validating Entra tokens via issuer/JWKS), in addition to or instead of the custom JWT flow.

### End-to-End MSAL Flow (Production)

```
User
  |
  | 1. Click Sign in
  v
Angular UI (MSAL)
  |
  | 2. Redirect to Azure Entra ID
  v
Identity Provider (Azure Entra ID / B2C)
  |
  | 3. User authenticates, IdP returns tokens
  v
Angular UI
  |
  | 4. MsalInterceptor attaches access tokens
  +-----> /api/**     (Bearer token for api://project-hub)
  |
  +-----> /security/** (Bearer token for api://security-service)
         v
         Security Service (validates JWT via issuer/JWKS)
         returns /me, /permissions
```

### Summary

| Component | Auth role | MSAL? | Token validation |
|-----------|-----------|-------|------------------|
| **Angular** | Obtains tokens; attaches to requests | Yes (when `auth.enabled: true`) | N/A (client) |
| **security-service** | OAuth2 Resource Server | No | Validates IdP JWTs (issuer, audience, JWKS) |
| **project-hub-service** | Auth provider + resource server | No | Custom JWT (HS256) in DEV; production may validate Entra tokens |

---

## Security implementation (frontend)

The frontend supports two auth models:

- **DEV mode** (`auth.enabled: false`): `AuthService` uses `loginLocal()` and calls `/api/auth/login`, persists the JWT, and exposes `isAuthenticated()`. `localAuthInterceptor` injects the token on `/api` requests.
- **MSAL mode** (`auth.enabled: true`): MSAL handles sign-in; `MsalInterceptor` attaches access tokens to protected resources.
- **Route guards:** `src/app/auth/auth.guard.ts` protects private routes and redirects to `/login` when unauthenticated.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
