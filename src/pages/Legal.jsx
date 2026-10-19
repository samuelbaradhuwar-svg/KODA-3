import React from "react";
import { BUSINESS, LEGAL, LEGAL_LINKS } from "../content.js";
import { Eyebrow, Koda, withBrand } from "../components/ui.jsx";

// The four legal pages. The wording is a South African draft (POPIA, CPA, ECTA). It stays marked as a draft on the
// site until an attorney has reviewed it and LEGAL.reviewed is set to true in content.js.

const B = BUSINESS;
const name = B.legalName || B.tradingName;

function Shell({ eyebrow, title, intro, children }) {
  return (
    <main id="main" className="bg-paper pb-24 pt-32 sm:pt-40">
      <div className="wrap">
        <div className="max-w-[72ch]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="h-section mt-5">{title}</h1>
          <p className="mt-4 text-sm text-muted">Last updated {LEGAL.updated}</p>
          {!LEGAL.reviewed && (
            <p role="note" className="mt-6 rounded-2xl border border-ink/20 bg-paper2 px-5 py-4 text-[14px] leading-[1.6] text-ink">
              <strong className="font-semibold">Draft.</strong> This page has not yet been reviewed by an attorney.
            </p>
          )}
          {intro && <p className="mt-8 text-[17px] leading-[1.75] text-ink/85">{intro}</p>}
          <div className="legal mt-4">{children}</div>
          <nav aria-label="Legal pages" className="mt-16 border-t border-ink/15 pt-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-flex min-h-11 items-center text-sm font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}

const H = ({ children }) => <h2 className="xwide mt-12 text-[clamp(1.1rem,2.3vw,1.35rem)] leading-[1.15] tracking-[-0.02em]">{children}</h2>;
const P = ({ children }) => <p className="mt-4 text-[16px] leading-[1.75] text-ink/85">{children}</p>;
const UL = ({ children }) => <ul className="mt-4 grid list-disc gap-2 pl-6 text-[16px] leading-[1.7] text-ink/85 marker:text-ink/40">{children}</ul>;

function Details() {
  const rows = [
    ["Trading name", B.tradingName],
    ["Registered name", B.legalName],
    ["Type of business", B.entityType],
    ["Registration number", B.registrationNumber],
    ["VAT number", B.vatNumber],
    ["Physical address", B.physicalAddress],
    ["Postal address", B.postalAddress],
    ["Email", B.email],
    ["Phone", B.phone],
  ].filter(([, v]) => v);
  return (
    <dl className="mt-4 grid gap-x-8 gap-y-3 rounded-2xl border border-ink/15 bg-paper2 p-5 sm:grid-cols-[12rem_1fr]">
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{k}</dt>
          <dd className="text-[16px]">{k === "Trading name" ? <Koda /> : v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

const mail = (e) => <a className="underline underline-offset-4" href={`mailto:${e}`}>{e}</a>;

// ---------------------------------------------------------------- privacy policy
export function PrivacyPolicy() {
  return (
    <Shell
      eyebrow="Legal"
      title="Privacy policy"
      intro={<>This policy explains what personal information {withBrand("KODA")} collects through this website, why, who we share it with, and the rights you have under South Africa's Protection of Personal Information Act 4 of 2013 (POPIA). We collect only what we need.</>}
    >
      <H>Who is responsible</H>
      <P>The responsible party for the personal information described here is:</P>
      <Details />
      <P>
        Our Information Officer{B.informationOfficer ? ` is ${B.informationOfficer}` : ""} can be reached at {mail(B.informationOfficerEmail)}. Use this address for any privacy question or request.
      </P>

      <H>What we collect, and why</H>
      <P>We collect personal information only when you give it to us, plus basic technical data needed to run the site.</P>
      <UL>
        <li><strong>Contact form.</strong> Your name and email address, and optionally your phone number, business name and message. The form prepares an email addressed to us in your own email app (or Gmail on a computer). Nothing reaches us until you press send in that email. We use it to reply to your enquiry and, if you go ahead, to prepare a quote.</li>
        <li><strong>Free website check.</strong> The website address you enter, your email address and, optionally, your business name. We use them to run the check, produce your report and email it to you. You consent to this by ticking the box before you submit.</li>
        <li><strong>Specialist audit request.</strong> If you ask for a detailed audit by a specialist: your email address, website address, business name if given, and optionally your phone number and a note. We use it to contact you about the audit.</li>
        <li><strong>Emails and messages you send us.</strong> We keep them to answer you and to keep a record of what we agreed.</li>
        <li><strong>Clients.</strong> If we work together, the contact, billing and business details and the content you supply (text, images, logos) so we can deliver and invoice the work.</li>
        <li><strong>Monthly plans.</strong> To run a monthly plan we also need access to the accounts we manage for you, such as your website, Google Business Profile, Search Console, analytics, social media and advertising accounts. Wherever possible we ask you to give us access through each platform's own sharing or manager permissions, rather than sharing a password.</li>
        <li><strong>Technical data.</strong> Our hosting provider records your IP address, browser and the pages requested in server logs, for security and to keep the site running. To prevent misuse of the free check, requests are limited per IP address; this count is kept briefly in the server's memory and is not saved to a database.</li>
      </UL>
      <P>We do not use analytics, advertising or tracking tools on this website. We do not collect special personal information (such as health, religion or children's information), and this website is not directed at anyone under 18.</P>

      <H>Our lawful basis</H>
      <P>We process personal information because you ask us to (for example, to reply to an enquiry or send a report you requested), to take steps toward or perform an agreement with you, with your consent where you give it, and for our legitimate interests in running and securing the website, as POPIA allows. You may withdraw consent at any time; this does not affect what we did before.</P>

      <H>Who we share it with</H>
      <P>We do not sell personal information. We use these service providers to run the website and the free check, and they process information on our behalf:</P>
      <UL>
        <li><strong>Vercel Inc.</strong> hosts the website and runs the program that performs the free check. It sees technical data such as IP addresses.</li>
        <li><strong>Resend</strong> delivers the report and notification emails, so it handles your email address and the report content.</li>
        <li><strong>Google</strong> (PageSpeed Insights) receives the website address you entered, to measure its speed. Google also receives data if you choose to load the map on our contact section, or if you use Gmail to send us a message.</li>
        <li><strong>Anthropic</strong>, only if switched on, helps write the short summary at the top of your report. It receives the technical findings of the check, but not your name, email address or website address.</li>
      </UL>
      <P>We may also disclose information where the law requires it, or to protect our rights.</P>

      <H>Monthly plans and your customers' information</H>
      <P>When we manage a client's website, search visibility, social media, campaigns or reporting, we may come across personal information about that client's own customers, website visitors, leads and followers. For example, names, email addresses and phone numbers in enquiries, messages and comments, website analytics, and advertising audiences.</P>
      <UL>
        <li><strong>The client is responsible for it.</strong> For that information, the client is the responsible party under POPIA and we act as an operator. We process it only to deliver the services the client has asked for, and only on the client's instructions, under a written agreement.</li>
        <li><strong>We keep it confidential and secure.</strong> We use it for no other purpose, and we do not use it to market our own services.</li>
        <li><strong>Marketing rules.</strong> Email marketing and similar campaigns are sent only to people the client is entitled to contact, with a clear way to opt out, as POPIA requires. Clients remain responsible for having permission to use the people, images and content they ask us to publish.</li>
        <li><strong>Tools.</strong> We may use tools such as Google Search Console, Google Analytics, Google Ads, Meta Business Suite and similar platforms, as the plan needs. Each has its own privacy terms, and information may be processed outside South Africa.</li>
        <li><strong>If you are a client's customer.</strong> To see, correct or delete your information, please contact the business first. We will help them respond.</li>
      </UL>

      <H>Sending information outside South Africa</H>
      <P>These providers store and process information in other countries, including the United States. When we send personal information abroad, we use providers that are contractually bound to protect it, as section 72 of POPIA requires. By submitting a form you understand that your information may be processed in this way.</P>

      <H>How long we keep it</H>
      <P>We keep personal information only as long as needed for the purpose it was collected for. Enquiries that do not lead to work are deleted once they are no longer needed. Records about work we do and invoices are kept for as long as the law requires (for example, tax records are kept for five years). When a monthly plan ends, we stop using the access you gave us, and we delete or hand back the information we hold for you within a reasonable time, unless the law requires us to keep it. The free check is not stored in a database: your report is sent by email and we keep the email copy only as long as we need it to follow up.</P>

      <H>How we protect it</H>
      <P>We use reasonable technical and organisational measures: encrypted connections (HTTPS), access limited to people who need it, and providers with their own security controls. No system is perfectly secure. If a breach affects your personal information, we will notify you and the Information Regulator as POPIA requires.</P>

      <H>Your rights</H>
      <P>You can ask us to confirm whether we hold your personal information and to give you a copy, to correct it, or to delete it. You can object to our processing and withdraw consent. To do any of this, email {mail(B.informationOfficerEmail)}. We may need to confirm your identity first.</P>

      <H>Marketing</H>
      <P>We do not send marketing emails unless you have asked for them or have agreed to receive them. Every marketing message will have a simple way to opt out. Replying to your enquiry or sending the report you asked for is not marketing.</P>

      <H>Complaints</H>
      <P>If you think we have handled your information unlawfully, please tell us first so we can put it right. You may also complain to the Information Regulator (South Africa): <a className="underline underline-offset-4" href="https://inforegulator.org.za" rel="noopener noreferrer">inforegulator.org.za</a>, email {mail("POPIAComplaints@inforegulator.org.za")}, JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001.</P>

      <H>Cookies</H>
      <P>See our <a className="underline underline-offset-4" href="/cookie-policy">cookie policy</a>. In short, this website does not set tracking or advertising cookies.</P>

      <H>Changes to this policy</H>
      <P>If we change how we handle personal information, we will update this page and the date at the top.</P>
    </Shell>
  );
}

// ---------------------------------------------------------------- terms
export function Terms() {
  return (
    <Shell
      eyebrow="Legal"
      title="Terms and conditions"
      intro={<>These terms apply when you use the {withBrand("KODA")} website and our free website check. If you hire us, the written quote or agreement we give you sets out the terms for that work.</>}
    >
      <H>Who we are</H>
      <Details />

      <H>Using this website</H>
      <P>You may use the site for lawful purposes only. Please do not try to break, overload or scrape the site or the free check, or use them to test websites you do not own or have permission to check. We may limit or block use that looks abusive.</P>

      <H>Information on this site</H>
      <P>We try to keep the information here accurate, but it is general and may change. Descriptions of services are summaries. The price, scope and timeline for your project are in the written quote we send you.</P>

      <H>The free website check</H>
      <UL>
        <li>It is an automatic check of the home page address you enter, using publicly available information and third-party tools such as Google PageSpeed Insights. It does not review your whole website, your Google Business Profile, your design or your writing.</li>
        <li>Results are for information only. They may be incomplete or out of date, and they are not professional, legal or technical advice.</li>
        <li>We do not promise that following the suggestions will improve your search ranking, traffic, enquiries or sales.</li>
        <li>If you ask for a detailed audit by a specialist, that is a request to be contacted. It does not create an agreement or promise any outcome.</li>
        <li>Our use of your information for the check is explained in the <a className="underline underline-offset-4" href="/privacy-policy">privacy policy</a>.</li>
      </UL>

      <H>Quotes and services</H>
      <P>Prices on this site are in South African rand. Your written quote states what is included, the price, whether VAT applies, the payment terms and the timeline. If it differs from this website, the quote applies. Our <a className="underline underline-offset-4" href="/refund-policy">refund policy</a> explains cancellations and refunds.</P>

      <H>Monthly growth plans</H>
      <P>Our monthly plans (such as KODA Presence, KODA Growth and KODA Performance) are ongoing services. The prices shown on this site are proposed starting prices. Your written quote or agreement confirms what is included, the monthly price, how and when you are billed, and the date the plan starts.</P>
      <UL>
        <li><strong>Fixed allowances.</strong> Each plan includes a fixed monthly allowance, for example a number of social media posts and campaigns. It is not unlimited work. Your quote says what counts towards the allowance and whether anything unused carries over.</li>
        <li><strong>Quoted separately.</strong> Advertising budgets, extensive video production, professional photography and initial website development are not part of a monthly plan and are quoted separately.</li>
        <li><strong>What we need from you.</strong> To do the work we need timely content, approvals and access to the accounts involved, such as your website, Google Business Profile, social media and advertising accounts. Delays on your side can delay the work.</li>
        <li><strong>Your accounts.</strong> We work in accounts that belong to you. Please keep ownership of them and give us only the access we need. We will only use that access for the work you have asked for.</li>
        <li><strong>No guaranteed results.</strong> We do not promise rankings, traffic, enquiries or sales. Results depend on your business, your market, your content and third-party platforms such as Google and Meta, which can change their rules and algorithms without notice. We are not responsible for those changes.</li>
        <li><strong>Platform rules.</strong> Content and advertising must follow the rules of the platforms we post to. We may decline content that breaks them or is unlawful.</li>
        <li><strong>Changes to the price or scope.</strong> A change to your monthly price or what is included needs your written agreement.</li>
        <li><strong>Cancelling.</strong> You can cancel a monthly plan as explained in our <a className="underline underline-offset-4" href="/refund-policy">refund policy</a>.</li>
      </UL>

      <H>Intellectual property</H>
      <P>The design, text, code, logo and other content of this website belong to {name} or are used with permission, and are protected by copyright. You may not copy them without our written permission. Other businesses' names, logos and websites shown here belong to their owners and appear to show examples of our work. Who owns the work we create for a client is set out in that client's quote or agreement.</P>

      <H>Links and third parties</H>
      <P>This site links to other websites and may load content from other providers, such as a map. We do not control them and are not responsible for their content or practices.</P>

      <H>Our responsibility</H>
      <P>We provide this website and the free check "as is". To the extent the law allows, we are not liable for indirect or consequential loss, or for loss of profit, arising from using the website or the free check. Nothing in these terms limits any right you have under the Consumer Protection Act 68 of 2008 or any liability that cannot lawfully be excluded.</P>

      <H>Changes</H>
      <P>We may update these terms. The version on this page, with the date at the top, is the one that applies.</P>

      <H>Governing law and disputes</H>
      <P>These terms are governed by the laws of the Republic of South Africa. If we cannot resolve a complaint together, you may approach the National Consumer Commission or any other body or court with jurisdiction.</P>

      <H>Contact</H>
      <P>Questions about these terms: {mail(B.email)}.</P>
    </Shell>
  );
}

// ---------------------------------------------------------------- refund policy
export function RefundPolicy() {
  return (
    <Shell
      eyebrow="Legal"
      title="Refund policy"
      intro={<>This policy explains when you can cancel and when we refund payments for {withBrand("KODA")} web design, monthly growth plans and related services. It sits alongside your quote and does not limit your rights under the Consumer Protection Act 68 of 2008 (CPA).</>}
    >
      <H>Free services</H>
      <P>The free website check and the free homepage mock-up cost nothing, so there is nothing to refund.</P>

      <H>Cancelling before work starts</H>
      <P>If you cancel before we begin work, we refund every amount you have paid.</P>

      <H>Cancelling after work has started</H>
      <P>You may cancel at any time by telling us in writing. We will refund what you paid for work we have not yet done. We may keep a fair amount for work already completed and for costs we have already paid on your behalf and cannot recover, such as a domain registration. We will show you how we worked it out.</P>

      <H>If something is wrong with the work</H>
      <P>If we deliver work that is not as agreed, or not of the quality you are entitled to expect, tell us in writing and describe the problem. You have the right under section 54 of the CPA to have the service performed again properly or, if that is not possible, to a refund of a fair amount for the part that was not done properly. We will fix agreed problems at no charge.</P>

      <H>Monthly growth plans</H>
      <P>Our monthly plans (such as KODA Presence, KODA Growth and KODA Performance), and ongoing services such as website care, can be cancelled at any time with 20 business days' written notice. Email {mail(B.email)} to give notice.</P>
      <UL>
        <li><strong>During the notice period</strong> we keep delivering the plan, and you pay for it as normal.</li>
        <li><strong>Paid in advance.</strong> If you have paid for any period beyond the notice period, we refund it, less any reasonable cancellation charge allowed by law.</li>
        <li><strong>Work already delivered.</strong> We do not refund a month in which the agreed work was delivered.</li>
        <li><strong>Work not delivered.</strong> If an agreed monthly item was not delivered, such as a post or a report, we will deliver it, or credit or refund a fair amount for it.</li>
      </UL>

      <H>Advertising budgets and extra services</H>
      <P>Advertising budgets, extensive video production and professional photography are quoted separately, and your quote sets out how each is paid for and refunded. Money already paid to an advertising platform such as Google or Meta for advertising that has run cannot be refunded by us. If you paid us an advertising budget that has not yet been spent, we will refund the unspent part when the plan ends.</P>

      <H>Cooling-off for online agreements</H>
      <P>The Electronic Communications and Transactions Act 25 of 2002 may give you a seven day cooling-off period for some agreements concluded online. It does not apply once services have started with your consent within that period.</P>

      <H>How to ask for a refund</H>
      <P>Email {mail(B.email)} with your name, the business and what you are asking for. We will reply in writing with our decision and the reasons. Approved refunds are paid back to the account or card you used.</P>

      <H>Disputes</H>
      <P>If you are not happy with our decision, you may approach the National Consumer Commission or any other body or court with jurisdiction.</P>
    </Shell>
  );
}

// ---------------------------------------------------------------- cookie policy
export function CookiePolicy() {
  return (
    <Shell
      eyebrow="Legal"
      title="Cookie policy"
      intro={<>The {withBrand("KODA")} website does not set tracking or advertising cookies, and it does not use analytics. This page explains exactly what the site does and does not store on your device.</>}
    >
      <H>What cookies are</H>
      <P>Cookies are small files a website can save in your browser. Some are needed for a site to work; others track what you do or show you ads.</P>

      <H>What this website does</H>
      <UL>
        <li>It does not set any cookies of its own.</li>
        <li>It does not use Google Analytics or any similar visitor-tracking tool.</li>
        <li>It does not use advertising or retargeting pixels, for example from Meta or Google Ads.</li>
        <li>It does not save anything about you in your browser's local storage.</li>
        <li>Its fonts are served from the same website, not from Google Fonts or another provider.</li>
      </UL>

      <H>The map</H>
      <P>The contact section has a Google Maps map. It does not load until you press the button to show it. Once you do, Google receives your visit and may set its own cookies, under <a className="underline underline-offset-4" href="https://policies.google.com/privacy" rel="noopener noreferrer">Google's privacy policy</a>. If you do not press the button, nothing is sent to Google.</P>

      <H>Links to other services</H>
      <P>If you follow a link to WhatsApp, Gmail, or a client's website, that service has its own cookie rules.</P>

      <H>Server logs</H>
      <P>Our hosting provider keeps basic technical logs (such as IP address and browser) so the site stays secure and working. This is explained in the <a className="underline underline-offset-4" href="/privacy-policy">privacy policy</a>.</P>

      <H>If this changes</H>
      <P>If we add analytics or any non-essential cookies in future, we will ask for your consent before using them and update this page.</P>

      <H>Your choices</H>
      <P>You can delete or block cookies in your browser settings at any time.</P>
    </Shell>
  );
}
