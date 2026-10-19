import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone } from "@phosphor-icons/react";
import { Button, Eyebrow, Headline, Reveal, Koda } from "./ui.jsx";
import { EMAIL, PHONE, openCompose, openGmailCompose } from "../lib/utils.js";

const empty = { name: "", email: "", phone: "", business: "", message: "", consent: false };

function Field({ label, error, id, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">{label}</label>
      {children}
      {error && <span id={`${id}-error`} role="alert" className="text-sm text-[#FF9A8B]">{error}</span>}
    </div>
  );
}

// The Google map is only loaded once the visitor asks for it, so opening this page sends nothing to Google.
function ServiceMap() {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-8 h-44 overflow-hidden rounded-2xl ring-1 ring-paper/10">
      {show ? (
        <iframe
          title="Map of Durban, our service area"
          src="https://www.google.com/maps?q=Durban,+South+Africa&output=embed"
          className="h-full w-full"
          style={{ border: 0, filter: "grayscale(1) invert(0.92) contrast(1.05)" }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="grid h-full content-center justify-items-start gap-3 bg-ink2 p-5">
          <p className="text-[14px] leading-[1.55] text-paper/70">Durban, South Africa. The map is provided by Google, which receives your visit when it loads.</p>
          <button type="button" onClick={() => setShow(true)} className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-ink transition-colors hover:bg-accent">Show map</button>
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const sentRef = useRef(null);
  const formRef = useRef(null);

  // Keep keyboard and screen reader users oriented when the form is replaced by the confirmation.
  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  const change = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = "Please tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Please enter a valid email address.";
    if (!form.consent) er.consent = "Please tick the box so we can use your details to reply.";
    setErrors(er);
    if (Object.keys(er).length) {
      formRef.current?.querySelector(`[name="${Object.keys(er)[0]}"]`)?.focus();
      return;
    }
    // There is no server behind this form yet, so it prepares an email to send to us.
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      form.business && `Business: ${form.business}`,
      "",
      form.message,
    ].filter((l) => l !== "" && l !== false).join("\n");
    openCompose({ subject: `Website enquiry from ${form.name}`, body });
    setSent(true);
  };

  return (
    <section id="contact" className="sec bg-ink text-paper">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <Eyebrow light>Get in touch</Eyebrow>
          <Headline light className="h-section mt-5">
            Tell us about <em>your business.</em>
          </Headline>
          <p className="mt-6 max-w-[40ch] text-[15px] leading-[1.7] text-paper/65">
            Fill in the form or reach us directly. We reply within one working day. Only an idea so far? That is perfectly fine, and there is no pressure.
          </p>

          <ul className="mt-9 grid gap-0 border-t border-paper/15">
            {PHONE.digits && (
              <li className="border-b border-paper/15">
                <a href={`tel:+${PHONE.digits}`} className="group flex items-center justify-between py-5">
                  <span>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Call us</span>
                    <span className="mt-1 block font-display text-2xl">{PHONE.display}</span>
                  </span>
                  <Phone size={20} className="text-paper/60 transition-colors group-hover:text-accent" />
                </a>
              </li>
            )}
            <li className="border-b border-paper/15">
              <a href={`mailto:${EMAIL}`} onClick={openGmailCompose} className="group flex items-center justify-between gap-4 py-5">
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Email us</span>
                  <span className="mt-1 block break-words font-display text-[1.05rem] normal-case tracking-normal sm:text-2xl">{EMAIL}</span>
                </span>
                <ArrowUpRight size={22} className="shrink-0 text-paper/60 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </a>
            </li>
            <li className="border-b border-paper/15 py-5">
              <span className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">Hours</span>
              <span className="mt-1 block text-lg">Monday to Friday, 09:00 to 17:00</span>
            </li>
          </ul>

          <ServiceMap />
        </Reveal>

        <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
          {sent ? (
            <div role="status" className="grid min-h-[22rem] content-center border-t border-paper/15 pt-10">
              <h3 ref={sentRef} tabIndex={-1} className="font-display text-2xl leading-tight outline-none">Your email is ready, {form.name.split(" ")[0] || "there"}.</h3>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.7] text-paper/65">
                We opened a message addressed to {EMAIL} with your details. Press send in that window and we'll reply within one working day. If nothing opened, email us directly at {EMAIL}.
              </p>
              <button onClick={() => { setSent(false); setForm(empty); }} className="mt-8 w-fit border-b border-paper/40 pb-0.5 text-sm transition-colors hover:border-paper hover:text-paper">
                Start again
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-7 sm:grid-cols-2">
              <Field label="Full name" id="f-name" error={errors.name}>
                <input id="f-name" name="name" value={form.name} onChange={change} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "f-name-error" : undefined} className="field" />
              </Field>
              <Field label="Email" id="f-email" error={errors.email}>
                <input id="f-email" name="email" type="email" value={form.email} onChange={change} placeholder="you@business.co.za" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "f-email-error" : undefined} className="field" />
              </Field>
              <Field label="Phone (optional)" id="f-phone">
                <input id="f-phone" name="phone" value={form.phone} onChange={change} placeholder="082 000 0000" autoComplete="tel" className="field" />
              </Field>
              <Field label="Business name (optional)" id="f-business">
                <input id="f-business" name="business" value={form.business} onChange={change} placeholder="Your business" className="field" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="What do you need help with?" id="f-message">
                  <textarea id="f-message" name="message" value={form.message} onChange={change} rows={4} placeholder="Tell us about your business or your idea, and what you're looking for." className="field resize-none" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-consent" className="flex min-h-11 items-start gap-3 py-1 text-[14px] leading-[1.55] text-paper/70">
                  <input id="f-consent" type="checkbox" name="consent" checked={form.consent} onChange={change} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "f-consent-error" : undefined} className="mt-0.5 h-6 w-6 shrink-0 accent-[#BDF64F]" />
                  <span>
                    I agree that <Koda /> may use my details to reply to this enquiry and, if we work together, to prepare a quote. I can ask for them to be deleted at any time. See the <a href="/privacy-policy" className="underline underline-offset-4 hover:text-paper">privacy policy</a>.
                  </span>
                </label>
                {errors.consent && <span id="f-consent-error" role="alert" className="mt-1 block text-sm text-[#FF9A8B]">{errors.consent}</span>}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="lime">Book a free consultation</Button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
