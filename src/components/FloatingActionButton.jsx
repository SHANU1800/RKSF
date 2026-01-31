import { useState } from 'react';
import './FloatingActionButton.css';

/**
 * FloatingActionButton - Mobile-optimized FAB with optional submenu
 * @param {Object} props
 * @param {string} props.icon - Main button icon/emoji
 * @param {Function} props.onClick - Main button click handler
 * @param {Array} props.actions - Optional submenu actions: [{label, icon, onClick}]
 * @param {boolean} props.show - Show/hide FAB
 * @param {string} props.position - 'bottom-right', 'bottom-left', etc
 * @param {Function} props.onHaptic - Haptic feedback callback
 */
const FloatingActionButton = ({
  icon = '➕',
  onClick,
  actions = [],
  show = true,
  position = 'bottom-right',
  onHaptic,
  label = 'Add',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
      onHaptic?.(20);
    } else {
      onClick?.();
      onHaptic?.(10);
    }
  };

  const handleActionClick = (action) => {
    action.onClick?.();
    setIsOpen(false);
    onHaptic?.(15);
  };

  if (!show) return null;

  return (
    <div className={`fab-container fab-${position}`}>
      {/* Backdrop for submenu */}
      {isOpen && (
        <div
          className="fab-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Submenu actions */}
      {actions.length > 0 && (
        <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              className="fab-action"
              onClick={() => handleActionClick(action)}
              title={action.label}
              style={{
                animationDelay: isOpen ? `${idx * 60}ms` : '0ms',
              }}
            >
              <span className="fab-action-icon">{action.icon}</span>
              <span className="fab-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        className={`fab-button ${isOpen ? 'open' : ''}`}
        onClick={handleMainClick}
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup={actions.length > 0}
      >
        <span className="fab-icon">{icon}</span>
      </button>
    </div>
  );
};

export default FloatingActionButton;
