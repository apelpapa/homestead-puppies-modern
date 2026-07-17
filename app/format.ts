export function formatCurrency(value: number | null) {
  if (value == null) return "Contact us";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDogAge(dateOfBirth: string | null, kind: "puppy" | "adult") {
  if (!dateOfBirth) return "Age available on request";

  const born = new Date(`${dateOfBirth}T00:00:00`);
  const now = new Date();
  if (Number.isNaN(born.getTime()) || born > now) return "Age available on request";

  const totalDays = Math.max(
    0,
    Math.floor((now.getTime() - born.getTime()) / 86_400_000),
  );

  if (kind === "puppy" || totalDays < 365) {
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    return `${weeks} week${weeks === 1 ? "" : "s"}${days ? `, ${days} day${days === 1 ? "" : "s"}` : ""}`;
  }

  const years = Math.floor(totalDays / 365.2425);
  return `${years} year${years === 1 ? "" : "s"} old`;
}
