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
      gradient: 'bg-[#00f0ff]/10',
      accent: 'bg-[#00f0ff]',
      iconBg: 'bg-[#00f0ff]/20',
      iconColor: 'text-[#00f0ff]'
    },
    message: { 
      gradient: 'bg-purple-500/10',
      accent: 'bg-purple-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    promo: { 
      gradient: 'bg-cyan-500/10',
      accent: 'bg-cyan-500',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-[#00f0ff]'
    },
    alert: { 
      gradient: 'bg-yellow-500/10',
      accent: 'bg-yellow-500',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
  };

  const icons = {
    order: <PackageIcon size={28} />,
    message: <MessageIcon size={28} />,
    promo: <SparklesIcon size={28} />,
    alert: <AlertCircleIcon size={28} />,
  };

  const style = typeStyles[notification.type] || typeStyles.order;
  const isRead = notification.read;

  return (
    <div
      className={`glass-panel card-premium rounded-2xl border overflow-hidden card-hover group relative aspect-[4/3] flex flex-col transition-all ${
        isRead ? 'border-white/10' : 'border-white/20'
      }`}
    >
      {/* Gradient accent line - only when unread */}
      {!isRead && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
      )}
      
      {/* Background glow - only when unread */}
      {!isRead && (
        <div className={`absolute inset-0 ${style.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none`} />
      )}
      
      {/* Icon Section - 40% height */}
      <div className={`h-[40%] flex items-center justify-center ${style.gradient} border-b border-white/10 relative`}>
        <div className={`w-16 h-16 rounded-2xl ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
          {icons[notification.type]}
        </div>
        {!isRead && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Content - 60% height */}
      <div className="flex-1 p-4 flex flex-col relative z-10">
        {/* Title */}
        <h4 className="text-base font-bold text-white leading-tight mb-2 line-clamp-2">
          {notification.title}
        </h4>

        {/* Message */}
        <p className="text-xs text-gray-300 mb-2 line-clamp-2 flex-1">
          {notification.message}
        </p>

        {/* Time */}
        <span className="text-xs text-gray-500 mb-3">
          {new Date(notification.timestamp || Date.now()).toLocaleString('en-IN', {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'short'
          })}
        </span>

        {/* Action buttons - Compact */}
        <div className="flex gap-2">
          {onAction && (
            <button
              onClick={onAction}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#00f0ff] to-cyan-600 hover:from-cyan-600 hover:to-[#00f0ff] text-black text-xs font-bold transition-all active:scale-95"
            >
              View
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all active:scale-95"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};












