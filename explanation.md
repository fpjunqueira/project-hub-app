# Project Hub Frontend (Angular) - Deep Explanation

## 1) Business Purpose

This Angular app is the user-facing UI for the Project Hub platform. It allows users to
create, view, edit, and delete Projects, Owners, Addresses, and Files, and to navigate
relationships between those entities. It is designed to work with the Spring Boot
`project-hub` backend and the `security-service` for protected APIs.

## 2) High-Level UI Architecture

The app follows a small layered architecture under `src/app`:

- **Application shell**: app-level configuration, providers, and routing.
- **Routing layer**: defines which view is shown for each URL.
- **Domain features**: each domain (projects, owners, addresses, files) has list, form, view,
  service, and model modules.
- **Shared UI**: sidebar/topbar and pagination types.

This keeps navigation, UI state, data access, and model definitions separated.

## 3) Shell and App Configuration

`app.config.ts` wires up all application-wide providers:

- Router configuration with reload on same URL.
- HTTP client with DI interceptors.
- MSAL authentication providers.
- Zoneless change detection to reduce overhead.

This is the main integration point between routing, authentication, and HTTP behavior.

## 4) Routing and Navigation

Routes are defined in `app.routes.ts`:

- `/login` is public and guarded by `loginGuard` to redirect authenticated users.
- All domain routes are protected by `authGuard`.
- Each domain has list, form (new/edit), and view pages.

This creates a predictable UX where every entity follows the same navigation pattern.

## 5) Authentication (Current Code)

The current implementation uses **Azure MSAL redirect login**:

- `AuthService.login()` calls `msalService.loginRedirect()`.
- Auth state is derived from MSAL accounts.
- `authGuard` blocks access when there is no authenticated account.
- MSAL interceptor attaches tokens for protected resources.

Protected resources are configured in `msal.config.ts`:

```ts
protectedResourceMap: new Map<string, Array<string>>([
  ['/api', ['api://project-hub/.default']],
  ['/security', ['api://security-service/.default']]
])
```

This indicates the app expects access tokens for both the Project Hub API and the Security
Service when calling those resource paths.

## 6) Authentication (Documentation Note)

The README describes a username/password login flow with a custom JWT interceptor.
That behavior does **not** exist in the current code. The actual implementation is MSAL-based
with the built-in `MsalInterceptor`. If you want local username/password login, that would
require reintroducing a custom `AuthInterceptor` and a non-MSAL auth service.

## 7) Domain Feature Structure

Each domain (`projects`, `owners`, `addresses`, `files`) follows a consistent pattern:

- **List component**: paginated listing with delete/refresh actions.
- **Form component**: create/edit screens; loads related data where needed.
- **View component**: read-only details.
- **Service**: encapsulates HTTP calls for CRUD and related data.
- **Model**: TypeScript interfaces for entity shapes.

This consistency makes it easy to add new domains by copying the existing structure.

## 8) Data Access Layer

Each service targets REST endpoints that mirror the backend:

- `ProjectService` -> `/api/projects`
- `OwnerService` -> `/api/owners`
- `AddressService` -> `/api/addresses`
- `FileService` -> `/api/files`

Services provide:

- `list` (paginated)
- `listAll`
- `get`
- `create`
- `update`
- `delete`
- Relationship lookups (owners, projects, address, files, etc.)

This layer centralizes HTTP behavior and keeps components focused on UI state.

## 9) Data Flow Example (Projects List)

1. User navigates to `/projects`.
2. `ProjectsListComponent` loads via `ProjectService.list()`.
3. HTTP client calls `/api/projects` (proxied to backend in dev).
4. Response is normalized into a pagination model.
5. UI displays the list and pagination controls.

The same flow applies for owners, addresses, and files.

## 10) Integration with Backend and Security

During development, the app uses `proxy.conf.json` to forward `/api` to the backend:

- Angular dev server: `http://localhost:4200`
- Backend API: `http://localhost:8080`

MSAL attaches tokens to API and security-service requests via the interceptor and the
protected resource map.

## 11) Integration With the Other Projects

The UI sits on top of both backend services:

- **Project Hub API**: all CRUD operations go through `/api/**` (Projects, Owners, Addresses,
  Files). This is the main integration for day-to-day business functionality.
- **Security Service**: the UI can call `/security/me` and `/security/permissions` to view
  identity and permission details. MSAL config includes `/security` as a protected resource.

End-to-end request path (current code intent):

1. User logs in via MSAL redirect and receives an access token.
2. `MsalInterceptor` attaches the correct token based on the request path.
3. The UI calls Project Hub for CRUD and Security Service for identity/permissions.

If you want the UI to use the backend's `/api/auth/login` flow instead of MSAL, the app
needs a custom auth service and interceptor to match the backend JWT contract.

## 12) Key Source References

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/auth/auth.service.ts`
- `src/app/auth/msal.config.ts`
- `src/app/auth/auth.guard.ts`
- `src/app/components/*` (domain features)
- `proxy.conf.json`
