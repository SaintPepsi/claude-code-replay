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
  tmpFilePath = path.join(tmpDir, 'test-playback-controls.jsonl');
  fs.writeFileSync(tmpFilePath, FIXTURE_JSONL, 'utf-8');
});

test.afterAll(async () => {
  if (tmpFilePath && fs.existsSync(tmpFilePath)) {
    fs.unlinkSync(tmpFilePath);
  }
});

test.describe('Playback Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(tmpFilePath);
    await expect(page.locator('#replay-screen')).toBeVisible();
  });

  test('play button exists and shows "Play" initially', async ({ page }) => {
    const btnPlay = page.locator('#btn-play');
    await expect(btnPlay).toBeVisible();
    await expect(btnPlay).toContainText('Play');
  });

  test('step button exists', async ({ page }) => {
    const btnStep = page.locator('#btn-step');
    await expect(btnStep).toBeVisible();
    await expect(btnStep).toHaveText('Step');
  });

  test('speed buttons exist with initial "1x" display', async ({ page }) => {
    const btnSlower = page.locator('#btn-slower');
    const btnFaster = page.locator('#btn-faster');
    const speedDisplay = page.locator('#speed-display');

    await expect(btnSlower).toBeVisible();
    await expect(btnFaster).toBeVisible();
    await expect(speedDisplay).toBeVisible();
    await expect(speedDisplay).toHaveText('1x');
  });

  test('clicking faster button increases speed display', async ({ page }) => {
    const btnFaster = page.locator('#btn-faster');
    const speedDisplay = page.locator('#speed-display');

    await btnFaster.click();
    await expect(speedDisplay).toHaveText('2x');

    await btnFaster.click();
    await expect(speedDisplay).toHaveText('4x');
  });

  test('clicking slower button decreases speed display', async ({ page }) => {
    const btnSlower = page.locator('#btn-slower');
    const speedDisplay = page.locator('#speed-display');

    await btnSlower.click();
    await expect(speedDisplay).toHaveText('0.5x');

    await btnSlower.click();
    await expect(speedDisplay).toHaveText('0.25x');
  });

  test('real-time button exists', async ({ page }) => {
    const btnRealtime = page.locator('#btn-realtime');
    await expect(btnRealtime).toBeVisible();
    await expect(btnRealtime).toContainText('Real-time');
  });

  test('new file button exists', async ({ page }) => {
    const newFileBtn = page.locator('#new-file-btn');
    await expect(newFileBtn).toBeVisible();
    await expect(newFileBtn).toHaveText('New file');
  });

  test('keyboard shortcut Space triggers play', async ({ page }) => {
    const btnPlay = page.locator('#btn-play');

    // Initially shows Play
    await expect(btnPlay).toContainText('Play');

    // Press Space to trigger play
    await page.keyboard.press('Space');

    // After pressing Space, button should show Pause
    await expect(btnPlay).toContainText('Pause');
  });
});
