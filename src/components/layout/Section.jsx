import "./Section.css";

export default function Section({
  children,
  title,
  subtitle,
  align = "left",
  layout = "stack",
  className = "",
}) {
  return (
    <section className={`section ${className}`}>
      {(title || subtitle) && (
        <div className={`section__header section__header--${align}`}>
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
    </section>
  );
}