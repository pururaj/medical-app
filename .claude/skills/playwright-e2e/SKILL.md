---
name: playwright-e2e
description: Write and run Playwright end-to-end tests for the Ionic frontend in frontend/medical-app-ui/e2e, including role-based access checks. Use when asked to add e2e/UI tests, test a page or user flow, check role access, or run/debug the Playwright suite.
---

# Playwright e2e

All paths relative to `frontend/medical-app-ui/`. Config: `playwright.config.ts`. Specs: `e2e/<feature>/<feature>.spec.ts`. Reference: `e2e/laboratory/laboratory.spec.ts`, `e2e/auth/role-access.spec.ts`.

## Auth

Use the helper — don't drive the login form except in `e2e/auth/login.spec.ts`:
```ts
import { TEST_USERS, injectSession } from '../helpers/auth.helper';
await injectSession(page, TEST_USERS['admin']);   // admin | doctor | receptionist | pharmacist | labtech
```
If a new role is introduced, add it to `TEST_USERS` in `e2e/helpers/auth.helper.ts` (test accounts must also exist in auth-service seed data).

## Spec pattern

```ts
test.describe('<Feature> <Page> Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/<route>');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows <X>', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await expect(page.locator('ion-title')).toContainText('<Title>');
  });
});
```

Guidelines:
- Wait for `ion-spinner` to disappear before asserting on data.
- Locate Ionic elements by tag + text: `page.locator('ion-button', { hasText: /new order/i })`. Use case-insensitive regexes for text.
- Navigation: click, then `page.waitForURL('**/<path>')`.
- Cover per page: header renders, data/empty state, primary actions navigate, form validation (submit disabled/errors when required fields empty), successful create shows toast or redirects.
- Role access: for each role NOT in the feature's `data.roles`, `goto` the route and assert redirect/denied; for each allowed role assert the page loads. Add these to `e2e/auth/role-access.spec.ts`.
- Generate unique test data (`Date.now()` suffix) so reruns don't collide; never use realistic patient data.

## Run

Needs frontend on 8100 and gateway + relevant services up.
```bash
cd frontend/medical-app-ui && npx playwright test e2e/<feature>
```
Full suite: `npx playwright test`. Debug: `npx playwright test --headed` or `--ui`; report: `npx playwright show-report`.

Report pass/fail counts honestly; for failures, read the trace/screenshot in `test-results/` and say whether it's a test bug or an app bug before changing anything.

Commit: `test(<feature>-ui): add e2e tests for <page>`
