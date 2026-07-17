import { useMemo, useState } from "react";

import type { Route } from "./+types/puppies";
import { usePuppies } from "../catalog";
import { CatalogMessage, PuppyCard } from "../components/dog-cards";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Available Puppies | Homestead Puppies" },
    { name: "description", content: "Browse available Homestead Puppies with live photos, lineage, age, and pricing." },
  ];
}

export default function Puppies() {
  const { data: puppies, loading, error } = usePuppies();
  const [breed, setBreed] = useState("All breeds");
  const [gender, setGender] = useState("All genders");
  const breeds = useMemo(
    () => [...new Set(puppies.map((puppy) => puppy.breed))].sort(),
    [puppies],
  );
  const filtered = puppies.filter(
    (puppy) =>
      (breed === "All breeds" || puppy.breed === breed) &&
      (gender === "All genders" || puppy.gender === gender),
  );

  return (
    <>
      <section className="page-hero section-shell compact">
        <p className="eyebrow">Live availability</p>
        <h1>Meet the puppies</h1>
        <p>Every card is pulled from the same live catalog used by the original Homestead Puppies site.</p>
      </section>
      <section className="section-shell catalog-section">
        <div className="filter-bar" aria-label="Filter puppies">
          <label>
            <span>Breed</span>
            <select value={breed} onChange={(event) => setBreed(event.target.value)}>
              <option>All breeds</option>
              {breeds.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>Gender</span>
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option>All genders</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </label>
          <p className="result-count" aria-live="polite">
            {loading ? "Checking availability…" : `${filtered.length} ${filtered.length === 1 ? "puppy" : "puppies"}`}
          </p>
        </div>
        <CatalogMessage loading={loading} error={error} />
        {!loading && !error && filtered.length > 0 && (
          <div className="dog-grid">
            {filtered.map((puppy, index) => <PuppyCard key={puppy.id} puppy={puppy} eager={index < 2} />)}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <h2>No matching puppies</h2>
            <p>Try another filter or contact us about upcoming availability.</p>
            <button className="button secondary" type="button" onClick={() => { setBreed("All breeds"); setGender("All genders"); }}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
