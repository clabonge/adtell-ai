import { businessFacts } from "@/content/site";

export function BusinessFacts({
  business,
}: {
  business: { runningSince?: string; tools?: readonly string[] };
}) {
  const line = businessFacts(business);
  if (!line) return null;
  return <p className="mt-2 text-base leading-relaxed text-quiet">{line}</p>;
}
