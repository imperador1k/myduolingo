import { test, expect } from '@playwright/test';

test.describe('Sanity & Authentication Boundaries', () => {

  test('Deve carregar a Landing Page e exibir o título e vibração do Duolingo', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Assert that the page title is correct (Next.js default or custom)
    // Wait for the visible headings
    await expect(page.locator('text=duolingo').first()).toBeVisible();
    await expect(page.locator('text=aprender um idioma!')).toBeVisible();
  });

  test('Deve redirecionar para a autenticação Clerk ao clicar em Começar', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Find the 'Comece agora' button
    const comecarBtn = page.getByRole('link', { name: 'Comece agora' });
    await expect(comecarBtn).toBeVisible();

    // Click it to trigger Clerk Modal / Redirect
    await comecarBtn.click();

    // Assert that the page redirects to Clerk's sign-up/sign-in page
    // Using a regex to match either sign-in, sign-up, or accounts domain
    await expect(page).toHaveURL(/.*(sign-in|sign-up|accounts).*/);
  });

});
