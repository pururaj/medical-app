/**
 * Role-Based Access Control Matrix Tests
 *
 * Verifies that each role can only access the pages it's allowed to.
 *
 * Matrix:
 * Route                  | ADMIN | DOCTOR | RECEP | PHARMA | LAB
 * /patients (list)       |  ✓    |   ✗    |  ✓   |  ✗     | ✗
 * /patients/:id (detail) |  ✓    |   ✓    |  ✓   |  ✓     | ✓
 * /patients/:id/edit     |  ✓    |   ✗    |  ✓   |  ✗     | ✗
 * /appointments          |  ✓    |   ✓    |  ✓   |  ✗     | ✗
 * /appointments/book     |  ✓    |   ✗    |  ✓   |  ✗     | ✗
 * /appointments/queue    |  ✓    |   ✓    |  ✓   |  ✗     | ✗
 * /doctors               |  ✓    |   ✓    |  ✓   |  ✓     | ✓
 * /inventory             |  ✓    |   ✗    |  ✗   |  ✓     | ✗
 * /pharmacy              |  ✓    |   ✗    |  ✓   |  ✓     | ✗
 * /lab                   |  ✓    |   ✓    |  ✓   |  ✗     | ✓
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS, injectSession } from '../helpers/auth.helper';

type Route = string;

/** Navigate to a route and assert either allowed (stays) or blocked (→ /home). */
async function assertAccess(
  page: Parameters<typeof injectSession>[0],
  userKey: string,
  route: Route,
  allowed: boolean
) {
  await injectSession(page, TEST_USERS[userKey]);
  await page.goto(route);
  await page.waitForTimeout(2_000); // let guards execute

  if (allowed) {
    expect(page.url()).toContain(route.split('?')[0]);
  } else {
    expect(page.url()).toContain('/home');
  }
}

// ── /patients (list) ───────────────────────────────────────────────────────

test.describe('/patients list access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/patients', true);
  });
  test('DOCTOR: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'doctor', '/patients', false);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/patients', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/patients', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/patients', false);
  });
});

// ── /patients/:id (detail) ─────────────────────────────────────────────────

test.describe('/patients/:id detail access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/patients/1', true);
  });
  test('DOCTOR: allowed', async ({ page }) => {
    await assertAccess(page, 'doctor', '/patients/1', true);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/patients/1', true);
  });
  test('PHARMACIST: allowed', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/patients/1', true);
  });
  test('LAB_TECH: allowed', async ({ page }) => {
    await assertAccess(page, 'labtech', '/patients/1', true);
  });
});

// ── /patients/:id/edit ─────────────────────────────────────────────────────

test.describe('/patients/:id/edit access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/patients/1/edit', true);
  });
  test('DOCTOR: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'doctor', '/patients/1/edit', false);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/patients/1/edit', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/patients/1/edit', false);
  });
});

// ── /appointments (list) ───────────────────────────────────────────────────

test.describe('/appointments list access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/appointments', true);
  });
  test('DOCTOR: allowed', async ({ page }) => {
    await assertAccess(page, 'doctor', '/appointments', true);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/appointments', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/appointments', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/appointments', false);
  });
});

// ── /appointments/book ─────────────────────────────────────────────────────

test.describe('/appointments/book access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/appointments/book', true);
  });
  test('DOCTOR: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'doctor', '/appointments/book', false);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/appointments/book', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/appointments/book', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/appointments/book', false);
  });
});

// ── /appointments/queue ────────────────────────────────────────────────────

test.describe('/appointments/queue access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/appointments/queue', true);
  });
  test('DOCTOR: allowed', async ({ page }) => {
    await assertAccess(page, 'doctor', '/appointments/queue', true);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/appointments/queue', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/appointments/queue', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/appointments/queue', false);
  });
});

// ── /doctors ───────────────────────────────────────────────────────────────

test.describe('/doctors access (all roles)', () => {
  for (const key of ['admin', 'doctor', 'receptionist', 'pharmacist', 'labtech']) {
    test(`${key.toUpperCase()}: allowed`, async ({ page }) => {
      await assertAccess(page, key, '/doctors', true);
    });
  }
});

// ── /inventory ─────────────────────────────────────────────────────────────

test.describe('/inventory access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/inventory', true);
  });
  test('PHARMACIST: allowed', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/inventory', true);
  });
  test('DOCTOR: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'doctor', '/inventory', false);
  });
  test('RECEPTIONIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/inventory', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/inventory', false);
  });
});

// ── /pharmacy ──────────────────────────────────────────────────────────────

test.describe('/pharmacy access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/pharmacy', true);
  });
  test('PHARMACIST: allowed', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/pharmacy', true);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/pharmacy', true);
  });
  test('DOCTOR: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'doctor', '/pharmacy', false);
  });
  test('LAB_TECH: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'labtech', '/pharmacy', false);
  });
});

// ── /lab ───────────────────────────────────────────────────────────────────

test.describe('/lab access', () => {
  test('ADMIN: allowed', async ({ page }) => {
    await assertAccess(page, 'admin', '/lab', true);
  });
  test('LAB_TECH: allowed', async ({ page }) => {
    await assertAccess(page, 'labtech', '/lab', true);
  });
  test('DOCTOR: allowed', async ({ page }) => {
    await assertAccess(page, 'doctor', '/lab', true);
  });
  test('RECEPTIONIST: allowed', async ({ page }) => {
    await assertAccess(page, 'receptionist', '/lab', true);
  });
  test('PHARMACIST: blocked → /home', async ({ page }) => {
    await assertAccess(page, 'pharmacist', '/lab', false);
  });
});

// ── Unauthenticated ────────────────────────────────────────────────────────

test.describe('Unauthenticated access', () => {
  const protectedRoutes = [
    '/home',
    '/patients',
    '/appointments',
    '/appointments/book',
    '/appointments/queue',
    '/doctors',
    '/inventory',
    '/pharmacy',
    '/lab',
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login when not authenticated`, async ({ page }) => {
      // Ensure no session
      await page.goto('/login');
      await page.evaluate(() => localStorage.clear());

      await page.goto(route);
      await page.waitForURL('**/login', { timeout: 8_000 });
      expect(page.url()).toContain('/login');
    });
  }
});
