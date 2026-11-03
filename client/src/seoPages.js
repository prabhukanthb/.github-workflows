export const SITE_ORIGIN = 'https://www.telugukalyanamala.com';

export const FAQ = [
  {
    q: 'Is Telugu Kalyanamala only for the Mala community?',
    a: 'Yes. This service is exclusively for Mala families — Hindu, Christian, Ambedkarist and Buddhist — so parents can search among people who share community, language and family values.'
  },
  {
    q: 'Can parents manage the profile?',
    a: 'Yes. Many biodata are completed by mothers and fathers. You may register in the candidate’s name, keep phone numbers private, and call the Vijayawada office whenever you need a person to walk you through a match.'
  },
  {
    q: 'Will my phone number be public?',
    a: 'No. Mobile numbers and email stay hidden on browse cards. Contact is shared only when both families agree, or through the Vijayawada office.'
  },
  {
    q: 'What does registration cost?',
    a: 'Registration is ₹3,000/-. Call the Vijayawada office if you have questions about payment.'
  }
];

export const PAGES = {
  '/': {
    title: 'Telugu Mala Matrimony in Vijayawada | Telugu Kalyanamala',
    description: 'Telugu Kalyanamala is the Mala matrimony service of Kalyanamala Seva Samstha in Vijayawada. Hindu, Christian, Ambedkarist and Buddhist families can register and speak to the office. Call 94405 45049.',
    index: true,
    priority: '1.0'
  },
  '/register': {
    title: 'Register for Telugu Mala Matrimony | Telugu Kalyanamala',
    description: 'Register a bride or groom with Telugu Kalyanamala in Vijayawada. Registration is ₹3,000/-. Parents may create the login. Call 94405 45049.',
    index: true,
    priority: '0.8'
  },
  '/privacy': {
    title: 'Privacy Policy | Telugu Kalyanamala',
    description: 'How Telugu Kalyanamala, operated by Kalyanamala Seva Samstha, uses name, contact and biodata. Phone and email are not shown on public cards.',
    index: true,
    priority: '0.3'
  },
  '/terms': {
    title: 'Terms of Use | Telugu Kalyanamala',
    description: 'Terms for using Telugu Kalyanamala, the Mala matrimony service of Kalyanamala Seva Samstha in Vijayawada.',
    index: true,
    priority: '0.3'
  },
  '/refund': {
    title: 'Refund Policy | Telugu Kalyanamala',
    description: 'Registration for Telugu Kalyanamala is ₹3,000/-. The Vijayawada office explains the fee before payment and considers refunds case by case.',
    index: true,
    priority: '0.3'
  }
};

const PRIVATE_PREFIXES = ['/admin', '/browse', '/profile', '/login', '/forgot-password', '/change-password'];

export function normalizePath(pathname) {
  const path = String(pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  return path;
}

export function pageFor(pathname) {
  const path = normalizePath(pathname);
  if (PAGES[path]) return { path, ...PAGES[path] };
  return {
    path,
    title: 'Telugu Kalyanamala',
    description: PAGES['/'].description,
    index: false,
    priority: '0.0'
  };
}

export function isPrivatePath(pathname) {
  const path = normalizePath(pathname);
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function publicPages() {
  return Object.entries(PAGES)
    .filter(([, page]) => page.index)
    .map(([path, page]) => ({ path, ...page }));
}
