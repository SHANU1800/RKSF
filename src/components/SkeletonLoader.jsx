import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl p-4 md:p-6 border border-white/5">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
                <div className="h-3 skeleton rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-4">
        <div className="h-12 skeleton rounded-xl" />
        <div className="h-12 skeleton rounded-xl" />
        <div className="h-12 skeleton rounded-xl" />
        <div className="h-32 skeleton rounded-xl" />
      </div>
    );
  }

  return <div className="h-40 skeleton rounded-2xl" />;
};

export default SkeletonLoader;












