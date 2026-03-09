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
  tmpFilePath = path.join(tmpDir, 'test-conversation.jsonl');
  fs.writeFileSync(tmpFilePath, FIXTURE_JSONL, 'utf-8');
});

test.afterAll(async () => {
  if (tmpFilePath && fs.existsSync(tmpFilePath)) {
    fs.unlinkSync(tmpFilePath);
  }
});

test.describe('File Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(tmpFilePath);
  });

  test('loading a .jsonl file transitions to replay screen', async ({ page }) => {
    const replayScreen = page.locator('#replay-screen');
    await expect(replayScreen).toBeVisible();
  });

  test('message counter shows correct count after load', async ({ page }) => {
    const msgCounter = page.locator('#msg-counter');
    await expect(msgCounter).toHaveText('0/2');
  });

  test('progress bar ticks are created for each message', async ({ page }) => {
    const ticks = page.locator('#progress-ticks .progress-tick');
    await expect(ticks).toHaveCount(2);
  });

  test('status bar shows "messages loaded" text', async ({ page }) => {
    const statusText = page.locator('#status-text');
    await expect(statusText).toBeVisible();
    await expect(statusText).toHaveText('2 messages loaded');
  });

  test('upload screen is hidden after file load', async ({ page }) => {
    const uploadScreen = page.locator('#upload-screen');
    await expect(uploadScreen).toBeHidden();
  });
});
