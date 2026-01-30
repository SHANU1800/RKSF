export const Pill = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-white/5 border-white/10 text-gray-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
    danger: 'bg-red-500/10 border-red-500/30 text-red-200',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
  };

  return (
    <span
      className={`
        inline-block px-3 py-1.5 rounded-full text-sm font-semibold
        border text-xs uppercase tracking-wider
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};
