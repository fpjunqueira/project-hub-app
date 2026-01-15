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

**Responsibility:** map URLs to the top-level feature view(s).

- `src/app/app.routes.ts` redirects `/` to the domain hub.
- The hub route renders the `DomainHubComponent`.

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'domains' },
  { path: 'domains', component: DomainHubComponent }
];
```

### 3) Feature composition (domain hub)

**Responsibility:** compose the main domain CRUD panels on a single page.

- `src/app/domains/domain-hub/domain-hub.component.ts` imports each domain
  section as a standalone component.
- `src/app/domains/domain-hub/domain-hub.component.html` lays out the grid.

```html
<section class="grid">
  <app-projects-crud />
  <app-owners-crud />
  <app-addresses-crud />
  <app-files-crud />
</section>
```

### 4) Domain presentation + state (CRUD components)

**Responsibility:** own UI state, bind forms, and call services for data.

Each domain has a CRUD component that holds view state and uses a service
to load/save data. Example: `src/app/domains/projects/projects-crud.component.ts`

```ts
projects: Project[] = [];
draft: Project = { projectName: '' };
editDraft: Project = { projectName: '' };

refresh(): void {
  this.projectService.list().subscribe({
    next: (projects) => (this.projects = projects),
    error: () => (this.error = 'Failed to load projects.')
  });
}
```

### 5) Data access layer (services)

**Responsibility:** encapsulate HTTP calls to the backend API.

Services live alongside their domain and expose a small CRUD surface. Example:
`src/app/domains/projects/project.service.ts`

```ts
private baseUrl = '/api/projects';

list() {
  return this.http.get<Project[]>(this.baseUrl);
}
```

### 6) Domain model layer (shared types)

**Responsibility:** define shared entity shapes for compile-time safety.

All domain interfaces are centralized in `src/app/domains/shared/models.ts`.

```ts
export interface Project {
  id?: number;
  projectName: string;
}
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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
