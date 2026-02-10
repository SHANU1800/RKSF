export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className={`glass-panel rounded-xl sm:rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative border border-white/10 shadow-2xl animate-scale-in`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white shrink-0 w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>

        {title && (
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        )}

        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};












