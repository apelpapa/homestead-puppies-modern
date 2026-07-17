import { useMemo, useState } from "react";

import type { Route } from "./+types/parents";
import { useParents } from "../catalog";
import { CatalogMessage, ParentCard } from "../components/dog-cards";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Our Parent Dogs | Homestead Puppies" },
    { name: "description", content: "Meet the parent dogs behind the Homestead Puppies family." },
  ];
}

export default function Parents() {
  const { data: parents, loading, error } = useParents();
  const [breed, setBreed] = useState("All breeds");
  const breeds = useMemo(
    () => [...new Set(parents.map((parent) => parent.breed))].sort(),
    [parents],
  );
  const filtered = parents.filter((parent) => breed === "All breeds" || parent.breed === breed);

  return (
    <>
      <section className="page-hero section-shell compact parents-hero">
        <p className="eyebrow">The Homestead family</p>
        <h1>Meet the parents</h1>
        <p>Get to know the dogs behind each litter, including breed, age, registration, and family lineage.</p>
      </section>
      <section className="section-shell catalog-section">
        <div className="filter-bar simple" aria-label="Filter parent dogs">
          <label>
            <span>Breed</span>
            <select value={breed} onChange={(event) => setBreed(event.target.value)}>
              <option>All breeds</option>
              {breeds.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <p className="result-count" aria-live="polite">
            {loading ? "Loading the family…" : `${filtered.length} ${filtered.length === 1 ? "parent" : "parents"}`}
          </p>
        </div>
        <CatalogMessage loading={loading} error={error} />
        {!loading && !error && filtered.length > 0 && (
          <div className="dog-grid parent-grid">
            {filtered.map((parent, index) => <ParentCard key={parent.id} parent={parent} eager={index < 2} />)}
          </div>
        )}
      </section>
    </>
  );
}
