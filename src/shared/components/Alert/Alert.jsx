import './Alert.css';

function Alert({
  children,
  type = 'info',
  title,
  onClose,
  className = '',
}) {
  const classes = [
    'alert',
    `alert--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role={type === 'danger' ? 'alert' : 'status'}
    >
      <div className="alert__content">
        {title && (
          <strong className="alert__title">
            {title}
          </strong>
        )}

        <div className="alert__message">
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;