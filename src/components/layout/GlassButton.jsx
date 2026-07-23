import "./GlassButton.css";
import { forwardRef } from "react";

const GlassButton = forwardRef(function GlassButton(
  {
    children,
    type = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    disabled = false,
    className = "",
    onClick,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        "glass-button",
        `glass-button--${variant}`,
        `glass-button--${size}`,
        fullWidth ? "glass-button--full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

export default GlassButton;