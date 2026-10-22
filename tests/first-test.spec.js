import { test, expect } from '@playwright/test';

test('open Reaixo Website', async ({ page }) => {
  await page.goto('https://www.reaixo.com/');
  await expect(page).toHaveURL('https://www.reaixo.com/');
});
