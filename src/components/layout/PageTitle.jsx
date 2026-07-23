import "./PageTitle.css";

export default function PageTitle({
  children,
  subtitle,
  align = "left",
}) {
  return (
    <div className={`page-title page-title--${align}`}>
      <h2 className="page-title__title">
        {children}
      </h2>

      {subtitle && (
        <p className="page-title__subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}