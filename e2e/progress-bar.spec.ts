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
  tmpFilePath = path.join(tmpDir, 'test-progress-bar.jsonl');
  fs.writeFileSync(tmpFilePath, FIXTURE_JSONL, 'utf-8');
});

test.afterAll(async () => {
  if (tmpFilePath && fs.existsSync(tmpFilePath)) {
    fs.unlinkSync(tmpFilePath);
  }
});

test.describe('Progress Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(tmpFilePath);
    await expect(page.locator('#replay-screen')).toBeVisible();
  });

  test('progress bar exists', async ({ page }) => {
    const progressBar = page.locator('#progress-bar');
    await expect(progressBar).toBeVisible();
  });

  test('progress fill starts at 0%', async ({ page }) => {
    const progressFill = page.locator('#progress-fill');
    await expect(progressFill).toBeAttached();
    const width = await progressFill.evaluate((el) => el.style.width);
    expect(width).toBe('0%');
  });

  test('message counter shows 0/N format', async ({ page }) => {
    const msgCounter = page.locator('#msg-counter');
    await expect(msgCounter).toHaveText('0/2');
  });
});
