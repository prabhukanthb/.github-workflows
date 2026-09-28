import React from 'react';
import { BRAND, EMAIL, ORG, REGISTRATION_FEE, RENEWAL_FEE } from '../siteConfig';

function LegalPage({ title, children }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      <div className="sub" style={{ maxWidth: 720 }}>{children}</div>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>{BRAND}, operated by {ORG}, collects name, contact and biodata only to introduce Mala families. Phone and email are not shown on public cards. Member lists are not sold. Write to {EMAIL} to correct or remove your data.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>This service is for a genuine matrimonial search within the Mala community. You must provide true information. {ORG} may withhold or remove a profile that fails verification. An introduction does not guarantee a marriage. Meet safely and involve your family.</p>
    </LegalPage>
  );
}

export function Refund() {
  return (
    <LegalPage title="Refund Policy">
      <p>Registration is {REGISTRATION_FEE}. Annual renewal is {RENEWAL_FEE}. Fees are explained by the Vijayawada office before payment. Refunds are considered by that office case by case. Email {EMAIL}.</p>
    </LegalPage>
  );
}
