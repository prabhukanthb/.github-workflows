import { FAQ, SITE_ORIGIN, isPrivatePath, landingFor, pageFor, publicPages } from '../client/src/seoPages.js';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(path) {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

function landingHtml(page) {
  const places = page.places?.length
    ? `<ul>${page.places.map((place) => `<li>${escapeHtml(place)}</li>`).join('')}</ul>`
    : '';
  const paragraphs = (page.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  return `<article><h1>${escapeHtml(page.h1)}</h1>${paragraphs}${places}</article>`;
}

function jsonLd(page) {
  if (!page.index || (page.path !== '/' && !landingFor(page.path))) return '';
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        name: 'Telugu Kalyanamala',
        url: `${SITE_ORIGIN}/`,
        telephone: '+919440545049',
        email: 'office@newkalyanamala.org',
        description: page.description,
        parentOrganization: {
          '@type': 'Organization',
          name: 'Kalyanamala Seva Samstha'
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '31-12-9/1, Manohara Apartments, Machavaram Down, Machavaram',
          addressLocality: 'Vijayawada',
          addressRegion: 'Andhra Pradesh',
          postalCode: '520004',
          addressCountry: 'IN'
        },
        areaServed: [
          { '@type': 'State', name: 'Andhra Pradesh' },
          { '@type': 'State', name: 'Telangana' },
          { '@type': 'City', name: 'Vijayawada' },
          { '@type': 'City', name: 'Hyderabad' },
          { '@type': 'City', name: 'Guntur' },
          { '@type': 'City', name: 'Visakhapatnam' },
          { '@type': 'City', name: 'Warangal' },
          { '@type': 'City', name: 'Tirupati' }
        ],
        knowsLanguage: ['Telugu', 'English'],
        audience: {
          '@type': 'Audience',
          audienceType: 'Telugu Mala families in Andhra Pradesh and Telangana'
        }
      }
    ]
  };
  if (page.path === '/') {
    data['@graph'].push({
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function headTags(pathname) {
  const page = pageFor(pathname);
  const index = page.index && !isPrivatePath(pathname);
  const url = absoluteUrl(page.path);
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const robots = index ? 'index,follow' : 'noindex,nofollow';
  return [
    `<meta name="google" content="notranslate" />`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Telugu Kalyanamala" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    jsonLd({ ...page, index })
  ].filter(Boolean).join('\n    ');
}

export function applySeo(html, pathname) {
  const page = pageFor(pathname);
  const title = escapeHtml(page.title);
  let next = String(html).replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  next = next.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  next = next.replace(/<meta\s+name=["']robots["'][^>]*>/gi, '');
  next = next.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  next = next.replace(/<html\b[^>]*>/i, '<html lang="en-IN" translate="no" class="notranslate">');
  next = next.replace(/<meta\s+name=["']google["'][^>]*>/gi, '');
  next = next.replace('</head>', `    ${headTags(pathname)}\n  </head>`);
  const landing = landingFor(pathname);
  if (landing) {
    next = next.replace(/<div id="root"><\/div>/, `<div id="root">${landingHtml(landing)}</div>`);
  }
  return next;
}

export function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /profile',
    'Disallow: /interests',
    'Disallow: /browse',
    'Disallow: /login',
    'Disallow: /forgot-password',
    'Disallow: /change-password',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    ''
  ].join('\n');
}

export function sitemapXml() {
  const urls = publicPages().map((page) => [
    '  <url>',
    `    <loc>${absoluteUrl(page.path)}</loc>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>'
  ].join('\n'));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n');
}
