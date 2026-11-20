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

test('the homepage is indexable and names both Telugu states and the Mala community', () => {
  const html = applySeo(HTML, '/');
  assert.match(html, /<title>Telugu Mala Matrimony in Andhra Pradesh and Telangana \| Telugu Kalyanamala<\/title>/);
  assert.match(html, /meta name="description" content="[^"]*Andhra Pradesh and Telangana/);
  assert.match(html, /meta name="robots" content="index,follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.telugukalyanamala\.com\/"/);
  assert.match(html, /<html lang="en-IN" translate="no" class="notranslate">/);
  assert.match(html, /meta name="google" content="notranslate"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /https:\/\/www\.telugukalyanamala\.com\/logo-512\.png/);
  assert.match(html, /Andhra Pradesh/);
  assert.match(html, /Telangana/);
  assert.equal(html.includes('Old description'), false);
});

test('state pages are indexable and name the cities families search for', () => {
  const andhra = applySeo(HTML, '/andhra-pradesh');
  assert.match(andhra, /Mala Matrimony in Andhra Pradesh/);
  assert.match(andhra, /<h1>Mala matrimony in Andhra Pradesh<\/h1>/);
  assert.match(andhra, /Visakhapatnam/);
  assert.match(andhra, /rel="canonical" href="https:\/\/www\.telugukalyanamala\.com\/andhra-pradesh"/);
  const telangana = applySeo(HTML, '/telangana');
  assert.match(telangana, /<h1>Mala matrimony in Telangana<\/h1>/);
  assert.match(telangana, /Hyderabad/);
  assert.match(telangana, /Warangal/);
  const sitemap = sitemapXml();
  assert.match(sitemap, /\/andhra-pradesh/);
  assert.match(sitemap, /\/telangana/);
  assert.match(sitemap, /\/hindu-mala-matrimony/);
  assert.match(sitemap, /\/christian-mala-matrimony/);
  assert.match(sitemap, /<loc>https:\/\/www\.telugukalyanamala\.com\/andhra-pradesh<\/loc>\n    <lastmod>2026-11-18<\/lastmod>/);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 9);
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
