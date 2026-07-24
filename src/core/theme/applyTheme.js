export default function applyTheme(theme) {
  if (!theme) return;

  const root = document.documentElement;

  const { colors } = theme;

  root.style.setProperty(
    "--text-primary",
    colors.textPrimary
  );

  root.style.setProperty(
    "--text-secondary",
    colors.textSecondary
  );

  root.style.setProperty(
    "--background",
    colors.background
  );

  root.style.setProperty(
    "--surface",
    colors.surface
  );

  root.style.setProperty(
    "--surface-strong",
    colors.surfaceStrong
  );

  root.style.setProperty(
    "--card-bg",
    colors.card
  );

  root.style.setProperty(
    "--card-hover",
    colors.cardHover
  );

  root.style.setProperty(
    "--border-color",
    colors.border
  );

  root.style.setProperty(
    "--accent",
    colors.accent
  );

  root.style.setProperty(
    "--accent-hover",
    colors.accentHover
  );

  root.style.setProperty(
    "--shadow",
    colors.shadow
  );

  root.style.setProperty(
    "--divider",
    colors.divider
  );
}