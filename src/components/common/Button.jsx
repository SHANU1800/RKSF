/**
 * Button component - standardized across the app
 * Uses CSS variables from App.css for consistent theming
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-xl font-medium
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variants = {
    primary: `
      bg-[var(--color-primary-500)] text-white
      hover:bg-[var(--color-primary-600)]
      focus-visible:ring-[var(--color-primary-400)]
      shadow-sm hover:shadow-md
    `,
    accent: `
      bg-[var(--color-accent-500)] text-white
      hover:bg-[var(--color-accent-600)]
      focus-visible:ring-[var(--color-accent-400)]
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-[var(--color-accent-500)] text-white
      hover:bg-[var(--color-accent-600)]
      focus-visible:ring-[var(--color-accent-400)]
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-[var(--color-neutral-700)] text-[var(--color-text-primary)]
      hover:bg-[var(--color-neutral-600)]
      focus-visible:ring-[var(--color-neutral-500)]
      border border-[var(--color-border)]
    `,
    danger: `
      bg-[var(--color-error)] text-white
      hover:bg-red-600
      focus-visible:ring-red-400
      shadow-sm hover:shadow-md
    `,
    outline: `
      bg-transparent text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      hover:bg-white/5 hover:border-[var(--color-border-hover)]
      focus-visible:ring-[var(--color-primary-400)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-white/5 hover:text-[var(--color-text-primary)]
      focus-visible:ring-[var(--color-primary-400)]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
