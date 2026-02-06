export const Pill = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-white/5 border-white/10 text-gray-300',
    success: 'bg-[#0a0a0a]/20 border-[#0a0a0a]/30 text-white',
    warning: 'bg-[#F7D047]/20 border-[#F7D047]/30 text-black',
    danger: 'bg-red-500/10 border-red-500/30 text-red-200',
    info: 'bg-[#0a0a0a]/20 border-[#0a0a0a]/30 text-white',
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












