import './Button.css';

function Button({
children,
variant = 'primary',
size = 'medium',
type = 'button',
disabled = false,
loading = false,
fullWidth = false,
onClick,
className = '',
...props
}) {
const classes = [
'button',
`button--${variant}`,
`button--${size}`,
fullWidth ? 'button--full-width' : '',
className,
]
.filter(Boolean)
.join(' ');

const isDisabled = disabled || loading;

return (
<button
type={type}
className={classes}
disabled={isDisabled}
onClick={onClick}
aria-busy={loading || undefined}
{...props}
>
{loading ? (
<> <span
         className="button__spinner"
         aria-hidden="true"
       /> <span>Loading...</span>
</>
) : (
children
)} </button>
);
}

export default Button;
