export const colors = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",

  background: "var(--color-bg)",
  surface: "var(--color-surface)",
  border: "var(--color-border)",

  text: {
    main: "var(--color-text-main)",
    sub: "var(--color-text-sub)",
    muted: "var(--color-text-muted)",
  },

  status: {
    planned: "var(--status-planned)",
    ongoing: "var(--status-ongoing)",
    completed: "var(--status-completed)",
  },

  light: {
    primary: "var(--color-primary-light)",
    secondary: "var(--color-secondary-light)",
    accent: "var(--color-accent-light)",
  },

  borderColors: {
    primary: "var(--color-primary-border)",
    secondary: "var(--color-secondary-border)",
    accent: "var(--color-accent-border)",
  },
} as const;
