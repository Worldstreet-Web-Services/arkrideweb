import { Container } from "../layout/Container";

/**
 * What the product actually ships.
 *
 * Every claim here maps to something real in the codebase — the wallet and
 * ledger, the fuel-support advance, the SOS incident flow, the WhatsApp/voice
 * booking ingress, interstate aggregation, and the fixed 95/4/1 fare split.
 * Nothing aspirational: a feature grid that promises things the app cannot do
 * is the fastest way to lose a first-time rider.
 */
const FEATURES = [
  {
    title: "Ark Wallet",
    body: "Top up with LinkPay, a bank transfer or a card. Cashback lands here, and every ride is itemised.",
  },
  {
    title: "Vivid Voice",
    body: "Speak your destination instead of typing it. Useful in traffic, at night, and for anyone who finds address entry a chore.",
  },
  {
    title: "Book on WhatsApp",
    body: "No app, no data plan, no problem. Send a message the way you'd tell a friend, and a ride comes back.",
  },
  {
    title: "Safety Center",
    body: "A silent SOS that calls your trusted contact discreetly, shares live location, and alerts Ark Security and responders.",
  },
  {
    title: "Interstate travel",
    body: "Compare coaches and flights between cities, book, and pay from the same wallet you use for rides.",
  },
  {
    title: "Fuel support for drivers",
    body: "Start a shift with a fuel advance from our MFB partner instead of waiting on the day's first fares.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-text-subtle">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold text-text md:text-6xl">
            Built for how Lagos actually moves
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary-border"
            >
              <h3 className="text-xl font-bold text-text">{f.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-text-muted">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
