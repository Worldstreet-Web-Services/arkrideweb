import { Container } from "../layout/Container";
import { getPublicStats } from "@/lib/api/stats";

/**
 * Live numbers from the API.
 *
 * A Server Component, so the fetch happens on the server and the browser gets
 * HTML — no loading spinner, no client-side waterfall, and the API URL and any
 * credentials never reach the bundle.
 *
 * Renders NOTHING when the API is unreachable or has nothing to show yet. An
 * empty stats band reading "0 rides completed" is worse than no band at all,
 * and a pre-launch product showing zeros undermines every other claim on the
 * page.
 */
function format(n: number): string {
  return new Intl.NumberFormat("en-NG", { notation: "compact" }).format(n);
}

export async function Numbers() {
  const stats = await getPublicStats();
  if (!stats) return null;

  const items = [
    { value: stats.completedRides, label: "rides completed" },
    { value: stats.activeDrivers, label: "verified drivers" },
    { value: stats.riders, label: "riders on ArkRide" },
    { value: stats.coverageAreas, label: "areas covered" },
  ].filter((item) => item.value > 0);

  // Fewer than two real numbers is not a statistics section.
  if (items.length < 2) return null;

  return (
    <section className="py-16 md:py-20">
      <Container>
        <dl className="grid gap-6 rounded-2xl border border-border bg-surface px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block text-7xl font-bold text-text">
                  {format(item.value)}
                  <span aria-hidden="true" className="text-primary">
                    +
                  </span>
                </span>
                <span className="mt-1 block text-base text-text-muted">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
