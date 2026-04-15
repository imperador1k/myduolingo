import { test, expect } from '@playwright/test';

test.describe('Sanity & Authentication Boundaries', () => {

  test('Deve carregar a Landing Page e exibir o título e vibração do Duolingo', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Assert that the page title is correct (Next.js default or custom)
    // Wait for the visible headings
    await expect(page.getByText('duolingo', { exact: false })).toHaveCount(1);
    await expect(page.getByText('aprender um idioma', { exact: false })).toBeVisible();
  });

  test('Deve redirecionar para a autenticação Clerk ao clicar em Começar', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Find the 'Comece agora' button
    const comecarBtn = page.getByRole('button', { name: /Comece agora/i }).or(page.getByRole('link', { name: /Comece agora/i }));
    await expect(comecarBtn.first()).toBeVisible();

    // Click it to trigger Clerk Modal / Redirect
    await comecarBtn.first().click();

    // Assert that the page redirects to Clerk's sign-up/sign-in page
    // Using a regex to match either sign-in, sign-up, or accounts domain
    await expect(page).toHaveURL(/.*(sign-in|sign-up|accounts|clerk).*/);
  });

});
