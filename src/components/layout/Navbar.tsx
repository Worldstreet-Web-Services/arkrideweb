import { Container } from "./Container";

/**
 * Navbar — populated from Figma designs when available.
 * All colors/spacing pull from CSS tokens in globals.css.
 */
export function Navbar() {
  return (
    <header
      className="sticky top-0 z-[var(--z-sticky)] w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <span className="text-[var(--text-xl)] font-[var(--font-bold)] text-[var(--color-text)]">
            Arkride
          </span>

          {/* Nav links — fill in from Figma */}
          <div className="hidden md:flex items-center gap-[var(--space-8)]">
            {/* TODO: add nav items */}
          </div>

          {/* CTA — fill in from Figma */}
          <div className="flex items-center gap-[var(--space-3)]">
            {/* TODO: add buttons */}
          </div>
        </nav>
      </Container>
    </header>
  );
}
