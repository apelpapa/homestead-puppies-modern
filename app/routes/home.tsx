import type { Route } from "./+types/home";
import { apiBaseUrl } from "../api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Homestead Puppies | Modern Frontend" },
    {
      name: "description",
      content:
        "A modern React frontend for the Homestead Puppies portfolio project.",
    },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
          Modern frontend scaffold
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-7xl">
          Homestead Puppies
        </h1>
        <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
          React Router, TypeScript, Vite, and Tailwind CSS are ready. The
          frontend is configured for static deployment and will consume the
          existing Express backend through a versioned API.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          API base: <code className="font-mono">{apiBaseUrl}</code>
        </p>
      </section>
    </main>
  );
}
