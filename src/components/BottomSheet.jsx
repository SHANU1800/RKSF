import React from 'react';

export const BottomSheet = ({ isOpen, onClose, title, children, snapPoints = [0.5, 1] }) => {
  const [snap, setSnap] = React.useState(snapPoints[0]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden max-h-[90vh] bg-slate-900/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-2xl animate-scale-in"
        style={{
          height: `${snap * 100}vh`,
          transition: 'height 0.3s ease-out',
        }}
      >
        {/* Handle/Drag Indicator */}
        <div className="flex justify-center py-3 sticky top-0 bg-gradient-to-b from-slate-900 to-transparent">
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-8 overflow-y-auto max-h-[calc(100%-60px)]">
          {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
