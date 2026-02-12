import { StarIcon, EditIcon, TrashIcon } from '../icons/IconTypes';

export const ReviewCard = ({
  review,
  onEdit,
  onDelete,
}) => {
  const rating = review.rating ?? 5;

  return (
    <div className="glass-panel card-premium rounded-2xl border border-white/10 hover:border-[#00f0ff]/30 overflow-hidden card-hover group relative aspect-[4/3] flex flex-col transition-all">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="h-[40%] flex items-center justify-center bg-gradient-to-b from-[#00f0ff]/10 to-transparent border-b border-white/10">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} size={24} filled={i < Math.round(rating)} className={i < Math.round(rating) ? 'text-[#00f0ff]' : 'text-gray-600'} />
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col relative z-10">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 flex-1">
            {review.serviceTitle || 'Service'}
          </h4>
          <span className="text-xs text-gray-500 shrink-0">
            {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-3 flex-1">
          {review.text || 'No comment provided'}
        </p>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <EditIcon size={14} /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <TrashIcon size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
