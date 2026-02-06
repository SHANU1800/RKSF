import { CheckCircleIcon, CloseIcon, RefreshIcon, InfoIcon } from './icons/IconTypes';

const ToastIcon = ({ type }) => {
  const iconProps = { size: 18, className: 'shrink-0' };
  switch (type) {
    case 'success': return <CheckCircleIcon {...iconProps} />;
    case 'error': return <CloseIcon {...iconProps} />;
    case 'warning':
    case 'retry': return <RefreshIcon {...iconProps} />;
    default: return <InfoIcon {...iconProps} />;
  }
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const bgColor = {
    success: 'bg-emerald-500/15 border-emerald-400/60 text-emerald-50',
    error: 'bg-rose-500/15 border-rose-400/60 text-rose-50',
    warning: 'bg-amber-400/15 border-amber-300/60 text-amber-50',
    retry: 'bg-amber-500/15 border-amber-400/70 text-amber-50',
    info: 'bg-sky-500/15 border-sky-400/60 text-sky-50',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-xl border ${bgColor[type] || bgColor.info} shadow-xl backdrop-blur-lg z-999 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 flex items-center gap-2">
          <ToastIcon type={type} />
          <p className="font-semibold">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition"
          aria-label="Close notification"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-999">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};












