const Button = ({
  children, onClick, variant = 'primary',
  size = 'md', disabled, loading, className = '', type = 'button', ...props
}) => {
  const base = `inline-flex items-center justify-center gap-2 font-semibold
    rounded-2xl transition-all duration-200 active:scale-[0.97]
    disabled:opacity-40 disabled:cursor-not-allowed select-none`;

  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white shadow-glow-sm',
    ghost:   'bg-white/5 hover:bg-white/8 text-text-secondary hover:text-text-primary border border-border',
    danger:  'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
    gold:    'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base',
    xl: 'w-full py-4 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}>
      {loading && (
        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current
          rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
