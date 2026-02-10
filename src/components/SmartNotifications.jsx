import { useState, useCallback } from 'react';

const TYPE_BORDERS = { order: 'border-l-[#3b82f6]', payment: 'border-l-[#10b981]', message: 'border-l-[#8b5cf6]', alert: 'border-l-[#f59e0b]', success: 'border-l-[#06b6d4]', info: 'border-l-[#00f0ff]' };

/**
 * SmartNotifications - Groups notifications by type with badges
 */
const SmartNotifications = ({
  notifications = [],
  onDismiss,
  onClear,
  maxVisible = 3,
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group notifications by type
  const groupedNotifications = notifications.reduce((groups, notif) => {
    const type = notif.type || 'info';
    if (!groups[type]) groups[type] = [];
    groups[type].push(notif);
    return groups;
  }, {});

  const toggleGroup = useCallback((type) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="p-4 flex flex-col gap-3 md:p-4 sm:p-3 sm:gap-2 max-[480px]:p-3 max-[480px]:gap-2">
      {Object.entries(groupedNotifications).map(([type, notifs]) => (
        <div key={type} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            className="w-full px-4 py-3 flex items-center gap-3 bg-white/[0.08] border-none text-white text-sm font-semibold cursor-pointer transition-colors duration-200 active:bg-white/[0.12] select-none touch-manipulation"
            onClick={() => toggleGroup(type)}
            aria-expanded={expandedGroups.has(type)}
          >
            <span className="text-xl">{type === 'order' && '📦'}{type === 'payment' && '💳'}{type === 'message' && '💬'}{type === 'alert' && '⚠️'}{type === 'success' && '✅'}{type === 'info' && 'ℹ️'}</span>
            <span className="flex-1 text-left">{type.toUpperCase()}</span>
            <span className="min-w-6 h-6 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-full text-xs font-bold">{notifs.length}</span>
          </button>

          {expandedGroups.has(type) && (
            <div className="flex flex-col max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
              {notifs.slice(0, maxVisible).map((notif, idx) => (
                <div key={idx} className={`px-4 py-3 flex items-start gap-3 border-t border-white/5 transition-colors cursor-pointer hover:bg-white/5 active:bg-white/10 border-l-4 ${TYPE_BORDERS[type] || TYPE_BORDERS.info} max-[480px]:px-3 max-[480px]:py-2.5 max-[480px]:gap-2`}>
                  <span className="text-xl shrink-0 mt-0.5">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold mb-1">{notif.title}</div>
                    {notif.message && <div className="text-white/70 text-[0.8125rem] leading-snug line-clamp-2">{notif.message}</div>}
                  </div>
                  <button
                    className="shrink-0 w-8 h-8 flex items-center justify-center bg-transparent border-none text-white/50 text-2xl cursor-pointer rounded-md transition-all active:bg-white/10 active:text-white select-none touch-manipulation max-[480px]:w-7 max-[480px]:h-7 max-[480px]:text-xl"
                    onClick={() => onDismiss?.(notif.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))}
              {notifs.length > maxVisible && (
                <div className="py-2 px-4 text-white/50 text-xs text-center border-t border-white/5">+{notifs.length - maxVisible} more</div>
              )}
            </div>
          )}
        </div>
      ))}

      {notifications.length > 0 && (
        <button className="mt-2 py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm font-semibold cursor-pointer transition-all active:bg-red-500/20 active:scale-[0.98] select-none touch-manipulation" onClick={onClear}>
          Clear All
        </button>
      )}
    </div>
  );
};

export default SmartNotifications;












