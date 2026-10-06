import './Select.css';

function Select({
  name,
  id,
  value,
  defaultValue,
  disabled = false,
  required = false,
  multiple = false,
  size,
  autoComplete,
  onChange,
  onBlur,
  onFocus,
  children,
  className = '',
  ...props
}) {
  const classes = ['select', className]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      multiple={multiple}
      size={size}
      autoComplete={autoComplete}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      className={classes}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;