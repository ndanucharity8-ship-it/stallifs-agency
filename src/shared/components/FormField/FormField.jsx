import './FormField.css';

function FormField({
  label,
  htmlFor,
  children,
  error,
  helpText,
  required = false,
  className = '',
}) {
  const classes = ['form-field', error ? 'form-field--error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="form-field__label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="form-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {helpText && !error && (
        <p className="form-field__help">{helpText}</p>
      )}

      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;