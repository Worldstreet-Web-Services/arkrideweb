import { Container } from "./Container";

/**
 * Footer — populated from Figma designs when available.
 */
export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <Container>
        <div className="py-[var(--space-12)]">
          {/* TODO: populate from Figma */}
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Arkride. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
