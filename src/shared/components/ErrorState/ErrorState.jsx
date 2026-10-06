import './ErrorState.css';

function ErrorState({
  title = 'Something went wrong',
  message = 'We were unable to load this information. Please try again.',
  action,
  icon,
  className = '',
}) {
  const classes = [
    'error-state',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert">
      {icon && (
        <div className="error-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className="error-state__content">
        <h2 className="error-state__title">
          {title}
        </h2>

        {message && (
          <p className="error-state__message">
            {message}
          </p>
        )}

        {action && (
          <div className="error-state__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorState;