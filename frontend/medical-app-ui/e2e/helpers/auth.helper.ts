import { Page } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
  role: string;
  label: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    label: 'Admin',
  },
  doctor: {
    username: 'doctor1',
    password: 'doctor123',
    role: 'DOCTOR',
    label: 'Doctor',
  },
  receptionist: {
    username: 'receptionist1',
    password: 'recep123',
    role: 'RECEPTIONIST',
    label: 'Receptionist',
  },
  pharmacist: {
    username: 'pharmacist1',
    password: 'pharma123',
    role: 'PHARMACIST',
    label: 'Pharmacist',
  },
  labtech: {
    username: 'labtech1',
    password: 'lab123',
    role: 'LAB_TECH',
    label: 'Lab Technician',
  },
};

/**
 * Log in via the UI login page and wait until redirected to /home.
 */
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('ion-card', { timeout: 8_000 });

  await page.locator('ion-input[formcontrolname="username"] input').fill(user.username);
  await page.locator('ion-input[formcontrolname="password"] input').fill(user.password);
  await page.locator('ion-button[type="submit"]').click();

  await page.waitForURL('**/home', { timeout: 12_000 });
}

/**
 * Inject JWT directly into localStorage (fast — skips the login UI).
 * Use for tests that just need a valid session and don't test the login flow itself.
 */
export async function injectSession(page: Page, user: TestUser): Promise<void> {
  // Hit the auth API directly to get a real token
  const response = await page.request.post('http://127.0.0.1:8086/auth/login', {
    data: { username: user.username, password: user.password },
  });

  const body = await response.json();
  const token: string = body.data.token;
  const role: string = body.data.role;
  const username: string = body.data.username;

  // Navigate to app first so localStorage is scoped to the right origin
  await page.goto('/login');

  await page.evaluate(
    ({ token, role, username }) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('username', username);
    },
    { token, role, username }
  );
}

/**
 * Clear session (logout state).
 * Must navigate to the app origin first so localStorage is accessible.
 */
export async function clearSession(page: Page): Promise<void> {
  // Ensure we're on the app origin before touching localStorage
  const url = page.url();
  if (!url.startsWith('http://localhost:8100') && !url.startsWith('http://127.0.0.1:8100')) {
    await page.goto('/login');
  }
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  });
}
