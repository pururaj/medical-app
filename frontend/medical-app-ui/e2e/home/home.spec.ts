import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession, clearSession } from '../helpers/auth.helper';

test.describe('Home Page', () => {
  // ── Admin home ─────────────────────────────────────────────────────────────

  test.describe('ADMIN role', () => {
    test.beforeEach(async ({ page }) => {
      await injectSession(page, TEST_USERS['admin']);
      await page.goto('/home');
      await page.waitForSelector('.hero-banner', { timeout: 8_000 });
    });

    test('shows username and Admin role chip', async ({ page }) => {
      await expect(page.locator('.hero-banner h1')).toContainText('admin');
      await expect(page.locator('ion-chip')).toContainText('Admin');
    });

    test('shows all 5 quick action tiles', async ({ page }) => {
      const tiles = page.locator('ion-card.action-card');
      await expect(tiles).toHaveCount(9);
    });

    test('shows Book Appointment tile', async ({ page }) => {
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Book Appointment' })).toBeVisible();
    });

    test('shows Doctor Queue tile', async ({ page }) => {
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Doctor Queue' })).toBeVisible();
    });

    test('shows Patients tile', async ({ page }) => {
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Patients' }).first()).toBeVisible();
    });

    test('shows logout button in toolbar', async ({ page }) => {
      await expect(page.locator('ion-button ion-icon[name="log-out-outline"]')).toBeVisible();
    });

    test('logout button clears session and redirects to /login', async ({ page }) => {
      await page.locator('ion-button:has(ion-icon[name="log-out-outline"])').click();
      await page.waitForURL('**/login', { timeout: 8_000 });
      expect(page.url()).toContain('/login');

      // Verify localStorage cleared
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(token).toBeNull();
    });

    test('clicking My Appointments navigates to /appointments', async ({ page }) => {
      await page.locator('ion-card.action-card', { hasText: 'My Appointments' }).click();
      await page.waitForURL(/\/appointments(\?|$)/, { timeout: 10_000 });
      expect(page.url()).toMatch(/\/appointments(\?|$)/);
    });

    test('clicking Patients tile navigates to /patients', async ({ page }) => {
      await page.locator('ion-card.action-card', { hasText: 'Patients' }).click();
      await page.waitForURL('**/patients', { timeout: 10_000 });
      expect(page.url()).toContain('/patients');
    });

    test('clicking Doctors tile navigates to /doctors', async ({ page }) => {
      await page.locator('ion-card.action-card', { hasText: 'Doctors' }).click();
      await page.waitForURL('**/doctors', { timeout: 10_000 });
      expect(page.url()).toContain('/doctors');
    });
  });

  // ── Doctor home ────────────────────────────────────────────────────────────

  test.describe('DOCTOR role', () => {
    test.beforeEach(async ({ page }) => {
      await injectSession(page, TEST_USERS['doctor']);
      await page.goto('/home');
      await page.waitForSelector('.hero-banner', { timeout: 8_000 });
    });

    test('shows Doctor role chip', async ({ page }) => {
      await expect(page.locator('ion-chip')).toContainText('Doctor');
    });

    test('shows 4 quick actions (no Book Appointment)', async ({ page }) => {
      const tiles = page.locator('ion-card.action-card');
      await expect(tiles).toHaveCount(5);
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Book Appointment' })).toHaveCount(0);
    });

    test('shows Doctor Queue tile', async ({ page }) => {
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Doctor Queue' })).toBeVisible();
    });
  });

  // ── Receptionist home ──────────────────────────────────────────────────────

  test.describe('RECEPTIONIST role', () => {
    test.beforeEach(async ({ page }) => {
      await injectSession(page, TEST_USERS['receptionist']);
      await page.goto('/home');
      await page.waitForSelector('.hero-banner', { timeout: 8_000 });
    });

    test('shows Receptionist role chip', async ({ page }) => {
      await expect(page.locator('ion-chip')).toContainText('Receptionist');
    });

    test('shows Book Appointment and Doctor Queue tiles', async ({ page }) => {
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Book Appointment' })).toBeVisible();
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Doctor Queue' })).toBeVisible();
    });
  });

  // ── Pharmacist home ────────────────────────────────────────────────────────

  test.describe('PHARMACIST role', () => {
    test.beforeEach(async ({ page }) => {
      await injectSession(page, TEST_USERS['pharmacist']);
      await page.goto('/home');
      await page.waitForSelector('.hero-banner', { timeout: 8_000 });
    });

    test('shows Pharmacist role chip', async ({ page }) => {
      await expect(page.locator('ion-chip')).toContainText('Pharmacist');
    });

    test('shows only 2 tiles — no appointments or booking', async ({ page }) => {
      const tiles = page.locator('ion-card.action-card');
      await expect(tiles).toHaveCount(2);
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Book Appointment' })).toHaveCount(0);
      await expect(page.locator('ion-card.action-card').filter({ hasText: 'Doctor Queue' })).toHaveCount(0);
    });
  });

  // ── Lab tech home ──────────────────────────────────────────────────────────

  test.describe('LAB_TECH role', () => {
    test.beforeEach(async ({ page }) => {
      await injectSession(page, TEST_USERS['labtech']);
      await page.goto('/home');
      await page.waitForSelector('.hero-banner', { timeout: 8_000 });
    });

    test('shows Lab Technician role chip', async ({ page }) => {
      await expect(page.locator('ion-chip')).toContainText('Lab Technician');
    });

    test('shows only 2 tiles', async ({ page }) => {
      await expect(page.locator('ion-card.action-card')).toHaveCount(2);
    });
  });
});
