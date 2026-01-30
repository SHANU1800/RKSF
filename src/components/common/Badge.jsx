export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'rounded-full font-semibold text-xs uppercase tracking-wide';

  const variants = {
    default: 'bg-white/5 border border-white/10 text-gray-300',
    success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200',
    warning: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-200',
    info: 'bg-blue-500/10 border border-blue-500/30 text-blue-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
