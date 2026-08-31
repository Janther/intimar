import { test, expect } from '@playwright/test';

test('homepage renders the hero and featured events', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/Vuelve a tu cuerpo/);
  await expect(page.locator('main img').first()).toBeVisible();
});

test('events listing renders real card images, not [object Object]', async ({
  page,
}) => {
  await page.goto('/events');
  const images = page.locator('a[href^="/events/"] img');
  await expect(images.first()).toBeVisible();

  const srcs = await images.evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
  );
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    expect(src).not.toContain('object');
    expect(src).toMatch(/^\/_astro\/.+\.(webp|jpg|jpeg|png)/);
  }
});

test('event detail page renders content, hosts, and a valid Event schema', async ({
  page,
}) => {
  await page.goto('/events/sierra-silent-retreat');
  await expect(page.locator('h1')).toHaveText('Volver al Cuerpo');
  await expect(page.getByRole('link', { name: 'Sana Farooqi' })).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(jsonLd ?? '{}');
  expect(data['@type']).toBe('Event');
  expect(data.name).toBe('Volver al Cuerpo');
  expect(typeof data.offers.price).toBe('number');
  expect(data.image[0]).toMatch(/^https:\/\//);
});

test('blog listing renders real card images, not [object Object]', async ({
  page,
}) => {
  await page.goto('/blog');
  const images = page.locator('a[href^="/blog/"] img');
  await expect(images.first()).toBeVisible();

  const srcs = await images.evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).getAttribute('src')),
  );
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) {
    expect(src).not.toContain('object');
    expect(src).toMatch(/^\/_astro\/.+\.(webp|jpg|jpeg|png)/);
  }
});

test('blog post renders content, author, adjacent post, and a valid BlogPosting schema', async ({
  page,
}) => {
  await page.goto('/blog/volver-a-la-respiracion');
  await expect(page.locator('h1')).toHaveText('Volver a la respiración');
  await expect(page.getByRole('link', { name: 'Elena Marsh' })).toBeVisible();

  // This is the newer of the two example posts, so only "previous" (the
  // older one) should appear in the adjacent-post section — not "next".
  await expect(
    page.getByRole('link', { name: 'Una mirada desde afuera' }),
  ).toBeVisible();

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const data = JSON.parse(jsonLd ?? '{}');
  expect(data['@type']).toBe('BlogPosting');
  expect(data.headline).toBe('Volver a la respiración');
  expect(data.author.name).toBe('Elena Marsh');
  expect(data.publisher.name).toBe('Intimar');
});

test('team listing and detail pages render photos', async ({ page }) => {
  await page.goto('/team');
  await expect(page.locator('img').first()).toBeVisible();

  await page
    .getByRole('link', { name: /Elena Marsh/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/team\/elena-marsh/);
  await expect(page.locator('h1')).toHaveText('Elena Marsh');
});

test('unknown routes render the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText(/Esta página no existe/);
  await expect(
    page.getByRole('link', { name: 'Ver Próximos Retiros' }),
  ).toBeVisible();
});
