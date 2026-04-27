export const designTokens = {
  colors: {
    primary: {
      DEFAULT: "oklch(0.48 0.15 148)",
      foreground: "oklch(0.98 0 0)",
    },
    secondary: {
      DEFAULT: "oklch(0.55 0.18 200)",
      foreground: "oklch(0.98 0 0)",
    },
    success: {
      DEFAULT: "oklch(0.65 0.19 145)",
      foreground: "oklch(0.98 0 0)",
    },
    warning: {
      DEFAULT: "oklch(0.75 0.18 85)",
      foreground: "oklch(0.25 0 0)",
    },
    destructive: {
      DEFAULT: "oklch(0.60 0.22 25)",
      foreground: "oklch(0.98 0 0)",
    },
    background: "oklch(0.99 0 0)",
    foreground: "oklch(0.15 0 0)",
    card: {
      DEFAULT: "oklch(1 0 0)",
      foreground: "oklch(0.15 0 0)",
    },
    muted: {
      DEFAULT: "oklch(0.96 0 0)",
      foreground: "oklch(0.45 0 0)",
    },
    accent: {
      DEFAULT: "oklch(0.96 0 0)",
      foreground: "oklch(0.15 0 0)",
    },
    border: "oklch(0.92 0 0)",
    input: "oklch(0.92 0 0)",
    ring: "oklch(0.48 0.15 148)",
    chart: {
      1: "oklch(0.48 0.15 148)",
      2: "oklch(0.55 0.18 200)",
      3: "oklch(0.65 0.19 145)",
      4: "oklch(0.75 0.18 85)",
      5: "oklch(0.60 0.22 25)",
    },
  },
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  borderRadius: {
    sm: "calc(var(--radius) * 0.6)",
    md: "calc(var(--radius) * 0.8)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) * 1.4)",
    "2xl": "calc(var(--radius) * 1.8)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  animations: {
    transitionFast: "150ms",
    transitionNormal: "200ms",
    transitionSlow: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type DesignTokens = typeof designTokens;