import './Textarea.css';

function Textarea({
  name,
  id,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  rows = 5,
  cols,
  autoComplete,
  minLength,
  maxLength,
  wrap = 'soft',
  onChange,
  onBlur,
  onFocus,
  className = '',
  ...props
}) {
  const classes = ['textarea', className]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      rows={rows}
      cols={cols}
      autoComplete={autoComplete}
      minLength={minLength}
      maxLength={maxLength}
      wrap={wrap}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      className={classes}
      {...props}
    />
  );
}

export default Textarea;