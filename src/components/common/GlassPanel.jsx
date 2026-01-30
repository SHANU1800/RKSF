export const GlassPanel = ({
  children,
  className = '',
  rounded = '2xl',
  border = true,
  padding = '6',
  interactive = false,
}) => {
  return (
    <div
      className={`
        glass-panel rounded-${rounded} 
        ${border ? 'border border-white/5' : ''} 
        p-${padding}
        ${interactive ? 'hover:border-white/10 transition cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
