import { useState, useCallback } from 'react';
import './SmartNotifications.css';

/**
 * SmartNotifications - Groups notifications by type with badges
 * Features:
 * - Badge counts for each notification type
 * - Group notifications by category
 * - Expandable/collapsible groups
 * - Quick dismiss
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
    <div className="smart-notifications">
      {Object.entries(groupedNotifications).map(([type, notifs]) => (
        <div key={type} className="notification-group">
          <button
            className="group-header"
            onClick={() => toggleGroup(type)}
            aria-expanded={expandedGroups.has(type)}
          >
            <span className="group-icon">
              {type === 'order' && '📦'}
              {type === 'payment' && '💳'}
              {type === 'message' && '💬'}
              {type === 'alert' && '⚠️'}
              {type === 'success' && '✅'}
              {type === 'info' && 'ℹ️'}
            </span>
            <span className="group-label">{type.toUpperCase()}</span>
            <span className="group-badge">{notifs.length}</span>
          </button>

          {expandedGroups.has(type) && (
            <div className="group-items">
              {notifs.slice(0, maxVisible).map((notif, idx) => (
                <div key={idx} className={`notification-item notif-${type}`}>
                  <span className="notif-icon">{notif.icon}</span>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    {notif.message && <div className="notif-message">{notif.message}</div>}
                  </div>
                  <button
                    className="notif-close"
                    onClick={() => onDismiss?.(notif.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))}
              {notifs.length > maxVisible && (
                <div className="notif-more">
                  +{notifs.length - maxVisible} more
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {notifications.length > 0 && (
        <button className="clear-all-btn" onClick={onClear}>
          Clear All
        </button>
      )}
    </div>
  );
};

export default SmartNotifications;












