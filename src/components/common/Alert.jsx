export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
}) => {
  const typeStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
    error: 'bg-red-500/10 border-red-500/30 text-red-200',
  };

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  return (
    <div className={`glass-panel rounded-xl border p-4 ${typeStyles[type]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">{icons[type]}</span>
          <div>
            {title && <p className="font-semibold text-white">{title}</p>}
            {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-semibold px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              {action.label}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-lg opacity-60 hover:opacity-100 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
