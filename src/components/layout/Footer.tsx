import Link from "next/link";
import { Container } from "./Container";
import { ArkLogo } from "../brand/ArkLogo";

/**
 * Footer. Replaces a single copyright line and a
 * `{/* TODO: populate from Figma *\/}`.
 *
 * Only links to things that exist. A footer full of dead hrefs is worse than a
 * short one — every 404 is a small withdrawal from the visitor's trust.
 */
const GROUPS = [
  {
    title: "Ride",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#features", label: "Features" },
      { href: "/#get-the-app", label: "Get the app" },
    ],
  },
  {
    title: "Drive",
    links: [
      { href: "/#drive", label: "Drive with ArkRide" },
      { href: "/verify", label: "Driver verification" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-text">
              <ArkLogo width={92} title="ArkRide" />
              <span className="text-md font-semibold tracking-tight">RIDE</span>
            </div>
            <p className="mt-4 max-w-xs text-base text-text-muted">
              Request a ride, hop in, and get where you&apos;re going.
            </p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
              <h2
                id={`footer-${group.title}`}
                className="text-sm font-semibold uppercase tracking-[0.08em] text-text-subtle"
              >
                {group.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-subtle">
            © {new Date().getFullYear()} ArkRide. Lagos, Nigeria.
          </p>
          <p className="text-sm text-text-subtle">
            Emergencies: dial 112 or use SOS in the app.
          </p>
        </div>
      </Container>
    </footer>
  );
}
