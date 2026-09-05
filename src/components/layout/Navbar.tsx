"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "./Container";
import { ArkLogo } from "../brand/ArkLogo";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

/**
 * The marketing header.
 *
 * Replaces two `{/* TODO *\/}` placeholders. Behaviour worth knowing:
 *
 *  - It starts TRANSPARENT over the hero and only grows a background and a
 *    hairline once you scroll. The hero is a photograph; a solid bar sitting on
 *    top of it from the first paint cuts the image in half.
 *  - The mobile menu is a real disclosure: `aria-expanded`, `aria-controls`,
 *    Escape to close, and focus is not trapped because the panel is inline
 *    rather than a modal.
 *  - `overflow` is locked while the panel is open so the page behind does not
 *    scroll under it on iOS.
 */
const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#drive", label: "Drive with us" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // `passive` because this listener never calls preventDefault — without it
    // the browser cannot optimise scrolling on touch devices.
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "bg-surface/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <Container>
        <nav
          className="flex h-16 items-center justify-between gap-6 md:h-20"
          aria-label="Main"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-text transition-opacity hover:opacity-70"
          >
            <ArkLogo width={92} title="ArkRide home" />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-base font-medium text-text-muted transition-colors hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/driver-login">
              <Button variant="ghost" size="sm">
                Drive with us
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Book a ride</Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 grid size-10 place-items-center rounded-pill text-text transition-colors hover:bg-surface-hover md:hidden"
          >
            {/* Two bars that cross into an X. Cheaper and smoother than
                swapping icons, and it survives reduced-motion because only the
                transform is animated. */}
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded-pill bg-current transition-transform duration-200",
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded-pill bg-current transition-transform duration-200",
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0.5",
                )}
              />
            </span>
          </button>
        </nav>
      </Container>

      {/* Inline panel rather than an overlay: it pushes nothing, needs no focus
          trap, and cannot strand a screen-reader user behind a scrim. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-surface md:hidden"
      >
        <Container>
          <ul className="flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-lg font-medium text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pb-5">
            <Link href="/driver-login" onClick={() => setOpen(false)}>
              <Button variant="ghost" fullWidth>
                Drive with us
              </Button>
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" fullWidth>
                Sign in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button fullWidth>Book a ride</Button>
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
