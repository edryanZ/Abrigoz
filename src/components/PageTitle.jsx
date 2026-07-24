import "./PageTitle.css";

export default function PageTitle({
  children,
  subtitle,
  align = "left",
  className = "",
  as: Title = "h2",
}) {
  return (
    <div
      className={[
        "page-title",
        `page-title--${align}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Title className="page-title__title">
        {children}
      </Title>

      {subtitle && (
        <p className="page-title__subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}