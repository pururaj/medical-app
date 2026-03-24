import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

// ── Pharmacy POS ────────────────────────────────────────────────────────────

test.describe('Pharmacy POS Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/pharmacy');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Pharmacy POS header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Pharmacy POS');
  });

  test('shows medicine search panel', async ({ page }) => {
    await expect(page.locator('ion-searchbar').first()).toBeVisible();
  });

  test('shows cart panel', async ({ page }) => {
    // Cart section shows cart count chip
    await expect(page.locator('.cart-panel, .cart-count').first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows at least one medicine after load', async ({ page }) => {
    // Wait for medicines to load (spinner disappears)
    await page.waitForFunction(
      () => !document.querySelector('.loading-center') || document.querySelectorAll('.medicine-item').length > 0,
      { timeout: 12_000 }
    );
    const items = page.locator('.medicine-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('medicine item shows name and price', async ({ page }) => {
    await page.waitForSelector('.medicine-item', { timeout: 12_000 });
    const first = page.locator('.medicine-item').first();
    await expect(first.locator('.med-name')).toBeVisible();
    await expect(first.locator('.med-price')).toBeVisible();
  });

  test('clicking medicine adds it to cart', async ({ page }) => {
    await page.waitForSelector('.medicine-item', { timeout: 12_000 });
    const initialChip = await page.locator('.cart-count').textContent();

    await page.locator('.medicine-item').first().click();
    await page.waitForTimeout(500);

    // Cart count chip changes (item added) OR cart items list appears
    const cartItem = page.locator('.cart-item, .cart-row').first();
    const chipUpdated = page.locator('.cart-count');
    const hasCartItem = await cartItem.isVisible().catch(() => false);
    const newChipText = await chipUpdated.textContent();
    expect(hasCartItem || newChipText !== initialChip).toBeTruthy();
  });

  test('navigation to Sales History works', async ({ page }) => {
    const historyBtn = page.locator('ion-button', { hasText: /history|sales/i }).first();
    const historyLink = page.locator('[routerlink="/pharmacy/history"], [href*="/pharmacy/history"]').first();
    const btn = (await historyBtn.isVisible().catch(() => false)) ? historyBtn : historyLink;
    await btn.click();
    await page.waitForURL('**/pharmacy/history', { timeout: 8_000 });
    expect(page.url()).toContain('/pharmacy/history');
  });
});

// ── Sales History ───────────────────────────────────────────────────────────

test.describe('Sales History Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/pharmacy/history');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Sales History header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Sales History');
  });

  test('shows summary cards', async ({ page }) => {
    await expect(page.locator('.summary-grid, .summary-card').first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows Today\'s Sales stat', async ({ page }) => {
    await expect(page.locator('.summary-label', { hasText: /today/i }).first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows Today\'s Revenue stat', async ({ page }) => {
    await expect(page.locator('.summary-label', { hasText: /revenue/i }).first()).toBeVisible({ timeout: 8_000 });
  });

  test('sale list loads with items or empty state', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner') || document.querySelectorAll('.sale-amount').length > 0,
      { timeout: 12_000 }
    );
    const sales = await page.locator('.sale-amount').count();
    const empty = await page.locator('.empty-state').isVisible().catch(() => false);
    expect(sales > 0 || empty).toBeTruthy();
  });

  test('back button returns to POS page', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/pharmacy', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/pharmacy($|\/)/);
  });
});

// ── Customer List ───────────────────────────────────────────────────────────

test.describe('Customer List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/pharmacy/customers');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Customers header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/customer/i);
  });

  test('shows FAB add button', async ({ page }) => {
    await expect(page.locator('ion-fab-button')).toBeVisible();
  });

  test('FAB navigates to customer form', async ({ page }) => {
    await page.locator('ion-fab-button').click();
    await page.waitForURL('**/pharmacy/customers/new', { timeout: 8_000 });
    expect(page.url()).toContain('/customers/new');
  });

  test('customer list or empty state is shown', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 10_000 }
    );
    const hasItems = await page.locator('ion-item').count() > 0;
    const hasEmpty = await page.locator('text=/no customer/i').isVisible().catch(() => false);
    expect(hasItems || hasEmpty).toBeTruthy();
  });
});

// ── Customer Form ───────────────────────────────────────────────────────────

test.describe('Customer Form Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/pharmacy/customers/new');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows New Customer header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/customer/i);
  });

  test('shows name input field', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="name"]')).toBeVisible();
  });

  test('shows phone input field', async ({ page }) => {
    await expect(page.locator('ion-input[formcontrolname="phone"]')).toBeVisible();
  });

  test('shows save button', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /save|create|add/i })).toBeVisible();
  });

  test('back button returns to customer list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/pharmacy/customers', { timeout: 8_000 });
    expect(page.url()).toContain('/customers');
  });
});

// ── Returns List ────────────────────────────────────────────────────────────

test.describe('Returns List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/pharmacy/returns');
    await page.waitForSelector('ion-title', { timeout: 10_000 });
  });

  test('shows Returns header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/return/i);
  });

  test('shows FAB or New Return button', async ({ page }) => {
    const fab = page.locator('ion-fab-button');
    const btn = page.locator('ion-button', { hasText: /new|return/i }).first();
    const hasFab = await fab.isVisible().catch(() => false);
    const hasBtn = await btn.isVisible().catch(() => false);
    expect(hasFab || hasBtn).toBeTruthy();
  });

  test('returns list or empty state loads', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('ion-spinner'),
      { timeout: 10_000 }
    );
    const hasItems = await page.locator('ion-item').count() > 0;
    const hasEmpty = await page.locator('.empty-state, text=/no return/i').first().isVisible().catch(() => false);
    expect(hasItems || hasEmpty).toBeTruthy();
  });
});

// ── Role-based pharmacy access ──────────────────────────────────────────────

test.describe('Pharmacy role access', () => {
  test('PHARMACIST can access /pharmacy', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/pharmacy');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/pharmacy');
  });

  test('RECEPTIONIST can access /pharmacy', async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/pharmacy');
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/pharmacy');
  });

  test('DOCTOR cannot access /pharmacy — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/pharmacy');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('LAB_TECH cannot access /pharmacy — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['labtech']);
    await page.goto('/pharmacy');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });
});
