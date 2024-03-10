import { test, expect } from './fixtures';
import { openPopup } from './pages/popup';

test('show Popup', async ({ page, extensionId }) => {
  const popup = await openPopup(page, extensionId);
  expect(await popup.getText('App')).not.toBe(null);
});
