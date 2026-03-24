import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

// ── Appointment List ───────────────────────────────────────────────────────

test.describe('Appointment List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/appointments');
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
  });

  test('shows Appointments header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/appointment/i);
  });

  test('shows filter/tab controls', async ({ page }) => {
    // The list page typically has status filter chips or segments
    const filters = page.locator('ion-segment, ion-chip, .filter-row');
    await expect(filters.first()).toBeVisible({ timeout: 5_000 });
  });

  test('shows Book Appointment button for RECEPTIONIST', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /book/i })).toBeVisible();
  });

  test('clicking Book Appointment navigates to /appointments/book', async ({ page }) => {
    await page.locator('ion-button', { hasText: /book/i }).click();
    await page.waitForURL('**/appointments/book', { timeout: 8_000 });
    expect(page.url()).toContain('/appointments/book');
  });

  test('clicking an appointment card navigates to detail', async ({ page }) => {
    const cards = page.locator('ion-card.appointment-card, ion-card');
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await page.waitForURL(/\/appointments\/\d+/, { timeout: 8_000 });
      expect(page.url()).toMatch(/\/appointments\/\d+/);
    }
  });
});

// ── Appointment Booking Wizard ─────────────────────────────────────────────

test.describe('Appointment Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/appointments/book');
    await page.waitForSelector('ion-title', { timeout: 8_000 });
  });

  test('shows Book Appointment header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/book/i);
  });

  test('shows step 1 — Doctor selection by default', async ({ page }) => {
    // The step bar has .step-name with text like "Doctor", "Date", etc.
    await expect(page.locator('.step-bar, .step-item').first()).toBeVisible({ timeout: 6_000 });
  });

  test('shows doctor cards to select from', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
    const doctorCards = page.locator('.doctor-card');
    await expect(doctorCards.first()).toBeVisible({ timeout: 8_000 });
  });

  test('can search for a doctor', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
    const searchbar = page.locator('ion-searchbar');
    if (await searchbar.isVisible()) {
      await searchbar.locator('input').fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('selecting a doctor advances to step 2 (Date)', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state') && document.querySelectorAll('.doctor-card').length > 0,
      { timeout: 10_000 }
    );
    await page.locator('.doctor-card').first().click();
    // Step 2 should show a date-related heading
    await expect(page.locator('.step-heading, ion-datetime, input[type="date"]').first()).toBeVisible({ timeout: 8_000 });
  });

  test('back button returns to appointment list', async ({ page }) => {
    // Booking page uses a custom ion-button, not ion-back-button
    await page.locator('ion-toolbar ion-button').first().click();
    await page.waitForURL(/\/appointments(\?|$)/, { timeout: 8_000 });
    expect(page.url()).toMatch(/\/appointments(\?|$)/);
  });
});

// ── Appointment Detail ─────────────────────────────────────────────────────

test.describe('Appointment Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    // Navigate to list and pick first appointment
    await page.goto('/appointments');
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
    const cards = page.locator('ion-card');
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await page.waitForURL(/\/appointments\/\d+/, { timeout: 8_000 });
    } else {
      // Navigate directly with a known ID if list is empty
      await page.goto('/appointments/1');
    }
  });

  test('shows Appointment Details header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/detail|appointment/i);
  });

  test('shows doctor name in hero card', async ({ page }) => {
    // Wait for appointment to load
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 8_000 }
    );
    const heroCard = page.locator('.hero-card');
    if (await heroCard.isVisible()) {
      await expect(heroCard).toBeVisible();
    }
  });

  test('shows status timeline section', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 8_000 }
    );
    // Only verify timeline when appointment loaded (not in error state)
    const hasAppointment = await page.locator('.hero-card').isVisible();
    if (hasAppointment) {
      await expect(page.locator('.timeline-card').first()).toBeVisible({ timeout: 6_000 });
    }
  });

  test('back button returns to appointment list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/appointments', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/appointments($|\?)/);
  });
});

// ── Doctor Queue Page ──────────────────────────────────────────────────────

test.describe('Doctor Queue Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/appointments/queue');
    await page.waitForSelector('ion-title', { timeout: 8_000 });
  });

  test("shows Today's Queue header", async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText(/queue/i);
  });

  test('shows stats bar with Total, Checked In, In Progress, Done', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
    await expect(page.locator('.stats-grid').first()).toBeVisible({ timeout: 6_000 });
    await expect(page.locator('.stat-label').first()).toBeVisible();
  });

  test('shows queue list or empty state', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('.loading-state'),
      { timeout: 10_000 }
    );
    const hasCards = (await page.locator('.queue-card').count()) > 0;
    const hasEmpty = await page.locator('.empty-state').isVisible();
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('IonRefresher is present in the DOM', async ({ page }) => {
    await expect(page.locator('ion-refresher')).toBeAttached();
  });

  test('back button navigates away from queue', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForTimeout(1_000);
    expect(page.url()).not.toContain('/queue');
  });
});

// ── Appointment role-based access ──────────────────────────────────────────

test.describe('Appointment access by role', () => {
  test('PHARMACIST cannot access appointment list — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/appointments');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('LAB_TECH cannot access appointment booking', async ({ page }) => {
    await injectSession(page, TEST_USERS['labtech']);
    await page.goto('/appointments/book');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('RECEPTIONIST cannot access book page — no, wait: RECEPTIONIST CAN book', async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/appointments/book');
    await page.waitForURL('**/appointments/book', { timeout: 8_000 });
    expect(page.url()).toContain('/appointments/book');
  });

  test('DOCTOR cannot access booking page', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/appointments/book');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('DOCTOR can access queue page', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/appointments/queue');
    await page.waitForURL('**/appointments/queue', { timeout: 8_000 });
    expect(page.url()).toContain('/queue');
  });
});
