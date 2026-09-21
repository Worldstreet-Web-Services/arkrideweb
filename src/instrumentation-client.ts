import posthog from "posthog-js";

/**
 * Product analytics (PostHog). Runs in the browser before the app is
 * interactive — Next's `instrumentation-client` convention.
 *
 * OPT-IN. With `NEXT_PUBLIC_POSTHOG_KEY` unset this does nothing and the page
 * is exactly what it was, so a fresh clone or a preview build ships no
 * analytics and makes no request.
 *
 * WHY `/ingest` AND NOT posthog.com
 *
 * Events go to this app's own origin, which `next.config.ts` rewrites to
 * PostHog. Two reasons, both about not losing the numbers this exists to give:
 *   - Ad-blockers block posthog.com by name. A waitlist conversion rate that
 *     silently drops the visitors most likely to run a blocker is wrong in a
 *     way nobody would notice.
 *   - The CSP needs no new entry. `connect-src 'self'` already covers it, and
 *     every relaxation in that policy is one the app genuinely breaks without.
 *
 * WHAT IS DELIBERATELY OFF
 *
 * This is a page where people type an email address and a phone number.
 *   - No session recording: it would film the form as it is filled in.
 *   - No autocapture: it records the text of what is clicked, and the labels
 *     around a form are one careless field away from being personal data.
 *   - No person profiles for anonymous visitors: they are counted, not
 *     catalogued (`identified_only`).
 *   - Do Not Track is honoured.
 * What IS measured is chosen by hand, in `src/lib/analytics.ts`, and never
 * includes a name, email or phone number.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  // Analytics must never be able to break the page it is measuring.
  try {
    posthog.init(key, {
      api_host: "/ingest",
      person_profiles: "identified_only",
      // The App Router changes pages without a reload, so the default
      // once-per-load pageview would miss every client-side navigation.
      capture_pageview: "history_change",
      autocapture: false,
      disable_session_recording: true,
      respect_dnt: true,
    });
  } catch (error) {
    console.warn("PostHog failed to initialise; analytics are off.", error);
  }
}
