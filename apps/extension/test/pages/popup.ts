import { Page } from '@playwright/test';

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await page.waitForSelector('h1');

  const popup = {
    getText: (text: string) => page.getByText(text),
  };
  return popup;
}
