import "./GlassCard.css";

import { forwardRef } from "react";

const GlassCard = forwardRef(function GlassCard(
  {
    as: Component = "div",
    children,
    className = "",
    hover = true,
    role,
    tabIndex,
    onClick,
    ...props
  },
  ref
) {
  const classes = [
    "glass-card",
    hover && "glass-card--hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      ref={ref}
      className={classes}
      role={role}
      tabIndex={
        tabIndex ?? (typeof onClick === "function" ? 0 : undefined)
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
});

export default GlassCard;