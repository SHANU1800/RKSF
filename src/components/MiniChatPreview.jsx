import React from 'react';

export const MiniChatPreview = ({ message, isVisible, onExpand, onDismiss }) => {
  if (!isVisible || !message) return null;

  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss, message]);

  return (
    <div className="fixed bottom-24 left-2 right-2 sm:hidden z-40 animate-slide-up">
      <div className="bg-[#F7D047] rounded-xl p-3 shadow-lg border border-[#0a0a0a]/30">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {message.from?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{message.from}</p>
              <p className="text-xs text-white/90 truncate">{message.text}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-[#F7D047] hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
        <button
          onClick={onExpand}
          className="w-full px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
        >
          💬 Reply
        </button>
      </div>
    </div>
  );
};

export default MiniChatPreview;












