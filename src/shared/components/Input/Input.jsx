import './Input.css';

function Input({
  type = 'text',
  name,
  id,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  autoComplete,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  onChange,
  onBlur,
  onFocus,
  className = '',
  ...props
}) {
  const classes = ['input', className]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      autoComplete={autoComplete}
      min={min}
      max={max}
      step={step}
      minLength={minLength}
      maxLength={maxLength}
      pattern={pattern}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      className={classes}
      {...props}
    />
  );
}

export default Input;