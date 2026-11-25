---
name: ionic-feature
description: Build an Angular 18 + Ionic 8 frontend feature or page in frontend/medical-app-ui (standalone pages, core API service, lazy routes with roleGuard, home-page tiles per role). Use when asked to create a screen, page, list/form/detail view, or wire a backend API into the UI.
---

# Ionic feature page

Reference: `src/app/features/laboratory/` + `src/app/core/services/lab.service.ts`. All paths below are relative to `frontend/medical-app-ui/`.

## 1. API service — `src/app/core/services/<domain>.service.ts`

- `@Injectable({ providedIn: 'root' })`, inject `HttpClient`, base URL from `environment` (see `lab.service.ts` for the exact base).
- Export TS interfaces mirroring the backend DTOs field-for-field (`<Name>Dto`, `Create<Name>Request`, `PageResponse<T>`, `ApiResponse<T>` — reuse existing ones if already exported).
- Methods return `Observable<ApiResponse<...>>`; build query strings with `HttpParams`.
- Don't add error toasts here — `core/interceptors/error.interceptor.ts` handles HTTP errors, `auth.interceptor.ts` adds the JWT.

## 2. Pages — `src/app/features/<feature>/pages/<page-name>/<page-name>.page.ts`

- `standalone: true`; import Ionic components individually from `@ionic/angular/standalone`.
- Register icons with `addIcons({...})` from `ionicons/icons` in the constructor.
- Inline `template` is the norm here (check the feature — `home` uses separate html/scss).
- Header: `<ion-toolbar color="primary">` with `<ion-back-button defaultHref="/<feature>">`.
- Loading state with `<ion-spinner>` (e2e tests wait for spinners to disappear — keep that pattern).
- Lists: `ion-searchbar` → `load()`, `ion-item-sliding` for edit/delete, empty-state item, `ion-fab` for "new".
- Forms: prefer Reactive Forms (`FormBuilder`, `Validators`) per CLAUDE.md; reuse one page for create + edit (`/new` and `/:id/edit`).
- **No arrow functions in templates** (Angular rejects them) — use a TypeScript getter or method.
- Currency shown as `₹`.
- Accessibility: labels on inputs, `aria-label` on icon-only buttons.
- Keep business logic in the service; pages only orchestrate.

## 3. Routes — `src/app/features/<feature>/<feature>.routes.ts`

```ts
import { roleGuard } from '../../core/guards/role.guard';
const FEATURE_ROLES = ['ADMIN', ...];
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/x/x.page').then(m => m.XPage),
    canActivate: [roleGuard], data: { roles: FEATURE_ROLES } },
];
```
`roleGuard` is a plain `CanActivateFn` reading `route.data['roles']` — do **not** call it as a factory. Put static paths (`orders/new`) before param paths (`orders/:id`).

Register in `src/app/app.routes.ts`:
```ts
{ path: '<feature>', loadChildren: () => import('./features/<feature>/<feature>.routes').then(m => m.routes), canActivate: [authGuard] },
```

## 4. Home tiles

`src/app/features/home/home.page.ts` has a tile list per role (ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECH...). Add a tile to every role in `FEATURE_ROLES`, and only those.

## 5. Verify

```bash
cd frontend/medical-app-ui && npx ng build --configuration development
```
Then add e2e coverage with the `playwright-e2e` skill. To see it running: `npx ng serve --port 8100` (needs gateway on 8080).

Commit: `feat(<feature>-ui): add <page> page`
