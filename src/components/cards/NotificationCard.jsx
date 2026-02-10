import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PackageIcon, MessageIcon, SparklesIcon, AlertCircleIcon } from '../icons/IconTypes';

export const NotificationCard = ({
  notification,
  onDismiss,
  onAction,
}) => {
  const typeStyles = {
    order: { 
      border: 'border-[#0a0a0a]/30', 
      bg: 'bg-[#0a0a0a]/10',
      gradient: 'bg-[#F7D047]/5',
      accent: 'bg-[#F7D047]'
    },
    message: { 
      border: 'border-purple-500/30', 
      bg: 'bg-purple-500/10',
      gradient: 'bg-purple-500/5',
      accent: 'bg-purple-500'
    },
    promo: { 
      border: 'border-[#0a0a0a]/30', 
      bg: 'bg-[#0a0a0a]/10',
      gradient: 'bg-[#F7D047]/5',
      accent: 'bg-[#F7D047]'
    },
    alert: { 
      border: 'border-yellow-500/30', 
      bg: 'bg-yellow-500/10',
      gradient: 'bg-yellow-500/5',
      accent: 'bg-yellow-500'
    },
  };

  const icons = {
    order: <PackageIcon size={22} />,
    message: <MessageIcon size={22} />,
    promo: <SparklesIcon size={22} />,
    alert: <AlertCircleIcon size={22} />,
  };

  const style = typeStyles[notification.type] || typeStyles.order;
  const isRead = notification.read;

  return (
    <div
      className={`glass-panel card-premium rounded-2xl border p-5 sm:p-6 cursor-pointer transition-all card-hover group relative overflow-hidden lg:aspect-[4/3] flex flex-col ${
        isRead ? 'border-white/10 bg-white/5' : `${style.border} ${style.bg}`
      }`}
    >
      {/* Gradient accent line */}
      {!isRead && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent} opacity-60`} />
      )}
      
      {/* Background glow */}
      {!isRead && (
        <div className={`absolute inset-0 ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/50 border border-white/10 text-[#00f0ff] shrink-0">
              {icons[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {notification.title}
                </h4>
                {!isRead && (
                  <Badge variant="primary" size="sm" className="shrink-0">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3">
                {notification.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-white/5 rounded-lg px-2 py-1">
                  {new Date(notification.timestamp || Date.now()).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {notification.action && onAction && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAction(notification)}
                className="whitespace-nowrap font-semibold"
              >
                {notification.action}
              </Button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-400 hover:text-white transition-all"
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};












