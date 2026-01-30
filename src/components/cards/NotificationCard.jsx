export const NotificationCard = ({
  notification,
  onDismiss,
  onAction,
}) => {
  const typeStyles = {
    order: 'border-blue-500/30 bg-blue-500/10',
    message: 'border-purple-500/30 bg-purple-500/10',
    promo: 'border-emerald-500/30 bg-emerald-500/10',
    alert: 'border-yellow-500/30 bg-yellow-500/10',
  };

  const icons = {
    order: '📦',
    message: '💬',
    promo: '🎉',
    alert: '⚠️',
  };

  return (
    <div
      className={`glass-panel rounded-2xl border p-4 cursor-pointer transition ${
        notification.read ? 'border-white/5 bg-white/5' : typeStyles[notification.type]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl">{icons[notification.type]}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold">{notification.title}</p>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
            <p className="text-gray-500 text-xs mt-2">
              {new Date(notification.timestamp || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {notification.action && onAction && (
            <button
              onClick={() => onAction(notification)}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
            >
              {notification.action}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(notification.id)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
