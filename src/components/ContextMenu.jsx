import React from 'react';

export const ContextMenu = ({ isOpen, x, y, actions, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close on click */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Context Menu */}
      <div
        className="fixed z-50 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{
          left: `${x}px`,
          top: `${Math.min(y, window.innerHeight - 250)}px`,
          transform: 'translate(-50%, 0)',
          minWidth: '180px',
        }}
      >
        <div className="py-2 space-y-0">
          {actions && actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.onClick?.();
                onClose();
              }}
              className={`w-full px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-2 ${
                action.danger
                  ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              {action.icon && <span className="text-lg">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ContextMenu;
