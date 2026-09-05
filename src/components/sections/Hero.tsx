import Link from "next/link";
import { Container } from "../layout/Container";
import { Button } from "../ui/Button";

/**
 * The landing hero.
 *
 * Copy is the app's own, not new marketing writing: "Move at the speed of now"
 * and "Request a ride, hop in, and get where you're going." are the onboarding
 * headline and subhead from `OnboardingCarousel.tsx`. A visitor who installs
 * after reading this sees the same sentence on first launch.
 *
 * The layout follows the app's signature move — content lifting over a warm
 * surface on a large soft radius — rather than the stock two-column-with-a-
 * screenshot that every ride-hailing site uses.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* The amber bloom. One diffuse light source behind the headline, which
          is how the app treats its accent — never a hard gradient band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-pill bg-primary/20 blur-[120px]"
      />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-pill border border-primary-border bg-primary-tint px-3 py-1.5 text-sm font-semibold text-primary-ink">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-pill bg-primary"
            />
            Now rolling across Lagos
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-text sm:text-5xl md:text-display">
            Move at the
            <br />
            speed of now
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-text-muted md:text-xl">
            Request a ride, hop in, and get where you&apos;re going. Keke, okada
            or car — booked in the app, by voice, or over WhatsApp.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/#get-the-app" className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="sm:w-56">
                Get the app
              </Button>
            </Link>
            <Link href="/#drive" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                fullWidth
                className="sm:w-56"
              >
                Drive with ArkRide
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-text-subtle">
            Fixed prices. 1% cashback on every trip.
          </p>
        </div>

        {/* The three things that actually differentiate this product. Real
            claims taken from what the app and the backend genuinely do —
            fixed fares, voice booking, and an SOS that reaches a human. */}
        <ul className="ark-stagger mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              title: "Fixed price, upfront",
              body: "You see the fare before you book. It does not move while you ride.",
            },
            {
              title: "Book by voice",
              body: "Say where you're going. No typing, no map-pinching, no spelling.",
            },
            {
              title: "SOS that reaches someone",
              body: "One tap alerts Ark Security, responders and your trusted contacts.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-border bg-surface p-5 text-left"
            >
              <h2 className="text-md font-bold text-text">{item.title}</h2>
              <p className="mt-1.5 text-base leading-normal text-text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
