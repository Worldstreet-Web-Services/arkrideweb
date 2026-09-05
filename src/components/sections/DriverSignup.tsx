import Link from "next/link";
import { Container } from "../layout/Container";
import { Button } from "../ui/Button";

/**
 * The driver conversion block — and the entry point to the flow this site
 * already implements.
 *
 * `/verify` is not a marketing link: it is the nine-step KYC portal in
 * `src/verification`, which the mobile driver app also deep-links into
 * (`arkride-mobile/src/constants/links.ts`). So this section is where the
 * marketing site and the actual product meet.
 *
 * The numbers below come from the backend's real fare split
 * (`money.util.ts`: DRIVER_SHARE 0.95) and the fuel-support cap
 * (MFB_DAILY_FUEL_LIMIT). Stating "keep 95%" is only honest because the ledger
 * genuinely pays 95/4/1.
 */
export function DriverSignup() {
  return (
    <section id="drive" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        {/* The one dark object on the page. Mobile uses exactly this move for
            its wallet hero — an ink card carrying the money message. */}
        <div className="relative overflow-hidden rounded-3xl bg-surface-inverse px-6 py-14 md:px-14 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-pill bg-primary/20 blur-[100px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">
                Drive with ArkRide
              </p>
              <h2 className="mt-3 text-4xl font-bold text-on-inverse md:text-6xl">
                Keep 95% of every fare
              </h2>
              <p className="mt-4 max-w-md text-lg text-on-inverse-muted">
                Not a promotional rate that expires. Ninety-five percent is the
                split written into how we settle every completed trip.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/verify" className="w-full sm:w-auto">
                  <Button size="lg" fullWidth className="sm:w-52">
                    Start verification
                  </Button>
                </Link>
                <Link href="/#how-it-works" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    fullWidth
                    className="sm:w-40 border-white/25 text-on-inverse hover:bg-white/10"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-on-inverse-muted">
                Takes about 10 minutes. You can stop and pick it up later.
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                { k: "95%", v: "of every fare is yours" },
                { k: "₦3,000", v: "fuel credit to start a shift" },
                { k: "Instant", v: "payouts to your bank" },
                { k: "1%", v: "cashback for your riders" },
              ].map((stat) => (
                <div
                  key={stat.k}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <dt className="text-4xl font-bold text-primary">{stat.k}</dt>
                  <dd className="mt-1 text-base text-on-inverse-muted">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
