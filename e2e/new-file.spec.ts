import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

const FIXTURE_JSONL = [
  '{"type":"user","message":{"content":"Hello"},"timestamp":"2024-01-01T00:00:00Z","uuid":"1","sessionId":"test-session","gitBranch":"main"}',
  '{"type":"assistant","message":{"content":[{"type":"text","text":"Hi there!"}],"model":"claude-3"},"timestamp":"2024-01-01T00:00:01Z","uuid":"2","requestId":"req1"}',
].join('\n');

let tmpFilePath: string;

test.beforeAll(async () => {
  const tmpDir = os.tmpdir();
  tmpFilePath = path.join(tmpDir, 'test-new-file.jsonl');
  fs.writeFileSync(tmpFilePath, FIXTURE_JSONL, 'utf-8');
});

test.afterAll(async () => {
  if (tmpFilePath && fs.existsSync(tmpFilePath)) {
    fs.unlinkSync(tmpFilePath);
  }
});

test.describe('New File', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(tmpFilePath);
    await expect(page.locator('#replay-screen')).toBeVisible();
  });

  test('clicking "New file" returns to upload screen', async ({ page }) => {
    const newFileBtn = page.locator('#new-file-btn');
    await newFileBtn.click();

    const uploadScreen = page.locator('#upload-screen');
    await expect(uploadScreen).toBeVisible();
  });

  test('replay screen is hidden after clicking new file', async ({ page }) => {
    const newFileBtn = page.locator('#new-file-btn');
    await newFileBtn.click();

    const replayScreen = page.locator('#replay-screen');
    await expect(replayScreen).toBeHidden();
  });

  test('upload screen is visible after clicking new file', async ({ page }) => {
    const newFileBtn = page.locator('#new-file-btn');
    await newFileBtn.click();

    const uploadScreen = page.locator('#upload-screen');
    await expect(uploadScreen).toBeVisible();

    // Verify the upload screen elements are still intact
    await expect(page.locator('#upload-screen h1')).toHaveText('Claude Code Replay');
    await expect(page.locator('#drop-zone')).toBeVisible();
  });
});
