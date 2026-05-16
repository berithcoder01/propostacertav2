const Input = ({
  label, value, onChange, type = 'text',
  placeholder, suffix, prefix, error, className = '', id, ...props
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label
        htmlFor={id}
        className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3.5 text-muted text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-base ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3.5 text-muted text-xs font-semibold pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
    {error && (
      <p className="text-danger text-xs font-medium">{error}</p>
    )}
  </div>
);

export default Input;
