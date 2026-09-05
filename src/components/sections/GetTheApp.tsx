import { Container } from "../layout/Container";

/**
 * The app CTA the navbar and hero both point at.
 *
 * Store links are NOT wired yet — the mobile app is pre-release and the
 * `assets/icon.png` in that repo is still a 1x1 placeholder, so there are no
 * listings to link to. Rather than ship two dead buttons, this states the
 * position honestly and offers the one route that does work today: WhatsApp
 * booking, which the backend already serves through
 * `/api/v1/booking-channels/parse-and-book`.
 *
 * When the listings exist, swap the notice for the two store badges.
 */
export function GetTheApp() {
  return (
    <section id="get-the-app" className="scroll-mt-24 pb-24 md:pb-32">
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-surface px-6 py-14 text-center md:px-14">
          <h2 className="text-3xl font-bold text-text md:text-4xl">
            No app? Book on WhatsApp
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-text-muted">
            Send a message the way you&apos;d tell a friend where you&apos;re
            going. No download, and it works on any phone.
          </p>

          <p className="mx-auto mt-8 inline-flex items-center gap-2 rounded-pill bg-surface-sunken px-4 py-2 text-base text-text-muted">
            <span aria-hidden="true" className="size-2 rounded-pill bg-primary" />
            iOS and Android apps are in testing
          </p>
        </div>
      </Container>
    </section>
  );
}
