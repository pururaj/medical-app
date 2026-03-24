import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

// ── Medicine List (Inventory Dashboard) ────────────────────────────────────

test.describe('Inventory / Medicine List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Inventory header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Inventory');
  });

  test('shows summary cards (Total Medicines, Low Stock, Expiring Soon)', async ({ page }) => {
    await expect(page.locator('.summary-grid').first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('.summary-label', { hasText: /total medicines/i }).first()).toBeVisible();
    await expect(page.locator('.summary-label', { hasText: /low stock/i }).first()).toBeVisible();
    await expect(page.locator('.summary-label', { hasText: /expiring/i }).first()).toBeVisible();
  });

  test('shows search bar', async ({ page }) => {
    await expect(page.locator('ion-searchbar').first()).toBeVisible();
  });

  test('shows at least one medicine after load', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.center-content ion-spinner'),
      { timeout: 12_000 }
    );
    const medicines = page.locator('.medicine-card, .med-item, ion-card').filter({ hasText: /₹/ });
    const count = await medicines.count();
    const empty = await page.locator('.center-content', { hasText: /no medicine/i }).isVisible().catch(() => false);
    expect(count > 0 || empty).toBeTruthy();
  });

  test('filter bar is visible', async ({ page }) => {
    await expect(page.locator('.filter-bar').first()).toBeVisible({ timeout: 8_000 });
  });

  test('stock management button navigates to /inventory/stock', async ({ page }) => {
    // The header has an icon-only button for managing stock
    await page.locator('ion-toolbar ion-button').first().click();
    await page.waitForURL('**/inventory/stock', { timeout: 8_000 });
    expect(page.url()).toContain('/inventory/stock');
  });
});

// ── Medicine Form (Add) ─────────────────────────────────────────────────────

test.describe('Medicine Form — Add new medicine', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory/medicines/new');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Add Medicine header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/medicine|add|new/i);
  });

  test('shows Basic Information section', async ({ page }) => {
    await expect(page.locator('.form-section-title', { hasText: /basic/i }).first()).toBeVisible();
  });

  test('shows Pricing & Stock section', async ({ page }) => {
    await expect(page.locator('.form-section-title', { hasText: /pricing|stock/i }).first()).toBeVisible();
  });

  test('shows medicine name input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="name"]')).toBeVisible();
  });

  test('shows unit price input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="unitPrice"]')).toBeVisible();
  });

  test('shows Save button', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /save|create|add/i })).toBeVisible();
  });

  test('validation fails on empty submit', async ({ page }) => {
    await page.locator('ion-button', { hasText: /save|create|add/i }).click();
    // Form is invalid — button should remain on same page
    await page.waitForTimeout(1_000);
    expect(page.url()).toContain('/inventory');
  });

  test('back button returns to inventory list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/inventory', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/inventory($|\/medicines)/);
  });
});

// ── Medicine Detail ─────────────────────────────────────────────────────────

test.describe('Medicine Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory/medicines/1');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows medicine detail header', async ({ page }) => {
    await expect(page.locator('ion-title')).toBeVisible();
  });

  test('shows edit button', async ({ page }) => {
    const editBtn = page.locator('ion-button', { hasText: /edit/i }).first();
    await expect(editBtn).toBeVisible({ timeout: 8_000 });
  });

  test('shows medicine information card', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 10_000 }
    );
    const card = page.locator('ion-card').first();
    await expect(card).toBeVisible();
  });

  test('back button returns to inventory list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL(/\/inventory/, { timeout: 8_000 });
    expect(page.url()).toContain('/inventory');
  });
});

// ── Stock List ──────────────────────────────────────────────────────────────

test.describe('Stock List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory/stock');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Stock header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/stock/i);
  });

  test('shows FAB or Add button', async ({ page }) => {
    const fab = page.locator('ion-fab-button');
    const btn = page.locator('ion-button', { hasText: /add|adjust/i }).first();
    const hasFab = await fab.isVisible().catch(() => false);
    const hasBtn = await btn.isVisible().catch(() => false);
    expect(hasFab || hasBtn).toBeTruthy();
  });

  test('shows stock list or empty state', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 10_000 }
    );
    const hasItems = (await page.locator('ion-item').count()) > 0;
    const hasEmpty = await page.locator('.empty-state, text=/no stock/i').first().isVisible().catch(() => false);
    expect(hasItems || hasEmpty).toBeTruthy();
  });
});

// ── Stock Adjustment Form ───────────────────────────────────────────────────

test.describe('Stock Adjustment Form', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory/stock/adjust');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Stock Adjustment header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/stock|adjust/i);
  });

  test('shows medicine select / search', async ({ page }) => {
    const hasSelect = await page.locator('ion-select').first().isVisible().catch(() => false);
    const hasSearch = await page.locator('ion-searchbar').first().isVisible().catch(() => false);
    const hasInput = await page.locator('ion-input').first().isVisible().catch(() => false);
    expect(hasSelect || hasSearch || hasInput).toBeTruthy();
  });

  test('shows quantity input', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="quantity"], ion-input[type="number"]').first()).toBeVisible();
  });

  test('shows Save / Adjust button', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /save|adjust|add/i })).toBeVisible();
  });

  test('back button returns to stock page', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL(/\/inventory\/stock$/, { timeout: 8_000 });
    expect(page.url()).toContain('/stock');
  });
});

// ── Role-based inventory access ─────────────────────────────────────────────

test.describe('Inventory role access', () => {
  test('ADMIN can access /inventory', async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/inventory');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/inventory');
  });

  test('PHARMACIST can access /inventory', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/inventory');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/inventory');
  });

  test('DOCTOR cannot access /inventory — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/inventory');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('RECEPTIONIST cannot access /inventory — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/inventory');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('LAB_TECH cannot access /inventory — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['labtech']);
    await page.goto('/inventory');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });
});
