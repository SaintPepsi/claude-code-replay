import { test, expect } from '@playwright/test';

test.describe('Upload Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('upload screen is visible on initial load', async ({ page }) => {
    const uploadScreen = page.locator('#upload-screen');
    await expect(uploadScreen).toBeVisible();
  });

  test('title "Claude Code Replay" is visible', async ({ page }) => {
    const title = page.locator('#upload-screen h1');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Claude Code Replay');
  });

  test('drop zone is visible with correct text', async ({ page }) => {
    const dropZone = page.locator('#drop-zone');
    await expect(dropZone).toBeVisible();

    const label = dropZone.locator('.label');
    await expect(label).toHaveText('Drop .jsonl file here');

    const sublabel = dropZone.locator('.sublabel');
    await expect(sublabel).toHaveText('or click to browse');
  });

  test('file input exists but is hidden', async ({ page }) => {
    const fileInput = page.locator('#file-input');
    await expect(fileInput).toBeAttached();
    await expect(fileInput).toBeHidden();
    await expect(fileInput).toHaveAttribute('type', 'file');
    await expect(fileInput).toHaveAttribute('accept', '.jsonl');
  });

  test('clicking drop zone triggers file input', async ({ page }) => {
    // Verify the drop zone has an onclick handler that calls fileInput.click()
    // We check by listening for the file chooser event when clicking the drop zone
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#drop-zone').click();
    const fileChooser = await fileChooserPromise;
    expect(fileChooser).toBeTruthy();
  });

  test('replay screen is not visible initially', async ({ page }) => {
    const replayScreen = page.locator('#replay-screen');
    await expect(replayScreen).toBeHidden();
  });
});
