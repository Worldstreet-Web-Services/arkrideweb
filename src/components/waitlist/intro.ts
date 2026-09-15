/**
 * Shared by the waitlist layout (server) and LogoIntro (client). Kept in a
 * plain module: a string exported from a "use client" file would reach the
 * server component as a client reference, not as the string.
 */
export const INTRO_SEEN_KEY = "ark-waitlist-intro-seen";

/**
 * Runs inline during HTML parsing. Plays the intro only for a first visit in
 * this browser session, never for people who prefer reduced motion, and never
 * if storage is unavailable. Records when the splash first painted so the
 * two-second hold counts from what the person saw, not from hydration.
 */
export const INTRO_BOOT_SCRIPT = `try{if(!sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)})&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("data-intro","hold");window.__arkIntroAt=performance.now()}}catch(e){}`;
