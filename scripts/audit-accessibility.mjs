import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const baseUrl = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const routes = ['/', '/cars', '/cars/mercedes-s-class', '/book/mercedes-s-class', '/account/sign-in', '/pilot', '/pilot/local-test-suv', '/privacy', '/terms', '/cookies', '/refunds'];
const mobileRoutes = ['/', '/cars', '/book/mercedes-s-class', '/pilot', '/pilot/local-test-suv', '/privacy', '/terms'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let violationCount = 0;

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const findings = results.violations.flatMap((violation) => violation.nodes.map((node) => ({ id: violation.id, impact: violation.impact, target: node.target.join(' ') })));
    violationCount += findings.length;
    console.log(`${route}: ${findings.length} accessibility findings`);
    for (const finding of findings) console.log(`  ${finding.impact}: ${finding.id} — ${finding.target}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of mobileRoutes) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const findings = results.violations.flatMap((violation) => violation.nodes.map((node) => ({ id: violation.id, impact: violation.impact, target: node.target.join(' ') })));
    violationCount += findings.length;
    console.log(`mobile ${route}: ${findings.length} accessibility findings`);
    for (const finding of findings) console.log(`  ${finding.impact}: ${finding.id} — ${finding.target}`);
  }

  await page.goto(new URL('/book/mercedes-s-class', baseUrl).toString(), { waitUntil: 'networkidle' });
  const dateTrigger = page.locator('.date-trigger').first();
  await dateTrigger.focus();
  await page.keyboard.press('Enter');
  if (!(await page.getByRole('dialog', { name: 'Set the journey.' }).isVisible())) throw new Error('Keyboard Enter did not open the date picker.');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  if (!(await dateTrigger.evaluate((element) => element === document.activeElement))) throw new Error('Closing the date picker did not return focus to its trigger.');
  console.log('Date picker keyboard open, move and Escape/focus return: passed');
  await page.close();
  await context.close();
} finally {
  await browser.close();
}

if (violationCount) process.exitCode = 1;
