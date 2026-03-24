import { test, expect } from '@playwright/test';
import { TEST_USERS, clearSession } from '../helpers/auth.helper';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await page.goto('/login');
    await page.waitForSelector('ion-card', { timeout: 8_000 });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('shows the MedApp branding and login form', async ({ page }) => {
    await expect(page.locator('.app-name')).toHaveText('MedApp');
    await expect(page.locator('.app-tagline')).toBeVisible();
    await expect(page.locator('ion-card-title')).toHaveText('Sign In');
    await expect(page.locator('ion-input[formcontrolname="username"]')).toBeVisible();
    await expect(page.locator('ion-input[formcontrolname="password"]')).toBeVisible();
    await expect(page.locator('ion-button[type="submit"]')).toBeVisible();
  });

  test('shows test-account hint text', async ({ page }) => {
    await expect(page.locator('.test-hint')).toContainText('admin/admin123');
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.locator('ion-button[type="submit"]').click();
    await expect(page.locator('ion-text[color="danger"]').first()).toBeVisible();
  });

  test('shows password validation error when only username filled', async ({ page }) => {
    await page.locator('ion-input[formcontrolname="username"] input').fill('admin');
    await page.locator('ion-button[type="submit"]').click();
    const errors = page.locator('ion-text[color="danger"]');
    await expect(errors).toHaveCount(1);
    await expect(errors.first()).toContainText('Password');
  });

  // ── Authentication ─────────────────────────────────────────────────────────

  test('admin can log in and is redirected to /home', async ({ page }) => {
    const user = TEST_USERS['admin'];
    await page.locator('ion-input[formcontrolname="username"] input').fill(user.username);
    await page.locator('ion-input[formcontrolname="password"] input').fill(user.password);
    await page.locator('ion-button[type="submit"]').click();
    await page.waitForURL('**/home', { timeout: 12_000 });
    expect(page.url()).toContain('/home');
  });

  test('doctor can log in successfully', async ({ page }) => {
    const user = TEST_USERS['doctor'];
    await page.locator('ion-input[formcontrolname="username"] input').fill(user.username);
    await page.locator('ion-input[formcontrolname="password"] input').fill(user.password);
    await page.locator('ion-button[type="submit"]').click();
    await page.waitForURL('**/home', { timeout: 12_000 });
    expect(page.url()).toContain('/home');
  });

  test('receptionist can log in successfully', async ({ page }) => {
    const user = TEST_USERS['receptionist'];
    await page.locator('ion-input[formcontrolname="username"] input').fill(user.username);
    await page.locator('ion-input[formcontrolname="password"] input').fill(user.password);
    await page.locator('ion-button[type="submit"]').click();
    await page.waitForURL('**/home', { timeout: 12_000 });
    expect(page.url()).toContain('/home');
  });

  test('shows error toast on wrong password', async ({ page }) => {
    await page.locator('ion-input[formcontrolname="username"] input').fill('admin');
    await page.locator('ion-input[formcontrolname="password"] input').fill('wrongpassword');
    await page.locator('ion-button[type="submit"]').click();
    await expect(page.locator('ion-toast').first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('ion-toast').first()).toContainText('Invalid');
  });

  test('shows error toast on non-existent username', async ({ page }) => {
    await page.locator('ion-input[formcontrolname="username"] input').fill('nobody');
    await page.locator('ion-input[formcontrolname="password"] input').fill('anything');
    await page.locator('ion-button[type="submit"]').click();
    await expect(page.locator('ion-toast').first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Session persistence ────────────────────────────────────────────────────

  test('already-logged-in user is redirected from /login to /home', async ({ page }) => {
    // Log in via UI first
    const user = TEST_USERS['admin'];
    await page.locator('ion-input[formcontrolname="username"] input').fill(user.username);
    await page.locator('ion-input[formcontrolname="password"] input').fill(user.password);
    await page.locator('ion-button[type="submit"]').click();
    await page.waitForURL('**/home', { timeout: 12_000 });

    // Navigate back to /login — should redirect to /home
    await page.goto('/login');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  // ── Auth guard ─────────────────────────────────────────────────────────────

  test('unauthenticated user is redirected from /home to /login', async ({ page }) => {
    await page.goto('/home');
    await page.waitForURL('**/login', { timeout: 8_000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated user is redirected from /patients to /login', async ({ page }) => {
    await page.goto('/patients');
    await page.waitForURL('**/login', { timeout: 8_000 });
    expect(page.url()).toContain('/login');
  });
});
