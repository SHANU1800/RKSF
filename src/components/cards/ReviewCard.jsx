import { Button } from '../common/Button';

export const ReviewCard = ({
  review,
  onEdit,
  onDelete,
}) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-[#F7D047]' : 'text-gray-600'} style={{fontSize: '1.5rem'}}>
        ★
      </span>
    ));
  };

  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#F7D047]/30 overflow-hidden card-hover group relative aspect-4/3 flex flex-col transition-all">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7D047] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[#F7D047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Stars Display - 40% height */}
      <div className="h-[40%] flex items-center justify-center bg-gradient-to-b from-[#F7D047]/10 to-transparent border-b border-white/10">
        <div className="flex gap-1">
          {renderStars(review.rating || 5)}
        </div>
      </div>

      {/* Content - 60% height */}
      <div className="flex-1 p-4 flex flex-col relative z-10">
        {/* Service Title & Date */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 flex-1">
            {review.serviceTitle || 'Service'}
          </h4>
          <span className="text-xs text-gray-500 shrink-0">
            {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short'
            })}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-3 flex-1">
          {review.text || 'No comment provided'}
        </p>

        {/* Action buttons - Compact */}
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#F7D047] to-yellow-500 hover:from-yellow-500 hover:to-[#F7D047] text-black text-xs font-bold transition-all active:scale-95"
            >
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-all active:scale-95"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};












