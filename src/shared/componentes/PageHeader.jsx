import "./PageHeader.css";

export default function PageHeader({
  greeting,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <header
      className={`page-header ${className}`.trim()}
      aria-labelledby="page-header-title"
    >
      {greeting && (
        <span className="page-header__greeting">
          {greeting}
        </span>
      )}

      {title && (
        <h1
          id="page-header-title"
          className="page-header__title"
        >
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="page-header__subtitle">
          {subtitle}
        </p>
      )}

      {children && (
        <div className="page-header__actions">
          {children}
        </div>
      )}
    </header>
  );
}