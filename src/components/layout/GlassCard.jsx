import "./GlassCard.css";

export default function GlassCard({
  as: Component = "div",
  children,
  className = "",
  hover = true,
  onClick,
  ...props
}) {
  return (
    <Component
      className={`glass-card ${
        hover ? "glass-card--hover" : ""
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}