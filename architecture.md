# Architecture - Project Hub Frontend (Angular)

## 1) System Context

This app is the **user-facing UI** for the Project Hub platform. It integrates with the
Project Hub API for CRUD operations and can call the Security Service for identity and
permissions.

```
Browser
  |
  v
Angular UI
  |----> /api/**  (Project Hub API)
  |
  +----> /security/**  (Security Service)
```

## 2) Application Architecture

- **Shell**: app configuration and providers
- **Routing**: route guards and navigation
- **Domain features**: list / form / view components per domain
- **Services**: HTTP communication with backend APIs
- **Models**: TypeScript interfaces for entity shapes

## 3) Authentication Model (Current Code)

- Uses MSAL redirect login for Azure Entra ID/B2C.
- `MsalInterceptor` attaches access tokens based on request path.
- `authGuard` protects private routes.

## 4) Integration Points

- **Project Hub API**
  - CRUD requests to `/api/**`
  - Dev proxy forwards to `http://localhost:8080`

- **Security Service**
  - Identity and permissions via `/security/**`
  - Protected resource map includes `api://security-service/.default`

## 5) Deployment View

Typical local/dev ports:

- Angular UI: `http://localhost:4200`
- Project Hub API: `http://localhost:8080`
- Security Service: `http://localhost:8081`

## 6) Key Source Files

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/auth/auth.service.ts`
- `src/app/components/*`
