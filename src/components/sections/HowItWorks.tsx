import { Container } from "../layout/Container";

/**
 * Three steps, in the app's own vocabulary.
 *
 * Deliberately not the usual "Download / Request / Ride" — that describes every
 * ride app ever made. These are the moments ArkRide actually does differently:
 * you can speak the destination, drivers bid and you pick, and the price you
 * were quoted is the price you pay.
 */
const STEPS = [
  {
    n: "01",
    title: "Say where you're going",
    body: "Type it, or tap the mic and speak it. We resolve the address and show you the fare before anything is booked.",
  },
  {
    n: "02",
    title: "Pick your driver",
    body: "Nearby drivers get notified and respond. You see each one's rating, vehicle and arrival time, then choose — rather than being assigned.",
  },
  {
    n: "03",
    title: "Ride, and get 1% back",
    body: "The fare is fixed at what you were quoted. One percent comes back to your Ark wallet on every completed trip.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-text-subtle">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-bold text-text md:text-6xl">
            Three taps from here to there
          </h2>
        </div>

        <ol className="ark-stagger mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="relative rounded-2xl border border-border bg-surface p-6"
            >
              <span
                aria-hidden="true"
                className="text-2xl font-bold text-primary"
              >
                {step.n}
              </span>
              <h3 className="mt-3 text-xl font-bold text-text">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
