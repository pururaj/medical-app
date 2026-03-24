import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

// ── Patient List ───────────────────────────────────────────────────────────

test.describe('Patient List Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/patients');
    // Wait for the list to load (spinner disappears or cards appear)
    await page.waitForFunction(
      () => !document.querySelector('.loading-state') || document.querySelectorAll('ion-card.patient-card').length > 0,
      { timeout: 10_000 }
    );
  });

  test('renders the Patients header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Patients');
  });

  test('shows search bar', async ({ page }) => {
    await expect(page.locator('ion-searchbar')).toBeVisible();
  });

  test('shows at least one patient card after load', async ({ page }) => {
    const cards = page.locator('ion-card.patient-card');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('patient card contains name, gender and blood type', async ({ page }) => {
    const card = page.locator('ion-card.patient-card').first();
    await expect(card.locator('.patient-name')).toBeVisible();
    await expect(card.locator('.patient-meta')).toBeVisible();
  });

  test('search filters patient list', async ({ page }) => {
    // Get total count first
    const initial = await page.locator('ion-card.patient-card').count();

    await page.locator('ion-searchbar input').fill('zzznotexist');
    await page.waitForTimeout(600); // debounce

    const filtered = await page.locator('ion-card.patient-card').count();
    // Either shows empty state or fewer results
    const emptyState = page.locator('.empty-state');
    const hasEmptyState = await emptyState.isVisible();
    expect(hasEmptyState || filtered < initial).toBeTruthy();
  });

  test('clearing search restores full list', async ({ page }) => {
    await page.locator('ion-searchbar input').fill('zzznotexist');
    await page.waitForTimeout(600);

    await page.locator('ion-searchbar input').fill('');
    await page.waitForTimeout(600);

    const cards = page.locator('ion-card.patient-card');
    await expect(cards.first()).toBeVisible({ timeout: 8_000 });
  });

  test('add patient button navigates to /patients/register', async ({ page }) => {
    // Header button or FAB
    const addBtn = page.locator('ion-button[routerlink="/patients/register"], ion-fab-button').first();
    await addBtn.click();
    await page.waitForURL('**/patients/register', { timeout: 8_000 });
    expect(page.url()).toContain('/patients/register');
  });

  test('clicking a patient card navigates to patient detail', async ({ page }) => {
    await page.locator('ion-card.patient-card').first().click();
    await page.waitForURL('**/patients/**', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/patients\/\d+/);
  });
});

// ── Patient Registration ───────────────────────────────────────────────────

test.describe('Patient Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/patients/register');
    await page.waitForSelector('ion-title', { timeout: 8_000 });
  });

  test('shows Register Patient header', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Patient');
  });

  test('shows Personal Information section', async ({ page }) => {
    await expect(page.locator('text=Personal Information')).toBeVisible();
  });

  test('shows Medical Information section', async ({ page }) => {
    // Medical is step 2 — verify it appears in the step progress bar
    await expect(page.locator('.step-name', { hasText: 'Medical' }).first()).toBeVisible();
  });

  test('shows Emergency Contact section', async ({ page }) => {
    // Emergency is step 3 — verify it appears in the step progress bar
    await expect(page.locator('.step-name', { hasText: 'Emergency' }).first()).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    // Clicking Continue on step 1 without filling required fields shows inline errors
    await page.locator('ion-button', { hasText: /continue/i }).first().click();
    await expect(page.locator('ion-note[color="danger"]').first()).toBeVisible({ timeout: 3_000 });
  });

  test('back button navigates away from register page', async ({ page }) => {
    // Registration page uses a custom ion-button (not ion-back-button)
    await page.locator('ion-toolbar ion-button').first().click();
    await page.waitForTimeout(1_000);
    expect(page.url()).not.toContain('/register');
  });
});

// ── Patient Detail ─────────────────────────────────────────────────────────

test.describe('Patient Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    // Navigate to the list and pick the first patient's id
    await page.goto('/patients');
    await page.locator('ion-card.patient-card').first().waitFor({ timeout: 10_000 });
    await page.locator('ion-card.patient-card').first().click();
    await page.waitForURL(/\/patients\/\d+/, { timeout: 8_000 });
  });

  test('shows patient name in header or card', async ({ page }) => {
    const name = page.locator('.patient-name, ion-card-title, h2').first();
    await expect(name).toBeVisible({ timeout: 6_000 });
  });

  test('shows personal information section', async ({ page }) => {
    // Patient detail shows "Contact Information" card (not "Personal Information")
    await expect(page.locator('.card-title', { hasText: /contact/i }).first()).toBeVisible();
  });

  test('shows Edit button for ADMIN', async ({ page }) => {
    // Edit is rendered as a div.action-btn (not an ion-button with text)
    await expect(page.locator('.action-btn', { hasText: /edit/i })).toBeVisible();
  });

  test('Edit button navigates to edit page', async ({ page }) => {
    await page.locator('.action-btn', { hasText: /edit/i }).click();
    await page.waitForURL(/\/patients\/\d+\/edit/, { timeout: 8_000 });
    expect(page.url()).toContain('/edit');
  });

  test('shows Family Members button', async ({ page }) => {
    // Family is rendered as a div.action-btn (not an ion-button with text)
    await expect(page.locator('.action-btn', { hasText: /family/i })).toBeVisible();
  });

  test('back button returns to patient list', async ({ page }) => {
    await page.locator('ion-back-button').click();
    await page.waitForURL('**/patients', { timeout: 8_000 });
    expect(page.url()).toMatch(/\/patients$/);
  });
});

// ── Patient Edit ───────────────────────────────────────────────────────────

test.describe('Patient Edit Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/patients');
    await page.locator('ion-card.patient-card').first().waitFor({ timeout: 10_000 });
    await page.locator('ion-card.patient-card').first().click();
    await page.waitForURL(/\/patients\/\d+/, { timeout: 8_000 });
    await page.locator('.action-btn', { hasText: /edit/i }).click();
    await page.waitForURL(/\/patients\/\d+\/edit/, { timeout: 8_000 });
  });

  test('shows Edit Patient header', async ({ page }) => {
    // Ionic stacks pages — use .last() to target the active page's title
    await expect(page.locator('ion-title').last()).toContainText(/edit|patient/i);
  });

  test('form is pre-filled with existing patient data', async ({ page }) => {
    // First name field should not be empty
    const firstNameInput = page.locator('ion-input[formcontrolname="firstName"] input');
    await expect(firstNameInput).not.toHaveValue('');
  });

  test('shows Save Changes button', async ({ page }) => {
    await expect(page.locator('ion-button', { hasText: /save/i })).toBeVisible();
  });

  test('back button returns to patient detail without saving', async ({ page }) => {
    // Ionic stacks pages — use .last() to click the active page's back button
    await page.locator('ion-back-button').last().click();
    await page.waitForURL(/\/patients\/\d+$/, { timeout: 8_000 });
    expect(page.url()).not.toContain('/edit');
  });
});

// ── Family Members ─────────────────────────────────────────────────────────

test.describe('Family Members Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page, TEST_USERS['admin']);
    await page.goto('/patients');
    await page.locator('ion-card.patient-card').first().waitFor({ timeout: 10_000 });
    await page.locator('ion-card.patient-card').first().click();
    await page.waitForURL(/\/patients\/\d+/, { timeout: 8_000 });
    await page.locator('.action-btn', { hasText: /family/i }).click();
    await page.waitForURL(/\/patients\/\d+\/family/, { timeout: 8_000 });
  });

  test('shows Family Members header', async ({ page }) => {
    // Ionic stacks pages — use .last() to target the active page's title
    await expect(page.locator('ion-title').last()).toContainText(/family/i);
  });

  test('shows Add Family Member button', async ({ page }) => {
    // FAB button has only an icon (no text) — use .last() since patient list also has a FAB
    await expect(page.locator('ion-fab-button').last()).toBeVisible();
  });

  test('back button returns to patient detail', async ({ page }) => {
    // Ionic stacks pages — use .last() to click the active page's back button
    await page.locator('ion-back-button').last().click();
    await page.waitForURL(/\/patients\/\d+$/, { timeout: 8_000 });
    expect(page.url()).not.toContain('/family');
  });
});

// ── Role-based patient access ──────────────────────────────────────────────

test.describe('Patient access by role', () => {
  test('DOCTOR cannot access patient list — redirected to /home', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/patients');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('DOCTOR can access patient detail page', async ({ page }) => {
    await injectSession(page, TEST_USERS['doctor']);
    await page.goto('/patients/1');
    await page.waitForURL('**/patients/1', { timeout: 8_000 });
    expect(page.url()).toContain('/patients/1');
  });

  test('PHARMACIST cannot access patient list', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/patients');
    await page.waitForURL('**/home', { timeout: 8_000 });
    expect(page.url()).toContain('/home');
  });

  test('PHARMACIST can access patient detail', async ({ page }) => {
    await injectSession(page, TEST_USERS['pharmacist']);
    await page.goto('/patients/1');
    await page.waitForURL('**/patients/1', { timeout: 8_000 });
    expect(page.url()).toContain('/patients/1');
  });

  test('RECEPTIONIST can access patient list', async ({ page }) => {
    await injectSession(page, TEST_USERS['receptionist']);
    await page.goto('/patients');
    await page.waitForURL('**/patients', { timeout: 8_000 });
    expect(page.url()).toContain('/patients');
  });
});
