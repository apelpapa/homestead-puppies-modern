import { Link } from "react-router";

import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us & The Build | Homestead Puppies" },
    {
      name: "description",
      content:
        "The family story and technical migration behind Homestead Puppies—from a production EJS application to a modern React frontend.",
    },
  ];
}

export default function About() {
  return (
    <>
      <section className="about-hero section-shell">
        <div>
          <p className="eyebrow">One family business · Two web eras</p>
          <h1>A small site that grew into something worth preserving.</h1>
        </div>
        <p className="about-lede">
          Homestead Puppies began as a straightforward website for a dad’s
          retirement puppy business. It became the operational center of the
          business—and a full-stack system that kept earning trust long after
          its first launch.
        </p>
      </section>

      <section className="section-shell origin-grid">
        <div className="origin-mark" aria-hidden="true">
          <img src="/brand/logo.png" width="220" height="220" alt="" />
        </div>
        <div className="prose-block">
          <p className="eyebrow">The origin</p>
          <h2>Built for family. Hardened by real use.</h2>
          <p>
            What started as “just a website” expanded into authentication,
            relational data, media processing, admin workflows, infrastructure,
            and long-term unattended operation. Non-technical family members
            could manage puppies and parents without touching code.
          </p>
          <p>
            That mattered more than chasing novelty. The original system worked,
            so this redesign treats it as an asset: keep the operations stable,
            expose a narrow read-only API, and give visitors a faster, clearer
            frontend.
          </p>
        </div>
      </section>

      <section className="migration-section">
        <div className="section-shell">
          <div className="section-heading centered">
            <p className="eyebrow">The migration strategy</p>
            <h2>Modernize the experience, not the risk.</h2>
            <p>The two public sites coexist, share one source of truth, and demonstrate an incremental migration in production.</p>
          </div>
          <div className="migration-grid">
            <article>
              <span className="tech-number">01</span>
              <h3>Legacy frontend</h3>
              <p>EJS templates continue serving the original site and its established admin workflow.</p>
              <strong>homestead-puppies.com</strong>
            </article>
            <article>
              <span className="tech-number">02</span>
              <h3>Shared core</h3>
              <p>Express, PostgreSQL, S3, and CloudFront remain the operational backbone.</p>
              <strong>One backend · One database</strong>
            </article>
            <article>
              <span className="tech-number">03</span>
              <h3>Modern frontend</h3>
              <p>React Router and TypeScript consume a versioned public catalog API.</p>
              <strong>homesteadpuppies.org</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell stack-section">
        <div>
          <p className="eyebrow">Under the hood</p>
          <h2>A production system, end to end.</h2>
        </div>
        <div className="stack-list">
          <div><span>Frontend</span><strong>React 19 · React Router · TypeScript · Vite</strong></div>
          <div><span>Backend</span><strong>Node.js · Express · EJS · Passport</strong></div>
          <div><span>Data</span><strong>PostgreSQL · server-side sessions</strong></div>
          <div><span>Media</span><strong>Sharp · S3 · CloudFront CDN</strong></div>
          <div><span>Operations</span><strong>Nginx · PM2 · Cloudflare · DigitalOcean</strong></div>
        </div>
      </section>

      <section className="section-shell closing-cta about-cta">
        <div>
          <p className="eyebrow">See it in action</p>
          <h2>The best architecture diagram is a working product.</h2>
          <p>Browse the live catalog here, then compare it with the original EJS presentation.</p>
        </div>
        <div className="button-row">
          <a className="button secondary" href="https://homestead-puppies.com" target="_blank" rel="noreferrer">Open legacy site</a>
          <Link className="button primary" to="/puppies">Meet the puppies</Link>
        </div>
      </section>
    </>
  );
}
