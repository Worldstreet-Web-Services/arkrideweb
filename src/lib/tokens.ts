/**
 * Design tokens — JS mirror of globals.css variables.
 * Use these when CSS variables aren't accessible (e.g. canvas, charts, animations).
 * For everything else, use the CSS variables or Tailwind classes directly.
 */

export const tokens = {
  colors: {
    primary:       "var(--color-primary)",
    primaryHover:  "var(--color-primary-hover)",
    secondary:     "var(--color-secondary)",
    accent:        "var(--color-accent)",
    accentHover:   "var(--color-accent-hover)",
    bg:            "var(--color-bg)",
    bgSubtle:      "var(--color-bg-subtle)",
    bgMuted:       "var(--color-bg-muted)",
    surface:       "var(--color-surface)",
    border:        "var(--color-border)",
    borderStrong:  "var(--color-border-strong)",
    text:          "var(--color-text)",
    textMuted:     "var(--color-text-muted)",
    textSubtle:    "var(--color-text-subtle)",
    textInverse:   "var(--color-text-inverse)",
    success:       "var(--color-success)",
    warning:       "var(--color-warning)",
    error:         "var(--color-error)",
    info:          "var(--color-info)",
  },
  radius: {
    sm:   "var(--radius-sm)",
    md:   "var(--radius-md)",
    lg:   "var(--radius-lg)",
    xl:   "var(--radius-xl)",
    "2xl":"var(--radius-2xl)",
    full: "var(--radius-full)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
  },
  transition: {
    fast: "var(--transition-fast)",
    base: "var(--transition-base)",
    slow: "var(--transition-slow)",
  },
} as const;
