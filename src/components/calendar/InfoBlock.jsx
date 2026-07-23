import "./InfoBlock.css";

export default function InfoBlock({
  icon,
  title,
  children,
}) {
  if (!children) return null;

  return (
    <section className="info-block">
      <div className="info-block-header">
        <span
          className="info-block-icon"
          aria-hidden="true"
        >
          {icon}
        </span>

        <h3 className="info-block-title">
          {title}
        </h3>
      </div>

      <div className="info-block-content">
        {children}
      </div>
    </section>
  );
}