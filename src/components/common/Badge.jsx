/**
 * Badge component - standardized across the app
 * Uses CSS variables from App.css for consistent theming
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  const baseStyles = `
    inline-flex items-center gap-1
    rounded-full font-medium
    border whitespace-nowrap
  `;

  const variants = {
    default: `
      bg-[rgba(255,255,255,0.1)] 
      border-[var(--color-border)] 
      text-[var(--color-text-secondary)]
    `,
    primary: `
      bg-[rgba(59,130,246,0.15)] 
      border-[rgba(59,130,246,0.3)] 
      text-[var(--color-primary-300)]
    `,
    success: `
      bg-[rgba(16,185,129,0.15)] 
      border-[rgba(16,185,129,0.3)] 
      text-[var(--color-accent-300)]
    `,
    warning: `
      bg-[rgba(245,158,11,0.15)] 
      border-[rgba(245,158,11,0.3)] 
      text-amber-300
    `,
    danger: `
      bg-[rgba(239,68,68,0.15)] 
      border-[rgba(239,68,68,0.3)] 
      text-red-300
    `,
    info: `
      bg-[rgba(59,130,246,0.15)] 
      border-[rgba(59,130,246,0.3)] 
      text-[var(--color-primary-300)]
    `,
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
