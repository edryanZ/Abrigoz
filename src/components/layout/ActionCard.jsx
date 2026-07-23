import "./ActionCard.css";

import { GlassCard, GlassButton } from ".";

export default function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  children,
}) {
  return (
    <GlassCard className="action-card">
      {icon && (
        <div className="action-card__icon">
          {icon}
        </div>
      )}

      <div className="action-card__content">
        <h3 className="action-card__title">
          {title}
        </h3>

        {description && (
          <p className="action-card__description">
            {description}
          </p>
        )}

        {children}
      </div>

      {buttonText && (
        <GlassButton
          fullWidth
          onClick={onClick}
        >
          {buttonText}
        </GlassButton>
      )}
    </GlassCard>
  );
}