export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="animate-spin h-full w-full">
        <div className="h-full w-full border-4 border-white/20 border-t-blue-500 rounded-full" />
      </div>
    </div>
  );
};












