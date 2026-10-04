import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { fullName } from '../siteConfig';
import {
  BRANCH_ADDRESS_LINES,
  BRAND,
  MOTTO,
  EMAIL,
  HELPLINE_DISPLAY,
  HELPLINE_TEL,
  MAP_EMBED,
  ORG,
  REGISTER_CTA,
  REGISTRATION_FEE,
  WHATSAPP_HREF,
  YEARS_OF_SERVICE
} from '../siteConfig';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=65';
const STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=65',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=65',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=65'
];
const FEATURE_PHOTOS = [
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1617575521317-d297bfdc5c48?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=60'
];

const FAQ = [
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
    a: `Registration is ${REGISTRATION_FEE}. Call the Vijayawada office if you have questions about payment.`
  }
];

const PAGE_LINKS = [
  { label: 'Membership', hash: 'membership' },
  { label: 'Success Stories', hash: 'stories' },
  { label: 'Services', hash: 'services' },
  { label: 'Contact Us', hash: 'contact' }
];

export default function Home() {
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    api.browse(token, '')
      .then((data) => {
        if (active) setProfiles((data.profiles || []).slice(0, 8));
      })
      .catch(() => {
        if (active) setProfiles([]);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const featured = profiles.length
    ? profiles.map((profile) => ({
      id: profile.profileId || profile.id,
      name: fullName(profile),
      city: profile.currentAddress?.city || '',
      work: profile.occupation || profile.highestEducation || '',
      photo: profile.photos?.[0]?.url || ''
    }))
    : [
      { id: 'vja', name: 'Bride', city: 'Vijayawada', work: 'Teacher', photo: FEATURE_PHOTOS[0] },
      { id: 'gnt', name: 'Groom', city: 'Vijayawada', work: 'Engineer', photo: FEATURE_PHOTOS[1] },
      { id: 'hyd', name: 'Bride', city: 'Hyderabad', work: 'Nurse', photo: FEATURE_PHOTOS[2] },
      { id: 'nri', name: 'Groom', city: 'Guntur', work: 'IT professional', photo: FEATURE_PHOTOS[3] }
    ];

  return (
    <div>
      <section className="home-hero" style={{ '--hero-image': `url(${HERO_PHOTO})` }}>
        <div className="home-hero-inner">
          <h1>
            Where families meet,<br />
            hopes blossom,<br />
            and <em>lifelong bonds</em> begin.
          </h1>
          <p className="home-motto">{MOTTO}</p>
          <p className="lede verse">
            For fifteen years in <strong>Vijayawada</strong>, <strong>{BRAND}</strong> has lovingly brought together
            hearts, hopes, and families within the <strong>Mala community</strong>.
          </p>
          <p className="lede verse">
            Guided by <strong>{ORG}</strong>, we help every candidate and every caring parent discover a meaningful bond —
            with <em>dignity</em> in every step, <em>privacy</em> in every moment, and a <em>trusted hand</em> to hold throughout the journey.
          </p>
          <div className="hero-actions">
            {!isAuthenticated && <Link to="/login" className="btn-gold">Login</Link>}
            <Link to={isAuthenticated ? '/browse' : '/register'} className="btn-gold">{isAuthenticated ? 'View matches' : REGISTER_CTA}</Link>
            <a href={HELPLINE_TEL} className="btn-ghost">Call {HELPLINE_DISPLAY}</a>
          </div>
        </div>
      </section>

      <nav className="page-links" aria-label="On this page">
        {PAGE_LINKS.map((item) => (
          <a key={item.hash} href={`#${item.hash}`}>{item.label}</a>
        ))}
      </nav>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="counters">
          {[
            { n: `${YEARS_OF_SERVICE}+`, l: 'Years of service from Vijayawada' },
            { n: 'Bride or Groom', l: 'We introduce bride or groom to families' },
            { n: 'Marriages', l: 'Successful marriages with parents involved' },
            { n: 'Private', l: 'Privacy assurance — phone and email stay hidden' }
          ].map((item) => (
            <div key={item.l} className="counter-card">
              <strong>{item.n}</strong>
              {item.l}
            </div>
          ))}
        </div>
      </div>

      <section className="band" id="why">
        <div className="section">
          <h2>Why families choose {BRAND}</h2>
          <p className="sub">Built for the candidate and for the parents who often make the final decision.</p>
          <div className="why-grid">
            {[
              { t: 'Only the Mala community', d: 'Hindu, Christian, Ambedkarist and Buddhist Mala families search among their own people.' },
              { t: `Backed by ${ORG}`, d: 'An institution with a Vijayawada office. You can walk in and speak to someone.' },
              { t: 'We introduce bride or groom', d: 'Our team introduces a bride or a groom to the family, with a person you can call.' },
              { t: 'Privacy in your control', d: 'Mobile numbers stay hidden until both families agree.' },
              { t: 'Parents together', d: 'Mothers and fathers can complete biodata and stay involved at every step.' },
              { t: 'A person on the phone', d: 'Call or WhatsApp the Vijayawada office. We help families meet only when both sides are ready.' }
            ].map((item) => (
              <article key={item.t} className="why-card"><h3>{item.t}</h3><p>{item.d}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="how">
        <div className="section">
          <h2>How it works</h2>
          <p className="sub">Four clear steps. Parents are welcome at every stage.</p>
          <div className="steps">
            {[
              { n: '1', t: 'Register', d: `Create a login with name, surname and mobile. Registration is ${REGISTRATION_FEE}.` },
              { n: '2', t: 'Complete biodata', d: 'Add family, education, city and partner requirement.' },
              { n: '3', t: 'See matches', d: 'Search by city, age and community, or ask us to introduce a bride or groom.' },
              { n: '4', t: 'Meet with support', d: 'Visit the Vijayawada office and take the next step only when both families are ready.' }
            ].map((item) => (
              <article key={item.n} className="step-card">
                <div className="step-num">{item.n}</div>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="featured">
        <div className="section">
          <h2>Brides and grooms we introduce</h2>
          <p className="sub">
            {isAuthenticated
              ? `A sample of members currently on ${BRAND}.`
              : `Register to see biodata. Registration is ${REGISTRATION_FEE}. Phone numbers stay private.`}
          </p>
          <div className="carousel">
            {featured.map((profile) => (
              <article key={profile.id} className="profile-card">
                <img src={profile.photo || FEATURE_PHOTOS[0]} alt="" />
                <div className="meta">
                  <strong>{profile.name}</strong>
                  <div>{[profile.work, profile.city].filter(Boolean).join(' · ')}</div>
                  <Link to={isAuthenticated ? '/browse' : '/register'} className="btn-maroon" style={{ marginTop: 10 }}>
                    {isAuthenticated ? 'View matches' : 'Register to view'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="browse-by">
        <div className="section">
          <h2>Browse matches by</h2>
          <div className="tag-grid">
            {[
              ['City · Vijayawada', 'city=Vijayawada'],
              ['City · Guntur', 'city=Guntur'],
              ['City · Bangalore', 'city=Bangalore'],
              ['Profession', 'q=engineer'],
              ['Education', 'q=b.tech'],
              ['NRI', 'city=NRI'],
              ['Second marriage', 'q=divorced']
            ].map(([label, query]) => (
              <Link key={label} className="tag" to={`/browse?${query}`}>{label}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="membership">
        <div className="section">
          <h2>Membership</h2>
          <p className="sub">One Vijayawada office. Registration is {REGISTRATION_FEE}.</p>
          <div className="plans">
            <article className="plan-card featured">
              <h3>Registration</h3>
              <p>{REGISTRATION_FEE}</p>
              <ul>
                <li>Create a biodata for a bride or groom</li>
                <li>Appear in search for Mala families</li>
                <li>Helpline support from Vijayawada</li>
              </ul>
              <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="band-cream" id="stories">
        <div className="section">
          <h2>Success stories</h2>
          <p className="sub">Families who found a match with patience, privacy and the support of {ORG}.</p>
          <div className="stories">
            {[
              { names: 'Suresh & Anitha', place: 'Vijayawada', quote: 'Our parents met at the office first. We felt looked after, not rushed.' },
              { names: 'Ravi & Lakshmi', place: 'Guntur · Hyderabad', quote: 'They kept our numbers private until both houses were comfortable.' },
              { names: 'Praveen & Mary', place: 'Christian Mala families', quote: 'We needed a community match with shared faith. The office understood that from the first call.' }
            ].map((story, index) => (
              <article key={story.names} className="story-card">
                <img src={STORY_PHOTOS[index]} alt="" />
                <div className="meta">
                  <strong>{story.names}</strong>
                  <div>{story.place}</div>
                  <p>“{story.quote}”</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="about">
        <div className="section">
          <h2>About {ORG}</h2>
          <p className="sub">
            {ORG} has served Mala families from its Vijayawada office for {YEARS_OF_SERVICE} years.
            {' '}{BRAND} is the matrimonial service of the samstha. Elders, working professionals and NRIs use the same careful process:
            a biodata, a conversation with the team, and an introduction only when both families wish it.
            The only office is in Vijayawada.
          </p>
        </div>
      </section>

      <section className="band-cream" id="safety">
        <div className="section">
          <div className="safety-grid">
            <div>
              <h2>Safety and anti-fraud</h2>
              <p className="sub">We would rather delay a profile than publish a doubtful one.</p>
              <ul>
                <li>Photographs that do not belong to the member are not shown in search.</li>
                <li>We never ask you to transfer money to a member or to a private account for a “priority match”.</li>
                <li>Report a suspicious profile to the Vijayawada office.</li>
                <li>Meet in a public place or at the Vijayawada office, and tell a family member where you are going.</li>
              </ul>
            </div>
            <div className="why-card">
              <h3>If something feels wrong</h3>
              <p>Call {HELPLINE_DISPLAY} or write to {EMAIL}. Do not share OTPs, bank details or original certificates on first contact.</p>
              <a className="btn-maroon" href={HELPLINE_TEL}>Call the helpline</a>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="services">
        <div className="section">
          <h2>Services</h2>
          <div className="why-grid">
            {[
              { t: 'Biodata help', d: 'Sit with the team in Vijayawada to complete education, family and partner requirement clearly.' },
              { t: 'Introductions', d: 'We introduce a bride or a groom to the family when both sides are ready.' },
              { t: 'Parent meetings', d: 'Families can meet at the Vijayawada office with the team present.' },
              { t: 'NRI support', d: 'Families abroad can search Telugu Mala matches while parents handle meetings in Vijayawada.' },
              { t: 'Second marriage', d: 'A discreet search for divorced or widowed members, with the same privacy rules.' }
            ].map((item) => (
              <article key={item.t} className="why-card"><h3>{item.t}</h3><p>{item.d}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="contact">
        <div className="section">
          <h2>Vijayawada office</h2>
          <p className="sub">Walk in at Manohara Apartments, Machavaram. Call or WhatsApp {HELPLINE_DISPLAY}.</p>
          <div className="branch-grid">
            <div>
              <p><strong>{ORG}</strong></p>
              {BRANCH_ADDRESS_LINES.map((line) => <p key={line} style={{ margin: '0 0 4px' }}>{line}</p>)}
              <p>Phone: <a href={HELPLINE_TEL}>{HELPLINE_DISPLAY}</a></p>
              <p>WhatsApp: <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">{HELPLINE_DISPLAY}</a></p>
              <p>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
              <p>Walk in with the family. Appointments are preferred on weekdays.</p>
              <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
            </div>
            <iframe className="map-frame" title="Vijayawada office map" src={MAP_EMBED} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="band" id="faq">
        <div className="section">
          <h2>Questions parents ask</h2>
          {FAQ.map((item, index) => (
            <div key={item.q} className="faq-item">
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                {item.q}
              </button>
              {openFaq === index && <div className="faq-body">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="band-maroon cta-band">
        <h2>Begin a careful search for your son or daughter</h2>
        <p>Registration is {REGISTRATION_FEE}. Talk to {ORG} in Vijayawada whenever you need a person, not only a website.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
          <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
          <a href={HELPLINE_TEL} className="btn-ghost">Call {HELPLINE_DISPLAY}</a>
        </div>
      </section>

      {!isAuthenticated && (
        <div className="mobile-register">
          <Link className="btn-gold" to="/login">Login</Link>
          <Link className="btn-gold" to="/register">{REGISTER_CTA}</Link>
        </div>
      )}
    </div>
  );
}
