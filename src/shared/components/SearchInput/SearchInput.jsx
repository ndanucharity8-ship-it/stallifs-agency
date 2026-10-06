import { Search, X } from 'lucide-react';
import './SearchInput.css';

function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  name = 'search',
  id = 'search',
  disabled = false,
  className = '',
}) {
  const classes = [
    'search-input',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    if (onChange) {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }
  };

  return (
    <div className={classes}>
      <Search
        className="search-input__icon"
        size={19}
        aria-hidden="true"
      />

      <input
        id={id}
        name={name}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-label={placeholder}
      />

      {value && !disabled && (
        <button
          type="button"
          className="search-input__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;