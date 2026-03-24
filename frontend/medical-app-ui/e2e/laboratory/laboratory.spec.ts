import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

// ── Lab Dashboard ───────────────────────────────────────────────────────────

test.describe('Lab Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Laboratory header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Laboratory');
  });

  test('shows stat cards', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 12_000 }
    );
    await expect(page.locator('ion-card').first()).toBeVisible();
  });

  test('shows Today\'s Orders stat', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await expect(page.locator('.stat-label', { hasText: /today.*order|order.*today/i }).first()).toBeVisible();
  });

  test('shows Pending Samples stat', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await expect(page.locator('.stat-label', { hasText: /pending/i }).first()).toBeVisible();
  });

  test('shows Completed Today stat', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await expect(page.locator('.stat-label', { hasText: /completed/i }).first()).toBeVisible();
  });

  test('New Order button navigates to /lab/orders/new', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await page.locator('ion-button', { hasText: /new order/i }).click();
    await page.waitForURL('**/lab/orders/new', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/orders/new');
  });

  test('All Orders button navigates to /lab/orders', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await page.locator('ion-button', { hasText: /all orders/i }).click();
    await page.waitForURL('**/lab/orders', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/orders');
  });

  test('Test Catalogue button navigates to /lab/catalogue', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 12_000 });
    await page.locator('ion-button', { hasText: /catalogue/i }).click();
    await page.waitForURL('**/lab/catalogue', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/catalogue');
  });
});

// ── Order List ──────────────────────────────────────────────────────────────

test.describe('Lab Order List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab/orders');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Lab Orders header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Lab Orders');
  });

  test('shows status filter', async ({ page }) => {
    await expect(page.locator('ion-select').first()).toBeVisible();
  });

  test('shows FAB add button', async ({ page }) => {
    await expect(page.locator('ion-fab-button')).toBeVisible();
  });

  test('FAB navigates to create order page', async ({ page }) => {
    await page.locator('ion-fab-button').click();
    await page.waitForURL('**/lab/orders/new', { timeout: 8_000 });
    expect(page.url()).toContain('/orders/new');
  });

  test('shows at least one order or empty message', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 12_000 }
    );
    const items = await page.locator('ion-item').count();
    expect(items).toBeGreaterThan(0); // Seed data has 2 orders
  });

  test('order item shows order number and patient name', async ({ page }) => {
    await page.waitForSelector('ion-item', { timeout: 10_000 });
    const first = page.locator('ion-item').first();
    await expect(first.locator('ion-label')).toBeVisible();
  });

  test('clicking order navigates to order detail', async ({ page }) => {
    await page.waitForSelector('ion-item', { timeout: 10_000 });
    await page.locator('ion-item').first().click();
    await page.waitForURL(/\/lab\/orders\/\d+/, { timeout: 8_000 });
    expect(page.url()).toMatch(/\/lab\/orders\/\d+/);
  });
});

// ── Create Order ────────────────────────────────────────────────────────────

test.describe('Create Lab Order Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab/orders/new');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows New Lab Order header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('New Lab Order');
  });

  test('shows Patient Info card', async ({ page }) => {
    await expect(page.locator('ion-card-title', { hasText: /patient info/i }).first()).toBeVisible();
  });

  test('shows Select Tests card', async ({ page }) => {
    await expect(page.locator('ion-card-title', { hasText: /select tests/i }).first()).toBeVisible();
  });

  test('shows patient name input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="patientName"]')).toBeVisible();
  });

  test('shows test search bar', async ({ page }) => {
    await expect(page.locator('ion-searchbar').first()).toBeVisible();
  });

  test('loads catalogue tests with checkboxes', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 12_000 }
    );
    await expect(page.locator('ion-checkbox').first()).toBeVisible({ timeout: 10_000 });
  });

  test('Create Order button is initially disabled (no patient name or tests)', async ({ page }) => {
    const btn = page.locator('ion-button', { hasText: /create order/i });
    await expect(btn).toBeDisabled();
  });

  test('back button returns to order list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/lab/orders', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/orders');
  });
});

// ── Order Detail ────────────────────────────────────────────────────────────

test.describe('Lab Order Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab/orders/1');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Order Detail header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Order Detail');
  });

  test('shows order number', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 10_000 });
    await expect(page.locator('text=/LAB-/').first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows patient name', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 10_000 });
    const card = page.locator('ion-card-content').first();
    await expect(card).toBeVisible();
  });

  test('shows Tests section', async ({ page }) => {
    await page.waitForFunction(() => !document.querySelector('ion-spinner'), { timeout: 10_000 });
    await expect(page.locator('ion-card-title', { hasText: /tests/i }).first()).toBeVisible();
  });

  test('back button returns to order list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/lab/orders', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/orders');
  });
});

// ── Test Catalogue List ─────────────────────────────────────────────────────

test.describe('Test Catalogue Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab/catalogue');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Test Catalogue header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Test Catalogue');
  });

  test('shows search bar', async ({ page }) => {
    await expect(page.locator('ion-searchbar').first()).toBeVisible();
  });

  test('shows FAB add button', async ({ page }) => {
    await expect(page.locator('ion-fab-button')).toBeVisible();
  });

  test('shows seeded catalogue tests', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 12_000 }
    );
    const items = page.locator('ion-item');
    await expect(items.first()).toBeVisible({ timeout: 8_000 });
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('FAB navigates to catalogue form', async ({ page }) => {
    await page.locator('ion-fab-button').click();
    await page.waitForURL('**/lab/catalogue/new', { timeout: 8_000 });
    expect(page.url()).toContain('/catalogue/new');
  });

  test('back button returns to lab dashboard', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/lab', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/lab($|\/)/);
  });
});

// ── Catalogue Form ──────────────────────────────────────────────────────────

test.describe('Catalogue Form — Add new test', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab/catalogue/new');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows New Test header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/new test|test/i);
  });

  test('shows test code input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="testCode"]')).toBeVisible();
  });

  test('shows test name input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="testName"]')).toBeVisible();
  });

  test('shows sample type select', async ({ page }) => {
    await expect(page.locator('ion-select[formcontrolname="sampleType"]')).toBeVisible();
  });

  test('shows price input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="price"]')).toBeVisible();
  });

  test('shows Create Test button', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /create test/i })).toBeVisible();
  });

  test('Create Test button is initially disabled', async ({ page }) => {
    const btn = page.locator('ion-button', { hasText: /create test/i });
    await expect(btn).toBeDisabled();
  });

  test('back button returns to catalogue list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/lab/catalogue', { timeout: 8_000 });
    expect(page.url()).toContain('/lab/catalogue');
  });
});

// ── Role-based laboratory access ────────────────────────────────────────────

test.describe('Laboratory role access', () => {
  test('ADMIN can access /lab', async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/lab');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/lab');
  });

  test('LAB_TECH can access /lab', async ({ page }) => {
    await injectSession(page, TEST_USERS['labtech']);
    await page.goto('/lab');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/lab');
  });

  test('DOCTOR can access /lab', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/lab');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/lab');
  });

  test('RECEPTIONIST can access /lab', async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/lab');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/lab');
  });

  test('PHARMACIST cannot access /lab — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/lab');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });
});
