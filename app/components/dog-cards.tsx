import { Link } from "react-router";

import { formatCurrency, formatDogAge } from "../format";
import type { Parent, Puppy } from "../types";
import { PhotoCarousel } from "./photo-carousel";

export function PuppyCard({ puppy, eager = false }: { puppy: Puppy; eager?: boolean }) {
  return (
    <article className="dog-card puppy-card">
      <PhotoCarousel images={puppy.images} name={puppy.name} eager={eager} />
      <div className="dog-card-body">
        <div className="dog-card-heading">
          <div>
            <p className="eyebrow">{puppy.breed}</p>
            <h2>{puppy.name}</h2>
          </div>
          <span className="availability-pill">Available</span>
        </div>
        <dl className="dog-facts">
          <div>
            <dt>Gender</dt>
            <dd>{puppy.gender || "Ask us"}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{formatDogAge(puppy.dateOfBirth, "puppy")}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{formatCurrency(puppy.price)}</dd>
          </div>
        </dl>
        {(puppy.mother || puppy.father) && (
          <p className="lineage">
            {puppy.mother && <span>Dam: {puppy.mother}</span>}
            {puppy.father && <span>Sire: {puppy.father}</span>}
          </p>
        )}
        {puppy.akcRegistrable && <p className="registration-note">AKC registrable</p>}
        <div className="card-actions">
          <Link className="button primary small" to={`/deposit?puppy=${encodeURIComponent(puppy.name)}`}>
            Deposit for {puppy.name}
          </Link>
          <a className="text-link" href="https://homestead-puppies.com/contact">
            Ask a question <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function ParentCard({ parent, eager = false }: { parent: Parent; eager?: boolean }) {
  return (
    <article className="dog-card parent-card">
      <PhotoCarousel images={parent.images} name={parent.name} eager={eager} />
      <div className="dog-card-body">
        <div className="dog-card-heading">
          <div>
            <p className="eyebrow">{parent.breed}</p>
            <h2>{parent.name}</h2>
          </div>
          {parent.gender && <span className="gender-pill">{parent.gender}</span>}
        </div>
        <p className="parent-description">
          {parent.description || "A loved member of the Homestead Puppies family."}
        </p>
        <div className="parent-meta">
          <span>{formatDogAge(parent.dateOfBirth, "adult")}</span>
          {parent.akcRegistered && <span>AKC registered</span>}
          {parent.championBloodline && <span>Champion bloodline</span>}
        </div>
      </div>
    </article>
  );
}

export function CatalogMessage({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="catalog-message" role="status">
        <span className="loader" aria-hidden="true" />
        Loading the live catalog…
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-message error" role="alert">
        <p>{error}</p>
        <a className="text-link" href="https://homestead-puppies.com/availablePuppies">
          View the legacy catalog <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  return null;
}
