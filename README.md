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

## Security implementation (frontend)

The frontend mirrors the backend security model by authenticating with the
login endpoint and attaching the JWT to every API request.

- **Auth service:** `src/app/auth/auth.service.ts` calls `/api/auth/login`,
  persists the token and expiry, and exposes `isAuthenticated()`.
- **Route guards:** `src/app/auth/auth.guard.ts` protects private routes and
  redirects to `/login` when the session is missing or expired.
- **HTTP interceptor:** `src/app/auth/auth.interceptor.ts` injects the
  `Authorization` header and logs out on `401` responses.

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
