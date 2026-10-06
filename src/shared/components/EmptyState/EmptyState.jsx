import './EmptyState.css';

function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  icon,
  className = '',
}) {
  const classes = [
    'empty-state',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className="empty-state__content">
        <h2 className="empty-state__title">
          {title}
        </h2>

        {message && (
          <p className="empty-state__message">
            {message}
          </p>
        )}

        {action && (
          <div className="empty-state__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;