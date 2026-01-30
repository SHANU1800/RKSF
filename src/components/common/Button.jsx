export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'rounded-xl font-semibold transition disabled:opacity-60';
  
  const variants = {
    primary: 'bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25',
    success: 'bg-linear-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/25',
    secondary: 'bg-white/10 border border-white/10 text-white hover:bg-white/15',
    danger: 'bg-linear-to-r from-rose-500 to-red-600 text-white hover:shadow-lg hover:shadow-rose-500/25',
    outline: 'border border-white/10 text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
