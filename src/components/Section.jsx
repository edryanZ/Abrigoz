import "./Section.css";

export default function Section({
  as: Component = "section",
  children,
  title,
  subtitle,
  align = "left",
  layout = "stack",
  className = "",
  id,
  ...props
}) {
  const classes = [
    "section",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      id={id}
      className={classes}
      {...props}
    >
      {(title || subtitle) && (
        <div
          className={`section__header section__header--${align}`}
        >
          {title && (
            <h2 className="section__title">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="section__subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        className={`section__content section__content--${layout}`}
      >
        {children}
      </div>
    </Component>
  );
}