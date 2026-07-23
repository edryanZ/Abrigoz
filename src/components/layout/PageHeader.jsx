import "./PageHeader.css";

export default function PageHeader({
  greeting,
  title,
  subtitle,
  children,
}) {
  return (
    <header className="page-header">
      {greeting && (
        <span className="page-header__greeting">
          {greeting}
        </span>
      )}

      {title && (
        <h1 className="page-header__title">
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