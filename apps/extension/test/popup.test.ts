import { test, expect } from './fixtures';
import { openPopup } from './pages/popup';

test('show Popup', async ({ page, extensionId }) => {
  const popup = await openPopup(page, extensionId);
  expect(await popup.getText('Title')).not.toBeNull();
  expect(await popup.getText('URL')).not.toBeNull();
  expect(await popup.getText('Category')).not.toBeNull();
  expect(await popup.getText('Description')).not.toBeNull();
  expect(await popup.getText('Comment')).not.toBeNull();
  expect(await popup.getText('Submit')).not.toBeNull();
});
