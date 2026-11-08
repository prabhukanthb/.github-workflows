import test from 'node:test';
import assert from 'node:assert/strict';
import { applySeo, robotsTxt, sitemapXml } from './seo.js';

const HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Old title</title>
    <meta name="description" content="Old description" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://www.telugukalyanamala.com/" />
  </head>
  <body><div id="root"></div></body>
</html>`;

test('the homepage is indexable and names Vijayawada and the Mala community', () => {
  const html = applySeo(HTML, '/');
  assert.match(html, /<title>Telugu Mala Matrimony in Vijayawada \| Telugu Kalyanamala<\/title>/);
  assert.match(html, /meta name="description" content="[^"]*Mala matrimony/);
  assert.match(html, /meta name="robots" content="index,follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.telugukalyanamala\.com\/"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /Vijayawada/);
  assert.equal(html.includes('Old description'), false);
});

test('member and office pages stay out of search results', () => {
  for (const path of ['/browse', '/profile', '/interests', '/admin', '/admin/create', '/admin/interests', '/login']) {
    const html = applySeo(HTML, path);
    assert.match(html, /noindex,nofollow/, path);
    assert.equal(html.includes('index,follow'), false, path);
  }
  const sitemap = sitemapXml();
  assert.match(sitemap, /https:\/\/www\.telugukalyanamala\.com\/register/);
  assert.equal(sitemap.includes('/browse'), false);
  assert.equal(sitemap.includes('/admin'), false);
  assert.equal(sitemap.includes('/profile'), false);
  const robots = robotsTxt();
  assert.match(robots, /Disallow: \/browse/);
  assert.match(robots, /Disallow: \/interests/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Sitemap: https:\/\/www\.telugukalyanamala\.com\/sitemap\.xml/);
});
