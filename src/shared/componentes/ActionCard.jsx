import "./ActionCard.css";

export default function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  children,
}) {
  return (
    <article className="action-card">

      {icon && (
        <div className="action-card__icon">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="action-card__title">
          {title}
        </h3>
      )}

      {children ? (
        <div className="action-card__content">
          {children}
        </div>
      ) : (
        <p className="action-card__description">
          {description}
        </p>
      )}

      {buttonText && (
        <button
          className="action-card__button"
          onClick={onClick}
        >
          {buttonText}
        </button>
      )}

    </article>
  );
}