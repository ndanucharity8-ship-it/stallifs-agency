import './Form.css';

function Form({
  children,
  onSubmit,
  className = '',
  noValidate = true,
}) {
  const classes = ['form', className]
    .filter(Boolean)
    .join(' ');

  return (
    <form
      className={classes}
      onSubmit={onSubmit}
      noValidate={noValidate}
    >
      {children}
    </form>
  );
}

export default Form;