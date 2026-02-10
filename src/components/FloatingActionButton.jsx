import { useState } from 'react';

const POSITION_CLASSES = {
  'bottom-right': 'fixed bottom-6 right-6 gap-4 md:bottom-6 md:right-6 sm:bottom-4 sm:right-4',
  'bottom-left': 'fixed bottom-6 left-6 gap-4 sm:bottom-4 sm:left-4',
  'top-right': 'fixed top-6 right-6 gap-4',
  'top-left': 'fixed top-6 left-6 gap-4',
};

/**
 * FloatingActionButton - Mobile-optimized FAB with optional submenu (cyan theme)
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
    <div className={`fixed z-50 flex flex-col items-center justify-center ${POSITION_CLASSES[position]}`}>
      {isOpen && (
        <div className="fixed inset-0 z-[-1] cursor-default" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {actions.length > 0 && (
        <div className={`flex flex-col gap-3 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm cursor-pointer select-none touch-manipulation whitespace-nowrap transition-all active:scale-95 hover:bg-black/90 hover:border-white/20 animate-slide-up sm:px-3 sm:py-2.5 sm:text-[0.8125rem] max-[320px]:w-10 max-[320px]:h-10 max-[320px]:p-0 max-[320px]:rounded-full max-[320px]:justify-center max-[320px]:gap-0 max-[320px]:[&>span:last-child]:hidden"
              onClick={() => handleActionClick(action)}
              title={action.label}
              style={{ animationDelay: isOpen ? `${idx * 60}ms` : '0ms' }}
            >
              <span className="text-xl flex items-center justify-center sm:text-lg">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer select-none touch-manipulation transition-all duration-300 active:scale-95 sm:w-[52px] sm:h-[52px] sm:text-[1.375rem] max-[320px]:w-12 max-[320px]:h-12 max-[320px]:text-xl md:hover:-translate-y-1 ${
          isOpen
            ? 'rotate-45 bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30'
            : 'bg-gradient-to-br from-[#00f0ff] to-[#00b8cc] shadow-lg shadow-[#00f0ff]/40 hover:shadow-[#00f0ff]/50 text-black'
        }`}
        onClick={handleMainClick}
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup={actions.length > 0}
      >
        {icon}
      </button>
    </div>
  );
};

export default FloatingActionButton;












