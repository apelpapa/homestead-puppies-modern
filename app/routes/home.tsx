import { Link } from "react-router";

import type { Route } from "./+types/home";
import { usePuppies } from "../catalog";
import { CatalogMessage, PuppyCard } from "../components/dog-cards";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Homestead Puppies | Family Raised, Thoughtfully Built" },
    {
      name: "description",
      content:
        "Meet available Homestead Puppies and explore the modern React experience built on a proven family-business backend.",
    },
  ];
}

export default function Home() {
  const { data: puppies, loading, error } = usePuppies();
  const heroPuppy = puppies.find((puppy) => puppy.name.toLowerCase() === "cooper") || puppies[0];
  const featured = puppies.slice(0, 3);

  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">Family raised · Production proven</p>
          <h1>
            Find your puppy.
            <span>See the craft behind the experience.</span>
          </h1>
          <p className="hero-lede">
            Homestead Puppies is a real family business and a living full-stack
            case study—one trusted backend, now serving two generations of the web.
          </p>
          <div className="button-row">
            <Link className="button primary" to="/puppies">
              Meet the puppies
            </Link>
            <Link className="button secondary" to="/about">
              Read our story
            </Link>
          </div>
          <div className="hero-proof" aria-label="Project highlights">
            <div><strong>1</strong><span>shared backend</span></div>
            <div><strong>2</strong><span>frontend generations</span></div>
            <div><strong>24/7</strong><span>production ready</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrap">
            {heroPuppy?.images[0] ? (
              <img
                src={heroPuppy.images[0]}
                alt={`${heroPuppy.name}, an available ${heroPuppy.breed} puppy`}
                width="1200"
                height="900"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="hero-image-placeholder">
                <img src="/brand/logo.png" width="160" height="160" alt="" />
              </div>
            )}
          </div>
          <div className="hero-note">
            <span className="live-dot" aria-hidden="true" />
            <div>
              <small>Live from the catalog</small>
              <strong>{heroPuppy ? `${heroPuppy.name} · ${heroPuppy.breed}` : "Fetching available puppies"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-strip">
        <p>
          The original EJS site still runs. This React frontend reads the same
          dogs, photos, and availability through a focused public API.
        </p>
        <a href="https://homestead-puppies.com" target="_blank" rel="noreferrer">
          Compare the legacy site <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="section-shell section-block" aria-labelledby="featured-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Ready to meet you</p>
            <h2 id="featured-heading">Available puppies</h2>
          </div>
          <Link className="text-link" to="/puppies">
            View every puppy <span aria-hidden="true">→</span>
          </Link>
        </div>
        <CatalogMessage loading={loading} error={error} />
        {!loading && !error && featured.length > 0 && (
          <div className="dog-grid featured-grid">
            {featured.map((puppy, index) => (
              <PuppyCard key={puppy.id} puppy={puppy} eager={index === 0} />
            ))}
          </div>
        )}
        {!loading && !error && featured.length === 0 && (
          <div className="empty-state">
            <h3>No puppies are listed right now.</h3>
            <p>Check back soon or contact us about future availability.</p>
          </div>
        )}
      </section>

      <section className="story-band">
        <div className="section-shell story-grid">
          <div className="story-copy">
            <p className="eyebrow light">A purposeful migration</p>
            <h2>Old foundation. New front door.</h2>
            <p>
              The backend already handled authentication, PostgreSQL data,
              image processing, CloudFront delivery, and the admin workflow. The
              smart move was to preserve that proven system and create a modern,
              independent experience around it.
            </p>
            <Link className="button light" to="/about">
              Explore the architecture
            </Link>
          </div>
          <ol className="architecture-steps">
            <li><span>01</span><div><strong>Manage once</strong><p>Family members keep using the familiar admin tools.</p></div></li>
            <li><span>02</span><div><strong>Serve through one API</strong><p>Express publishes only the catalog data visitors need.</p></div></li>
            <li><span>03</span><div><strong>Present two ways</strong><p>The legacy EJS and modern React sites stay live together.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section-shell closing-cta">
        <div>
          <p className="eyebrow">Found the right fit?</p>
          <h2>Take the next step with confidence.</h2>
          <p>Confirm the puppy, ask any questions, and place your deposit securely through PayPal.</p>
        </div>
        <div className="button-row">
          <a className="button secondary" href="https://homestead-puppies.com/contact">Contact us</a>
          <Link className="button primary" to="/deposit">Place a deposit</Link>
        </div>
      </section>
    </>
  );
}
